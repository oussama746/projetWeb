from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register, name='register'),

    # Company
    path('company/offer/create/', views.CompanyOfferCreateView.as_view(), name='company_offer_create'),
    path('company/success/', views.company_success, name='company_success'),

    # Manager
    path('manager/offers/', views.ManagerOfferListView.as_view(), name='manager_offer_list'),
    path('manager/offer/<int:pk>/', views.ManagerOfferDetailView.as_view(), name='manager_offer_detail'),
    path('manager/offer/<int:pk>/action/<str:action>/', views.validate_or_refuse_offer, name='manager_offer_action'),

    # Student
    path('student/offers/', views.StudentOfferListView.as_view(), name='student_offer_list'),
    path('student/offer/<int:pk>/', views.StudentOfferDetailView.as_view(), name='student_offer_detail'),
    path('student/offer/<int:pk>/apply/', views.apply_for_offer, name='student_apply'),

    # Admin
    path('admin/dashboard/', views.AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/offers/', views.AdminOfferListView.as_view(), name='admin_offer_list'),
    path('admin/offer/<int:pk>/state/<str:new_state>/', views.admin_change_state, name='admin_change_state'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/update/', views.admin_user_update_role, name='admin_user_update_role'),
]
