from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics
from orders.models import Order
from .models import Shipment
from .serializers import ShipmentSerializer


class OrderShipmentView(APIView):
    """Fetch shipment for a specific order (user sees their own)."""
    def get(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        if not request.user.is_staff and order.user != request.user:
            return Response({'error': 'Forbidden'}, status=403)

        try:
            return Response(ShipmentSerializer(order.shipment).data)
        except Shipment.DoesNotExist:
            return Response({'status': 'pending', 'message': 'Shipment not created yet'})


class AdminShipmentListView(generics.ListAPIView):
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Shipment.objects.select_related('order').order_by('-created_at')


class AdminShipmentView(APIView):
    """Create or update shipment for an order; auto-syncs order status."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        shipment, _ = Shipment.objects.get_or_create(order=order)
        serializer = ShipmentSerializer(shipment, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        serializer.save()

        # Sync order status with shipment status
        ship_status = request.data.get('status', '')
        status_map = {
            'in_transit': 'shipped',
            'out_for_delivery': 'out_for_delivery',
            'delivered': 'delivered',
            'picked_up': 'confirmed',
        }
        if ship_status in status_map:
            order.status = status_map[ship_status]
            order.save(update_fields=['status'])

        return Response(ShipmentSerializer(shipment).data)
