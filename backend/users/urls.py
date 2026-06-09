from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('send-otp/', views.SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('google/', views.GoogleSignInView.as_view(), name='google-signin'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('addresses/', views.AddressListView.as_view(), name='addresses'),
    path('addresses/<int:pk>/', views.AddressDetailView.as_view(), name='address-detail'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-users'),
]
