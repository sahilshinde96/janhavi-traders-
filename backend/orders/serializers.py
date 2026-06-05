from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image',
            'product_sku', 'quantity', 'unit_price', 'subtotal',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    shipment_status = serializers.SerializerMethodField()
    courier_name = serializers.SerializerMethodField()
    tracking_number = serializers.SerializerMethodField()
    tracking_url = serializers.SerializerMethodField()
    estimated_delivery = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'payment_method',
            'address_name', 'address_phone', 'address_line1', 'address_line2',
            'address_city', 'address_state', 'address_pincode',
            'subtotal', 'discount_amount', 'delivery_charge', 'total_amount',
            'coupon_code', 'notes', 'created_at', 'updated_at',
            'items', 'customer_email', 'customer_phone',
            'shipment_status', 'courier_name', 'tracking_number',
            'tracking_url', 'estimated_delivery',
        ]

    def _shipment(self, obj):
        try:
            return obj.shipment
        except Exception:
            return None

    def get_customer_email(self, obj):
        return obj.user.email or ''

    def get_customer_phone(self, obj):
        return obj.user.phone or ''

    def get_shipment_status(self, obj):
        s = self._shipment(obj)
        return s.status if s else None

    def get_courier_name(self, obj):
        s = self._shipment(obj)
        return s.courier_name if s else None

    def get_tracking_number(self, obj):
        s = self._shipment(obj)
        return s.tracking_number if s else None

    def get_tracking_url(self, obj):
        s = self._shipment(obj)
        return s.tracking_url if s else None

    def get_estimated_delivery(self, obj):
        s = self._shipment(obj)
        return s.estimated_delivery if s else None
