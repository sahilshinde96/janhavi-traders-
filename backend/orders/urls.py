from django.urls import path
from . import views

urlpatterns = [
    path('place/', views.PlaceOrderView.as_view(), name='place-order'),
    path('', views.MyOrdersView.as_view(), name='my-orders'),
    path('admin/all/', views.AdminOrderListView.as_view(), name='admin-orders'),
    path('admin/dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/<int:pk>/status/', views.UpdateOrderStatusView.as_view(), name='update-status'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
]
