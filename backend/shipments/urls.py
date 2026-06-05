from django.urls import path
from . import views

urlpatterns = [
    path('order/<int:order_id>/', views.OrderShipmentView.as_view(), name='order-shipment'),
    path('admin/', views.AdminShipmentListView.as_view(), name='admin-shipments'),
    path('admin/order/<int:order_id>/', views.AdminShipmentView.as_view(), name='admin-shipment'),
]
