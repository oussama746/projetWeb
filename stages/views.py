from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import CreateView, ListView, DetailView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from django.urls import reverse_lazy
from .models import StageOffer, Candidature, StudentProfile
from .forms import StageOfferForm, StageOfferFormAuthenticated, StudentProfileForm, CustomUserCreationForm
import json
import csv
from django.http import HttpResponse
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth.models import User, Group
from django.contrib import messages

# Helper function for home page
def home(request):
    return render(request, 'home.html')

# Helper functions for permissions
def is_responsable(user):
    return user.groups.filter(name='Responsable').exists() or user.is_superuser

def is_etudiant(user):
    return user.groups.filter(name='Etudiant').exists() or user.is_superuser

def is_admin(user):
    return user.groups.filter(name='Administrateur').exists() or user.is_superuser

def is_company(user):
    # On considère qu'un user est une entreprise s'il est dans le groupe 'Entreprise' 
    # ou simplement s'il n'est ni étudiant ni responsable ni admin (pour simplifier si pas de groupe)
    # Ici, soyons stricts : on va créer le groupe Entreprise plus tard.
    return user.groups.filter(name='Entreprise').exists() or user.is_superuser

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            role = form.cleaned_data.get('role')
            
            if role == 'entreprise':
                group, created = Group.objects.get_or_create(name='Entreprise')
                user.groups.add(group)
                messages.success(request, 'Compte Entreprise créé avec succès !')
            else:
                # Par défaut Etudiant
                group, created = Group.objects.get_or_create(name='Etudiant')
                user.groups.add(group)
                messages.success(request, 'Compte Étudiant créé avec succès !')
            
            return redirect('login')
    else:
        form = CustomUserCreationForm()
    return render(request, 'registration/register.html', {'form': form})

# 2.1 Vue pour l'Entreprise (Dépôt)
class CompanyOfferCreateView(LoginRequiredMixin, CreateView):
    model = StageOffer
    form_class = StageOfferFormAuthenticated
    template_name = 'stages/company_offer_create.html'
    success_url = reverse_lazy('company_success')

    def form_valid(self, form):
        form.instance.state = 'En attente validation'
        # Lier l'offre à l'utilisateur connecté (Entreprise)
        form.instance.company = self.request.user
        form.instance.organisme = self.request.user.username # Optionnel: utiliser le nom d'utilisateur comme nom d'entreprise
        return super().form_valid(form)

# Vue Tableau de bord Entreprise
class CompanyDashboardView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = StageOffer
    template_name = 'stages/company_dashboard.html'
    context_object_name = 'offers'

    def test_func(self):
        return is_company(self.request.user)

    def get_queryset(self):
        # Ne montrer que les offres de CETTE entreprise
        return StageOffer.objects.filter(company=self.request.user).order_by('-date_depot')

# Vue pour voir les candidats d'une offre (Entreprise)
class CompanyOfferCandidatesView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Candidature
    template_name = 'stages/company_offer_candidates.html'
    context_object_name = 'candidates'

    def test_func(self):
        # L'utilisateur doit être une entreprise ET être le propriétaire de l'offre
        offer = get_object_or_404(StageOffer, pk=self.kwargs['pk'])
        return is_company(self.request.user) and offer.company == self.request.user

    def get_queryset(self):
        self.offer = get_object_or_404(StageOffer, pk=self.kwargs['pk'])
        return Candidature.objects.filter(offer=self.offer).order_by('date_candidature')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['offer'] = self.offer
        return context

# Action pour accepter/refuser un candidat
@login_required
@user_passes_test(is_company)
def company_candidate_action(request, pk, action):
    candidature = get_object_or_404(Candidature, pk=pk)
    
    # Sécurité : Vérifier que l'offre appartient bien à l'entreprise connectée
    if candidature.offer.company != request.user:
        messages.error(request, "Accès non autorisé.")
        return redirect('home')

    if action == 'accept':
        candidature.status = 'Acceptée'
        messages.success(request, f"Candidature de {candidature.student.username} acceptée !")
    elif action == 'reject':
        candidature.status = 'Refusée'
        messages.warning(request, f"Candidature de {candidature.student.username} refusée.")
    
    candidature.save()
    return redirect('company_offer_candidates', pk=candidature.offer.pk)

def company_success(request):
    return render(request, 'stages/company_success.html')

# 2.2 Vues pour le Responsable de Stage
class ManagerOfferListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = StageOffer
    template_name = 'stages/manager_offer_list.html'
    context_object_name = 'offers'

    def test_func(self):
        return is_responsable(self.request.user)

    def get_queryset(self):
        qs = StageOffer.objects.filter(state='En attente validation')
        q = self.request.GET.get('q')
        if q:
            qs = qs.filter(title__icontains=q) | qs.filter(description__icontains=q)
        return qs

