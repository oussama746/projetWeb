from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate, login, logout
from django.db.models import Count, Q
from django.utils import timezone
from django.middleware.csrf import get_token
from django.http import HttpResponse
from datetime import timedelta
from .models import StageOffer, Candidature, StudentProfile, Favorite
from .serializers import StageOfferSerializer, CandidatureSerializer, UserSerializer, StudentProfileSerializer
from . import emails
from .pdf_generator import generate_offer_pdf, generate_candidatures_summary_pdf


class StageOfferViewSet(viewsets.ModelViewSet):
    queryset = StageOffer.objects.all()
    serializer_class = StageOfferSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = StageOffer.objects.all()
        user = self.request.user
        
        # Search functionality (apply first)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(organisme__icontains=search)
            )
        
        # Advanced filters
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        duration = self.request.query_params.get('duration', None)
        if duration:
            queryset = queryset.filter(duration=duration)
        
        domain = self.request.query_params.get('domain', None)
        if domain:
            queryset = queryset.filter(domain=domain)
        
        remote = self.request.query_params.get('remote', None)
        if remote and remote.lower() == 'true':
            queryset = queryset.filter(remote=True)
        elif remote and remote.lower() == 'false':
            queryset = queryset.filter(remote=False)
        
        if not user.is_authenticated:
            # Return all validated offers for anonymous users
            return queryset.filter(state='Validée').order_by('-date_depot')
        
        # Get user role
        user_groups = user.groups.all()
        user_role = user_groups[0].name if user_groups.exists() else None
        
        # Filter based on role
        if user_role == 'Etudiant':
            queryset = queryset.filter(state='Validée')
        elif user_role == 'Responsable':
            queryset = queryset.filter(Q(state='En attente validation') | Q(state='Validée'))
        elif user_role == 'Entreprise':
            # Show offers where company=user OR contact_email=user.email
            queryset = queryset.filter(Q(company=user) | Q(contact_email=user.email))
        
        return queryset.order_by('-date_depot')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # If user is authenticated and is a company, link the offer
        if request.user.is_authenticated:
            user_groups = request.user.groups.all()
            if user_groups.exists() and user_groups[0].name == 'Entreprise':
                serializer.save(company=request.user)
            else:
                serializer.save()
        else:
            serializer.save()
        
        # Send confirmation email
        offer = serializer.instance
        try:
            emails.send_offer_submitted_email(offer)
        except Exception as e:
            print(f"Failed to send email: {e}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def apply(self, request, pk=None):
        offer = self.get_object()
        user = request.user
        
        # Check if user is a student
        user_groups = user.groups.all()
        if not user_groups.exists() or user_groups[0].name != 'Etudiant':
            return Response(
                {'error': 'Seuls les étudiants peuvent candidater'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if offer is validated
        if offer.state != 'Validée':
            return Response(
                {'error': "Cette offre n'est pas disponible pour candidature"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already applied
        if Candidature.objects.filter(student=user, offer=offer).exists():
            return Response(
                {'error': 'Vous avez déjà candidaté à cette offre'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if offer has less than 5 candidates
        candidature_count = offer.candidature_set.count()
        if candidature_count >= 5:
            return Response(
                {'error': 'Cette offre a atteint le nombre maximum de candidatures'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create candidature
        candidature = Candidature.objects.create(student=user, offer=offer)
        
        # Send confirmation emails
        try:
            emails.send_application_confirmation_email(candidature)
            emails.send_new_application_to_company_email(candidature)
        except Exception as e:
            print(f"Failed to send emails: {e}")
        
        # Check if this is the 5th candidature and close the offer
        if offer.candidature_set.count() >= 5:
            offer.state = 'Clôturée'
            offer.closing_reason = 'Nombre maximum de candidatures atteint (5)'
            offer.save()
            # Send email to company
            try:
                emails.send_offer_closed_email(offer)
            except Exception as e:
                print(f"Failed to send email: {e}")
        
        serializer = CandidatureSerializer(candidature, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def validate_offer(self, request, pk=None):
        offer = self.get_object()
        user = request.user
        
        # Check if user is an admin
        if not user.is_staff:
            return Response(
                {'error': 'Seuls les administrateurs peuvent valider des offres'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        action_type = request.data.get('action')
        if action_type == 'validate':
            offer.state = 'Validée'
            offer.save()
            # Send validation email
            try:
                emails.send_offer_validated_email(offer)
            except Exception as e:
                print(f"Failed to send email: {e}")
        elif action_type == 'refuse':
            offer.state = 'Refusée'
            offer.save()
            # Send refusal email
            try:
                emails.send_offer_refused_email(offer)
            except Exception as e:
                print(f"Failed to send email: {e}")
        else:
            return Response(
                {'error': 'Action invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(offer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def candidates(self, request, pk=None):
        offer = self.get_object()
        user = request.user
        
        # Check permissions
        user_groups = user.groups.all()
        user_role = user_groups[0].name if user_groups.exists() else None
        
        if user_role not in ['Responsable', 'Entreprise', 'Administrateur'] and not user.is_superuser:
            if user_role != 'Entreprise' or offer.company != user:
                return Response(
                    {'error': 'Vous n\'avez pas la permission de voir les candidatures'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        candidatures = offer.candidature_set.all()
        serializer = CandidatureSerializer(candidatures, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def export_pdf(self, request, pk=None):
        """Export offer and its candidatures as PDF"""
        offer = self.get_object()
        user = request.user
        
        # Check permissions - only admin or company manager can export
        user_groups = user.groups.all()
        user_role = user_groups[0].name if user_groups.exists() else None
        
        if not (user.is_staff or user_role in ['Entreprise', 'Administrateur']):
            return Response(
                {'error': 'Permission refusée'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate PDF
        pdf = generate_offer_pdf(offer)
        
        # Return PDF as response
        response = HttpResponse(pdf, content_type='application/pdf')
        filename = f"offre_{offer.id}_{offer.organisme.replace(' ', '_')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response


class CandidatureViewSet(viewsets.ModelViewSet):
    queryset = Candidature.objects.all()
    serializer_class = CandidatureSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        user_groups = user.groups.all()
        user_role = user_groups[0].name if user_groups.exists() else None
        
        if user_role == 'Etudiant':
            return Candidature.objects.filter(student=user).order_by('-date_candidature')
        elif user_role == 'Entreprise':
            # Company can see candidatures for their offers
            return Candidature.objects.filter(offer__contact_email=user.email).order_by('-date_candidature')
        elif user_role in ['Responsable', 'Administrateur'] or user.is_superuser:
            return Candidature.objects.all().order_by('-date_candidature')
        
        return Candidature.objects.none()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        candidature = self.get_object()
        
        if candidature.student != request.user:
            return Response(
                {'error': 'Vous ne pouvez retirer que vos propres candidatures'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        offer = candidature.offer
        candidature.delete()
        
        # If offer was closed, reopen it
        if offer.state == 'Clôturée' and offer.candidature_set.count() < 5:
            offer.state = 'Validée'
            offer.closing_reason = ''
            offer.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        candidature = self.get_object()
        user = request.user
        
        # Check permissions (company or admin)
        user_groups = user.groups.all()
        user_role = user_groups[0].name if user_groups.exists() else None
        
        if user_role not in ['Entreprise', 'Administrateur'] and not user.is_superuser:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier le statut'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # If company, check they own the offer (by email)
        if user_role == 'Entreprise' and candidature.offer.contact_email != user.email:
            return Response(
                {'error': 'Vous ne pouvez modifier que les candidatures de vos offres'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        if new_status not in ['Acceptée', 'Refusée', 'En attente']:
            return Response(
                {'error': 'Statut invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        candidature.status = new_status
        candidature.save()
        
        # Send status change email to student
        if new_status in ['Acceptée', 'Refusée']:
            try:
                emails.send_application_status_email(candidature)
            except Exception as e:
                print(f"Failed to send status email: {e}")
        
        serializer = self.get_serializer(candidature)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def export_all_pdf(self, request):
        """Export all candidatures as PDF (Admin only)"""
        user = request.user
        
        # Check if user is admin
        if not user.is_staff:
            return Response(
                {'error': 'Seuls les administrateurs peuvent exporter toutes les candidatures'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all candidatures or filtered by query
        queryset = self.get_queryset()
        
        # Generate PDF
        pdf = generate_candidatures_summary_pdf(queryset)
        
        # Return PDF as response
        response = HttpResponse(pdf, content_type='application/pdf')
        filename = f"candidatures_rapport_{timezone.now().strftime('%Y%m%d')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role', 'Etudiant')
    
    if not username or not password:
        return Response(
            {'error': 'Username et password requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Ce nom d\'utilisateur existe déjà'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    # Assign role
    try:
        group = Group.objects.get(name=role)
        user.groups.add(group)
    except Group.DoesNotExist:
        pass
    
    # Create student profile if student
    if role == 'Etudiant':
        StudentProfile.objects.create(user=user)
    
    # Send registration email
    try:
        emails.send_registration_email(user)
    except Exception as e:
        print(f"Failed to send registration email: {e}")
    
    login(request, user)
    
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    else:
        return Response(
            {'error': 'Identifiants invalides'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Get CSRF token for cross-origin requests"""
    token = get_token(request)
    return Response({'csrfToken': token})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return Response({'message': 'Déconnexion réussie'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_profile(request):
    """Get or update student profile"""
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        profile = StudentProfile.objects.create(user=request.user)
    
    if request.method == 'GET':
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    user_groups = user.groups.all()
    user_role = user_groups[0].name if user_groups.exists() else None
    
    if user_role not in ['Administrateur', 'Responsable'] and not user.is_superuser:
        return Response(
            {'error': 'Accès non autorisé'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Calculate statistics
    total_offers = StageOffer.objects.count()
    pending_offers = StageOffer.objects.filter(state='En attente validation').count()
    validated_offers = StageOffer.objects.filter(state='Validée').count()
    closed_offers = StageOffer.objects.filter(state='Clôturée').count()
    refused_offers = StageOffer.objects.filter(state='Refusée').count()
    
    total_candidatures = Candidature.objects.count()
    pending_candidatures = Candidature.objects.filter(status='En attente').count()
    accepted_candidatures = Candidature.objects.filter(status='Acceptée').count()
    refused_candidatures = Candidature.objects.filter(status='Refusée').count()
    
    # Candidatures by month for last 12 months
    from datetime import datetime
    from dateutil.relativedelta import relativedelta
    
    today = timezone.now()
    candidatures_by_month = []
    offers_by_month = []
    
    for i in range(12):
        month_date = today - relativedelta(months=11-i)
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + relativedelta(months=1))
        
        candidatures_count = Candidature.objects.filter(
            date_candidature__gte=month_start,
            date_candidature__lt=month_end
        ).count()
        
        offers_count = StageOffer.objects.filter(
            date_depot__gte=month_start,
            date_depot__lt=month_end
        ).count()
        
        candidatures_by_month.append({
            'month': month_start.strftime('%b %Y'),
            'count': candidatures_count
        })
        
        offers_by_month.append({
            'month': month_start.strftime('%b %Y'),
            'count': offers_count
        })
    
    # Top 5 des offres avec le plus de candidatures
    top_offers = StageOffer.objects.annotate(
        num_candidatures=Count('candidature')
    ).order_by('-num_candidatures')[:5]
    
    top_offers_data = [
        {
            'title': offer.title,
            'count': offer.num_candidatures
        }
        for offer in top_offers
    ]
    
    # Stats par état de candidature
    candidatures_by_status = [
        {'status': 'En attente', 'count': pending_candidatures},
        {'status': 'Acceptée', 'count': accepted_candidatures},
        {'status': 'Refusée', 'count': refused_candidatures},
    ]
    
    return Response({
        'total_offers': total_offers,
        'pending_offers': pending_offers,
        'validated_offers': validated_offers,
        'closed_offers': closed_offers,
        'refused_offers': refused_offers,
        'total_candidatures': total_candidatures,
        'pending_candidatures': pending_candidatures,
        'accepted_candidatures': accepted_candidatures,
        'refused_candidatures': refused_candidatures,
        'candidatures_by_month': candidatures_by_month,
        'offers_by_month': offers_by_month,
        'top_offers': top_offers_data,
        'candidatures_by_status': candidatures_by_status,
    })


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def favorites_view(request):
    """
    GET: Retourne la liste des offres favorites de l'étudiant
    POST: Ajoute une offre aux favoris (body: {"offer_id": 1})
    DELETE: Retire une offre des favoris (query param: ?offer_id=1)
    """
    user = request.user
    
    # Vérifier que c'est un étudiant
    if not user.groups.filter(name='Etudiant').exists():
        return Response(
            {"error": "Seuls les étudiants peuvent gérer des favoris"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'GET':
        # Récupérer tous les favoris avec les détails des offres
        favorites = Favorite.objects.filter(student=user).select_related('offer')
        offers = [fav.offer for fav in favorites]
        serializer = StageOfferSerializer(offers, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        offer_id = request.data.get('offer_id')
        if not offer_id:
            return Response(
                {"error": "offer_id est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            offer = StageOffer.objects.get(id=offer_id)
        except StageOffer.DoesNotExist:
            return Response(
                {"error": "Offre introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Créer le favori (ou ignorer si existe déjà grâce à unique_together)
        favorite, created = Favorite.objects.get_or_create(
            student=user,
            offer=offer
        )
        
        if created:
            return Response(
                {"message": "Offre ajoutée aux favoris"},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {"message": "Offre déjà dans les favoris"},
                status=status.HTTP_200_OK
            )
    
    elif request.method == 'DELETE':
        offer_id = request.query_params.get('offer_id')
        if not offer_id:
            return Response(
                {"error": "offer_id est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            favorite = Favorite.objects.get(student=user, offer_id=offer_id)
            favorite.delete()
            return Response(
                {"message": "Offre retirée des favoris"},
                status=status.HTTP_200_OK
            )
        except Favorite.DoesNotExist:
            return Response(
                {"error": "Favori introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_favorite(request, offer_id):
    """
    Vérifie si une offre est dans les favoris de l'étudiant
    """
    user = request.user
    
    if not user.groups.filter(name='Etudiant').exists():
        return Response({"is_favorite": False})
    
    is_fav = Favorite.objects.filter(student=user, offer_id=offer_id).exists()
    return Response({"is_favorite": is_fav})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, offer_id):
    """
    Ajoute ou retire une offre des favoris
    """
    user = request.user
    
    if not user.groups.filter(name='Etudiant').exists():
        return Response(
            {"error": "Seuls les étudiants peuvent mettre des offres en favoris"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        offer = StageOffer.objects.get(id=offer_id)
    except StageOffer.DoesNotExist:
        return Response(
            {"error": "Offre non trouvée"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    favorite = Favorite.objects.filter(student=user, offer=offer).first()
    
    if favorite:
        # Retirer des favoris
        favorite.delete()
        return Response({
            "message": "Offre retirée des favoris",
            "is_favorite": False
        })
    else:
        # Ajouter aux favoris
        Favorite.objects.create(student=user, offer=offer)
        return Response({
            "message": "Offre ajoutée aux favoris",
            "is_favorite": True
        })
