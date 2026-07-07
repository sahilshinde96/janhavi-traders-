from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics
from django.db import transaction
from django.db.models import Sum, Count, F
from django.db.models.functions import Greatest
from django.conf import settings
from django.utils import timezone
from decimal import Decimal

from cart.models import Cart
from discounts.models import Coupon, CouponUsage
from .models import Order, OrderItem
from .serializers import OrderSerializer

# --- Delivery Charge Settings ---
DELIVERY_CHARGE = Decimal('20.00')
FREE_DELIVERY_ABOVE = Decimal('299.00')


class PlaceOrderView(APIView):
    @transaction.atomic
    def post(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response({'error': 'Your cart is empty'}, status=400)

        address = request.data.get('address')
        if not address:
            return Response({'error': 'Delivery address is required'}, status=400)

        required = ['name', 'phone', 'line1', 'city', 'state', 'pincode']
        for field in required:
            if not address.get(field, '').strip():
                return Response({'error': f'Address field "{field}" is required'}, status=400)

        # Get optional coordinates if provided
        try:
            lat = float(address.get('latitude')) if address.get('latitude') not in (None, '', 'null', 'None') else None
            lon = float(address.get('longitude')) if address.get('longitude') not in (None, '', 'null', 'None') else None
        except (ValueError, TypeError):
            lat = None
            lon = None

        # 1. Pincode Validation
        pincode = address.get('pincode', '').strip()
        allowed_pincodes = getattr(settings, 'DELIVERY_PINCODES', [])
        if allowed_pincodes and pincode not in allowed_pincodes:
            return Response({
                'error': f'Sorry, we do not deliver to pincode {pincode}. '
                         f'Delivery is only available in Kalyan/Dombivli areas.'
            }, status=400)

        # 2. GPS Geofencing Validation (only if coordinates are present)
        if lat is not None and lon is not None:
            import math
            store_lat = getattr(settings, 'STORE_LATITUDE', 19.213000)
            store_lon = getattr(settings, 'STORE_LONGITUDE', 73.151000)
            max_radius = getattr(settings, 'MAX_DELIVERY_RADIUS_KM', 10.0)

            # Convert latitude and longitude from degrees to radians
            dlat = math.radians(lat - store_lat)
            dlon = math.radians(lon - store_lon)
            a = (math.sin(dlat / 2) ** 2 +
                 math.cos(math.radians(store_lat)) * math.cos(math.radians(lat)) *
                 math.sin(dlon / 2) ** 2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            distance = 6371.0 * c  # Earth radius is ~6371km

            if distance > max_radius:
                return Response({
                    'error': f'Delivery is only available within {max_radius:.0f}km of our store. '
                             f'Your location is {distance:.1f}km away.'
                }, status=400)

        # Compute totals
        subtotal = cart.total
        coupon_code = request.data.get('coupon_code', '').strip().upper()
        discount = Decimal('0')

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                valid, msg = coupon.is_valid()
                if valid:
                    discount = coupon.calculate_discount(subtotal)
            except Coupon.DoesNotExist:
                pass  # Silent – coupon already validated on frontend

        delivery_charge = Decimal('0') if subtotal >= FREE_DELIVERY_ABOVE else DELIVERY_CHARGE
        total = subtotal - discount + delivery_charge

        order = Order.objects.create(
            user=request.user,
            address_name=address['name'],
            address_phone=address['phone'],
            address_line1=address['line1'],
            address_line2=address.get('line2', ''),
            address_city=address['city'],
            address_state=address['state'],
            address_pincode=address['pincode'],
            latitude=lat,
            longitude=lon,
            subtotal=subtotal,
            discount_amount=discount,
            delivery_charge=delivery_charge,
            total_amount=total,
            coupon_code=coupon_code,
            notes=request.data.get('notes', ''),
        )

        for item in cart.items.select_related('product').all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_image=item.product.primary_image,
                product_sku=item.product.sku,
                quantity=item.quantity,
                unit_price=item.product.offer_price,
                subtotal=item.subtotal,
            )
            # Decrement stock atomically to prevent race conditions (BUG-03 fix).
            # By using Django's F() expression, the subtraction happens directly at the database level in SQL:
            # `UPDATE products_product SET stock_qty = GREATEST(stock_qty - quantity, 0) WHERE id = ...`.
            # This guarantees correct values even if multiple orders are placed simultaneously.
            from products.models import Product
            Product.objects.filter(pk=item.product.pk).update(
                stock_qty=Greatest(F('stock_qty') - item.quantity, 0)
            )


        # Record coupon use
        if coupon_code and discount > 0:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                CouponUsage.objects.create(coupon=coupon, user=request.user, order=order)
                coupon.used_count += 1
                coupon.save(update_fields=['used_count'])
            except Exception:
                pass

        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=201)


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related('items')
            .select_related('user')
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().prefetch_related('items')
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related('items')
        )


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = Order.objects.all().prefetch_related('items').select_related('user')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class UpdateOrderStatusView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        new_status = request.data.get('status')
        valid = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': f'Invalid status. Valid choices: {valid}'}, status=400)

        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        return Response(OrderSerializer(order).data)


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from users.models import User
        from products.models import Product

        today = timezone.now().date()
        month_start = today.replace(day=1)

        total_orders = Order.objects.count()
        total_revenue = float(
            Order.objects.exclude(status='cancelled')
            .aggregate(total=Sum('total_amount'))['total'] or 0
        )
        today_orders = Order.objects.filter(created_at__date=today).count()
        month_revenue = float(
            Order.objects.filter(created_at__date__gte=month_start)
            .exclude(status='cancelled')
            .aggregate(total=Sum('total_amount'))['total'] or 0
        )
        total_users = User.objects.filter(is_staff=False).count()
        total_products = Product.objects.filter(is_active=True).count()
        low_stock_count = Product.objects.filter(stock_qty__lte=10, is_active=True).count()

        recent_orders = (
            Order.objects.prefetch_related('items').select_related('user')
            .order_by('-created_at')[:10]
        )
        status_counts = list(
            Order.objects.values('status').annotate(count=Count('id'))
        )

        return Response({
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'today_orders': today_orders,
            'month_revenue': month_revenue,
            'total_users': total_users,
            'total_products': total_products,
            'low_stock_products': low_stock_count,
            'recent_orders': OrderSerializer(recent_orders, many=True).data,
            'status_counts': status_counts,
        })


class CancelOrderView(APIView):
    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        if order.status == 'delivered':
            return Response({'error': 'Order cannot be cancelled as it has already been delivered.'}, status=400)
        elif order.status == 'cancelled':
            return Response({'error': 'Order is already cancelled.'}, status=400)

        with transaction.atomic():
            order.status = 'cancelled'
            order.save(update_fields=['status', 'updated_at'])
            
            for item in order.items.select_related('product').all():
                if item.product:
                    item.product.stock_qty += item.quantity
                    item.product.save(update_fields=['stock_qty'])
                    
        return Response(OrderSerializer(order).data)

