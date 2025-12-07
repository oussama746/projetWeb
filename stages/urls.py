from django.urls import path
from . import views

urlpatterns = [
    # Home page
    path('', views.home, name='home'),

    # Auth
    path('register/', views.register, name='register'),

    # Company
    path('company/offer/create/', views.CompanyOfferCreateView.as_view(), name='company_offer_create'),
    path('company/success/', views.company_success, name='company_success'),
    path('company/dashboard/', views.CompanyDashboardView.as_view(), name='company_dashboard'),
    path('company/offer/<int:pk>/candidates/', views.CompanyOfferCandidatesView.as_view(), name='company_offer_candidates'),
    path('company/candidature/<int:pk>/action/<str:action>/', views.company_candidate_action, name='company_candidate_action'),

    # Manager
    path('manager/offers/', views.ManagerOfferListView.as_view(), name='manager_offer_list'),
    path('manager/offer/<int:pk>/', views.ManagerOfferDetailView.as_view(), name='manager_offer_detail'),
    path('manager/offer/<int:pk>/action/<str:action>/', views.validate_or_refuse_offer, name='manager_offer_action'),

    # Student
    path('student/offers/', views.StudentOfferListView.as_view(), name='student_offer_list'),
    path('student/offer/<int:pk>/', views.StudentOfferDetailView.as_view(), name='student_offer_detail'),
    path('student/offer/<int:pk>/apply/', views.apply_for_offer, name='student_apply'),
    path('student/my-candidatures/', views.StudentCandidatureListView.as_view(), name='student_candidature_list'),
    path('student/candidature/<int:pk>/withdraw/', views.withdraw_candidature, name='withdraw_candidature'),
    path('student/profile/edit/', views.profile_edit, name='profile_edit'),

    # Manager (suite)
    path('manager/offer/<int:pk>/candidates/', views.ManagerOfferCandidatesView.as_view(), name='manager_offer_candidates'),
    path('manager/offer/<int:pk>/export/', views.export_candidates_csv, name='export_candidates_csv'),

    # Admin
    path('admin/dashboard/', views.AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/offers/', views.AdminOfferListView.as_view(), name='admin_offer_list'),
    path('admin/offer/<int:pk>/state/<str:new_state>/', views.admin_change_state, name='admin_change_state'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/update/', views.admin_user_update_role, name='admin_user_update_role'),
]
