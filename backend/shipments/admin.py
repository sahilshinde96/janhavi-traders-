from django.contrib import admin
from .models import Shipment


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ['order', 'courier_name', 'tracking_number', 'status', 'estimated_delivery']
    list_editable = ['status']
    list_filter = ['status']
    search_fields = ['tracking_number', 'order__id']