class ManagerOfferDetailView(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    model = StageOffer
    template_name = 'stages/manager_offer_detail.html'

    def test_func(self):
        return is_responsable(self.request.user)

@login_required
def validate_or_refuse_offer(request, pk, action):
    if not request.user.is_staff:
        messages.error(request, "Seuls les administrateurs peuvent valider ou refuser les offres.")
        return redirect('home')
    
    offer = get_object_or_404(StageOffer, pk=pk)
    if action == 'validate':
        offer.state = 'Validée'
        messages.success(request, f"Offre '{offer.title}' validée avec succès!")
    elif action == 'refuse':
        offer.state = 'Refusée'
        messages.warning(request, f"Offre '{offer.title}' refusée.")
    offer.save()
    return redirect('manager_offer_list')

# 2.3 Vues pour l'Étudiant
class StudentOfferListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = StageOffer
    template_name = 'stages/student_offer_list.html'
    context_object_name = 'offers'

    def test_func(self):
        return is_etudiant(self.request.user)

    def get_queryset(self):
        qs = StageOffer.objects.filter(state='Validée')
        q = self.request.GET.get('q')
        if q:
            qs = qs.filter(title__icontains=q) | qs.filter(description__icontains=q)
        return qs

class StudentOfferDetailView(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    model = StageOffer
    template_name = 'stages/student_offer_detail.html'

    def test_func(self):
        return is_etudiant(self.request.user)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Check if student already applied
        context['already_applied'] = Candidature.objects.filter(student=self.request.user, offer=self.object).exists()
        return context

@login_required
@user_passes_test(is_etudiant)
def apply_for_offer(request, pk):
    offer = get_object_or_404(StageOffer, pk=pk)
    
    # Check if already applied
    if Candidature.objects.filter(student=request.user, offer=offer).exists():
        return redirect('student_offer_detail', pk=pk)

    # Check max candidatures
    count = Candidature.objects.filter(offer=offer).count()
    if count < 5:
        Candidature.objects.create(student=request.user, offer=offer)
        
        # Check if max reached AFTER registration
        new_count = Candidature.objects.filter(offer=offer).count()
        if new_count >= 5:
            offer.state = 'Clôturée'
            offer.closing_reason = "Automatique : Limite de 5 candidatures atteinte"
            offer.save()
    
    return redirect('student_offer_detail', pk=pk)


# 2.4 Vues pour l'Administrateur
class AdminDashboardView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    template_name = 'stages/admin_dashboard.html'

    def test_func(self):
        return is_admin(self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_offers'] = StageOffer.objects.count()
        context['pending_offers'] = StageOffer.objects.filter(state='En attente validation').count()
        context['validated_offers'] = StageOffer.objects.filter(state='Validée').count()
        
        # Aggregation: Candidatures per month for last 12 months
        one_year_ago = timezone.now() - timedelta(days=365)
        qs_stats = (
            Candidature.objects.filter(date_candidature__gte=one_year_ago)
            .annotate(month=TruncMonth('date_candidature'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        
        # Transform qs_stats into a dict for easy lookup
        stats_dict = {}
        for s in qs_stats:
            if s['month']:
                stats_dict[s['month'].strftime('%Y-%m')] = s['count']

        # Generate last 12 months keys
        labels = []
        data = []
        today = timezone.now()
        
        months_fr = {
            1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril',
            5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août',
            9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'
        }
        
        for i in range(12):
            # Calculate year and month going back i months
            y = today.year
            m = today.month - i
            while m <= 0:
                m += 12
                y -= 1
            
            # Key for lookup
            lookup_key = f"{y}-{m:02d}"
            
            # Label for display
            display_label = f"{months_fr[m]} {y}"
            
            labels.append(display_label)
            data.append(stats_dict.get(lookup_key, 0))
        
        # Reverse to show chronological order (oldest -> newest)
        labels.reverse()
        data.reverse()
        
        context['chart_labels'] = json.dumps(labels, cls=DjangoJSONEncoder)
        context['chart_data'] = json.dumps(data, cls=DjangoJSONEncoder)
        
        # Bonus: Stats per student
        context['candidatures_per_student'] = (
            Candidature.objects.values('student__username', 'student__email')
            .annotate(total=Count('id'))
            .order_by('-total')
        )
        
        return context

class AdminOfferListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = StageOffer
    template_name = 'stages/admin_offer_list.html'
    context_object_name = 'offers'

    def test_func(self):
        return is_admin(self.request.user)
    
    def get_queryset(self):
        qs = StageOffer.objects.all() # Admin sees all
        q = self.request.GET.get('q')
        if q:
            qs = qs.filter(title__icontains=q)
        return qs

@login_required
@user_passes_test(is_admin)
def admin_change_state(request, pk, new_state):
    offer = get_object_or_404(StageOffer, pk=pk)
    if new_state in dict(StageOffer.STATE_CHOICES):
        offer.state = new_state
        if new_state == 'Clôturée':
            offer.closing_reason = f"Manuelle : Clôturée par {request.user.username} (Admin)"
        else:
            offer.closing_reason = None # Clear reason if reopened
        offer.save()
    return redirect('admin_offer_list')

class AdminUserListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = User
    template_name = 'stages/admin_user_list.html'
    context_object_name = 'users'

    def test_func(self):
        return is_admin(self.request.user)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['groups'] = Group.objects.all()
        return context

@login_required
@user_passes_test(is_admin)
def admin_user_update_role(request, pk):
    if request.method == 'POST':
        user_to_edit = get_object_or_404(User, pk=pk)
        new_group_name = request.POST.get('group_name')
        
        if new_group_name:
            try:
                group = Group.objects.get(name=new_group_name)
                
                # Remove user from all groups first
                user_to_edit.groups.clear()
                user_to_edit.groups.add(group)
                
                # Handle superuser/staff status based on role
                if new_group_name == 'Administrateur':
                    user_to_edit.is_superuser = True
                    user_to_edit.is_staff = True
                else:
                    user_to_edit.is_superuser = False
                    # Optional: Decide if Responsable/Etudiant should be staff. 
                    # Usually only Admin is staff (can access /admin/).
                    user_to_edit.is_staff = False 
                
                user_to_edit.save()
                
                messages.success(request, f'Rôle de {user_to_edit.username} modifié en {new_group_name}. (Statuts mis à jour)')
            except Group.DoesNotExist:
                messages.error(request, "Groupe invalide.")
                
    return redirect('admin_user_list')

# --- Nouvelles fonctionnalités ---

# Vue pour que l'étudiant voie ses candidatures
class StudentCandidatureListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Candidature
    template_name = 'stages/student_candidature_list.html'
    context_object_name = 'candidatures'

    def test_func(self):
        return is_etudiant(self.request.user)

    def get_queryset(self):
        return Candidature.objects.filter(student=self.request.user).order_by('-date_candidature')

# Vue pour retirer une candidature
@login_required
@user_passes_test(is_etudiant)
def withdraw_candidature(request, pk):
    candidature = get_object_or_404(Candidature, pk=pk, student=request.user)
    offer = candidature.offer
    
    # Supprimer la candidature
    candidature.delete()
    messages.success(request, "Candidature retirée avec succès.")

    # Logique intelligente : Réouvrir l'offre si elle était clôturée pour cause de limite atteinte
    # et qu'on repasse sous la barre des 5.
    if offer.state == 'Clôturée' and offer.closing_reason and "Limite de 5 candidatures atteinte" in offer.closing_reason:
        current_count = offer.candidature_set.count()
        if current_count < 5:
            offer.state = 'Validée'
            offer.closing_reason = None
            offer.save()

    return redirect('student_candidature_list')

# Vue pour le responsable pour voir les candidats d'une offre
class ManagerOfferCandidatesView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Candidature
    template_name = 'stages/manager_offer_candidates.html'
    context_object_name = 'candidates'

    def test_func(self):
        return is_responsable(self.request.user)

    def get_queryset(self):
        self.offer = get_object_or_404(StageOffer, pk=self.kwargs['pk'])
        return Candidature.objects.filter(offer=self.offer).order_by('date_candidature')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['offer'] = self.offer
        return context

# Vue pour éditer le profil étudiant
@login_required
@user_passes_test(is_etudiant)
def profile_edit(request):
    profile, created = StudentProfile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        form = StudentProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Votre profil a été mis à jour.")
            return redirect('student_offer_list')
    else:
        form = StudentProfileForm(instance=profile)
    
    return render(request, 'stages/profile_edit.html', {'form': form})

# Vue pour exporter les candidats en CSV
@login_required
def export_candidates_csv(request, pk):
    offer = get_object_or_404(StageOffer, pk=pk)
    
    # Vérification des permissions
    is_res = is_responsable(request.user)
    is_comp = is_company(request.user) and offer.company == request.user
    
    if not (is_res or is_comp):
        messages.error(request, "Vous n'avez pas la permission d'exporter cette liste.")
        return redirect('home')

    candidates = Candidature.objects.filter(offer=offer)

    response = HttpResponse(
        content_type='text/csv',
        headers={'Content-Disposition': f'attachment; filename="candidats_{offer.id}.csv"'},
    )

    writer = csv.writer(response)
    writer.writerow(['Nom utilisateur', 'Email', 'Téléphone', 'Date Candidature', 'Lien CV'])

    for cand in candidates:
        # Récupérer le profil s'il existe
        try:
            profile = cand.student.studentprofile
            phone = profile.phone
            cv_url = request.build_absolute_uri(profile.cv.url) if profile.cv else "Aucun CV"
        except StudentProfile.DoesNotExist:
            phone = "N/A"
            cv_url = "Pas de profil"

        writer.writerow([
            cand.student.username,
            cand.student.email,
            phone,
            cand.date_candidature.strftime("%Y-%m-%d %H:%M"),
            cv_url
        ])

    return response