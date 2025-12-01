from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import CreateView, ListView, DetailView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from django.urls import reverse_lazy
from .models import StageOffer, Candidature
from .forms import StageOfferForm
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User, Group
from django.contrib import messages

# Helper functions for permissions
def is_responsable(user):
    return user.groups.filter(name='Responsable').exists() or user.is_superuser

def is_etudiant(user):
    return user.groups.filter(name='Etudiant').exists() or user.is_superuser

def is_admin(user):
    return user.groups.filter(name='Administrateur').exists() or user.is_superuser

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Add to Etudiant group by default
            group, created = Group.objects.get_or_create(name='Etudiant')
            user.groups.add(group)
            messages.success(request, 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'registration/register.html', {'form': form})

# 2.1 Vue pour l'Entreprise (Dépôt)
class CompanyOfferCreateView(UserPassesTestMixin, CreateView):
    model = StageOffer
    form_class = StageOfferForm
    template_name = 'stages/company_offer_create.html'
    success_url = reverse_lazy('company_success')

    def test_func(self):
        # Allow access if user is NOT logged in, OR if logged in but NOT a student
        if not self.request.user.is_authenticated:
            return True
        return not is_etudiant(self.request.user)

    def handle_no_permission(self):
        # If they are logged in and fail the test (i.e. are a Student), redirect them
        if self.request.user.is_authenticated:
            return redirect('home') # or some other page
        return super().handle_no_permission()

    def form_valid(self, form):
        form.instance.state = 'En attente validation'
        return super().form_valid(form)

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
@user_passes_test(is_responsable)
def validate_or_refuse_offer(request, pk, action):
    offer = get_object_or_404(StageOffer, pk=pk)
    if action == 'validate':
        offer.state = 'Validée'
    elif action == 'refuse':
        offer.state = 'Refusée'
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
        stats = (
            Candidature.objects.filter(date_candidature__gte=one_year_ago)
            .annotate(month=TruncMonth('date_candidature'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        
        # Format for Chart.js
        labels = [s['month'].strftime('%Y-%m') for s in stats]
        data = [s['count'] for s in stats]
        
        context['chart_labels'] = json.dumps(labels, cls=DjangoJSONEncoder)
        context['chart_data'] = json.dumps(data, cls=DjangoJSONEncoder)
        
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