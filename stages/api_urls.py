from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register(r'offers', api_views.StageOfferViewSet, basename='api-offer')
router.register(r'candidatures', api_views.CandidatureViewSet, basename='api-candidature')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/csrf/', api_views.get_csrf_token, name='api-csrf'),
    path('auth/register/', api_views.register_user, name='api-register'),
    path('auth/login/', api_views.login_user, name='api-login'),
    path('auth/logout/', api_views.logout_user, name='api-logout'),
    path('auth/me/', api_views.current_user, name='api-current-user'),
    path('profile/', api_views.student_profile, name='api-student-profile'),
    path('dashboard/stats/', api_views.dashboard_stats, name='api-dashboard-stats'),
]
