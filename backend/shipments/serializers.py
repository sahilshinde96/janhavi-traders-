from rest_framework import serializers
from .models import Shipment


class ShipmentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)

    class Meta:
        model = Shipment
        fields = [
            'id', 'order_id', 'order_status',
            'courier_name', 'tracking_number', 'tracking_url',
            'status', 'estimated_delivery',
            'shipped_at', 'delivered_at', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
