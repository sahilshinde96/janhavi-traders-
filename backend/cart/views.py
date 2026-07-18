from rest_framework.views import APIView
from rest_framework.response import Response
from products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer


class CartView(APIView):
    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        # Prefetch items with their products and images to avoid N+1 queries (BUG-06 fix)
        cart = Cart.objects.prefetch_related('items__product__images', 'items__product__category').get(pk=cart.pk)
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared'})


class AddToCartView(APIView):
    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = max(1, int(request.data.get('quantity', 1)))

        try:
            product = Product.objects.get(pk=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        if product.stock_qty == 0:
            return Response({'error': 'This product is out of stock'}, status=400)

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity = min(item.quantity + quantity, product.stock_qty)
        else:
            item.quantity = min(quantity, product.stock_qty)
        item.save()

        return Response(CartSerializer(cart).data)


class CartItemView(APIView):
    def _get_cart_item(self, request, item_id):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        try:
            return cart, CartItem.objects.get(pk=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return cart, None

    def put(self, request, item_id):
        cart, item = self._get_cart_item(request, item_id)
        if not item:
            return Response({'error': 'Item not found'}, status=404)
        quantity = int(request.data.get('quantity', 1))
        if quantity <= 0:
            item.delete()
        else:
            item.quantity = min(quantity, item.product.stock_qty)
            item.save()
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        cart, item = self._get_cart_item(request, item_id)
        if not item:
            return Response({'error': 'Item not found'}, status=404)
        item.delete()
        return Response(CartSerializer(cart).data)
