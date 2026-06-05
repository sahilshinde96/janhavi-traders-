from django.db import models
from django.utils import timezone


class Coupon(models.Model):
    DISCOUNT_TYPE = [
        ('percentage', 'Percentage (%)'),
        ('fixed', 'Fixed Amount (₹)'),
    ]

    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Cap for percentage discounts'
    )
    max_uses = models.IntegerField(null=True, blank=True, help_text='Leave blank for unlimited')
    used_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False, 'Coupon is inactive'
        if self.valid_until and now > self.valid_until:
            return False, 'Coupon has expired'
        if self.max_uses and self.used_count >= self.max_uses:
            return False, 'Coupon usage limit reached'
        return True, 'Valid'

    def calculate_discount(self, order_total):
        from decimal import Decimal
        if order_total < self.min_order_value:
            return Decimal('0')
        if self.discount_type == 'percentage':
            d = (order_total * self.discount_value) / Decimal('100')
            if self.max_discount_amount:
                d = min(d, self.max_discount_amount)
        else:
            d = self.discount_value
        return min(d, order_total)


class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
