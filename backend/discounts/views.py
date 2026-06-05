from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics
from .models import Coupon
from .serializers import CouponSerializer, ApplyCouponSerializer


class ApplyCouponView(APIView):
    def post(self, request):
        serializer = ApplyCouponSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        code = serializer.validated_data['code'].strip().upper()
        order_total = serializer.validated_data['order_total']

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code'}, status=404)

        valid, message = coupon.is_valid()
        if not valid:
            return Response({'error': message}, status=400)

        if order_total < coupon.min_order_value:
            return Response(
                {'error': f'Minimum order value for this coupon is ₹{coupon.min_order_value}'},
                status=400
            )

        discount = coupon.calculate_discount(order_total)
        return Response({
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': float(coupon.discount_value),
            'discount_amount': float(discount),
            'description': coupon.description,
        })


class AdminCouponListView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAdminUser]
