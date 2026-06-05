from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_order_value', 'max_discount_amount', 'max_uses', 'used_count',
            'is_active', 'valid_from', 'valid_until', 'created_at',
        ]
        read_only_fields = ['used_count', 'created_at']

    def validate_code(self, value):
        return value.strip().upper()


class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    order_total = serializers.DecimalField(max_digits=10, decimal_places=2)
