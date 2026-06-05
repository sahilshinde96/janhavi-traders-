from django.urls import path
from . import views

urlpatterns = [
    path('apply/', views.ApplyCouponView.as_view(), name='apply-coupon'),
    path('admin/coupons/', views.AdminCouponListView.as_view(), name='admin-coupons'),
    path('admin/coupons/<int:pk>/', views.AdminCouponDetailView.as_view(), name='admin-coupon-detail'),
]
