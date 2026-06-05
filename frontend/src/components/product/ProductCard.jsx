import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, loading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }
    const result = await addToCart(product.id, 1);
    if (result.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const discountPct = product.discount_percent || 0;
  const isOutOfStock = product.stock_qty === 0;
  const image = product.primary_image;

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/products/${product.slug}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Image */}
      <div className="product-card-image">
        {image ? (
          <img src={image} alt={product.name} loading="lazy" />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', background: 'var(--color-secondary)',
          }}>
            {product.category_name === 'Makeup' ? '💄' :
              product.category_name === 'Skincare' ? '💧' : '🌿'}
          </div>
        )}

        {/* Discount badge */}
        {discountPct > 0 && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--color-error)', color: 'white',
            padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700,
          }}>
            -{discountPct}%
          </div>
        )}

        {/* Category badge */}
        {product.category_name && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(255,255,255,0.9)', color: 'var(--color-text-medium)',
            padding: '3px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600,
            backdropFilter: 'blur(4px)',
          }}>
            {product.category_name}
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: '#666', color: 'white', padding: '6px 16px',
              borderRadius: 4, fontSize: '0.8rem', fontWeight: 600,
            }}>Out of Stock</span>
          </div>
        )}

        {/* Hover add to cart */}
        {!isOutOfStock && (
          <div className="product-card-hover-btn" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
            opacity: 0, transition: 'opacity 0.25s ease',
          }}>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={handleAddToCart}
              disabled={loading}
            >
              <ShoppingCart size={14} />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="product-card-body">
        <p className="product-card-name">{product.name}</p>
        <div className="product-card-price">
          <span className="price-offer">₹{parseFloat(product.offer_price).toFixed(0)}</span>
          {discountPct > 0 && (
            <>
              <span className="price-mrp">₹{parseFloat(product.mrp).toFixed(0)}</span>
              <span className="price-discount">{discountPct}% off</span>
            </>
          )}
        </div>

        {!isOutOfStock && (
          <button
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleAddToCart}
            disabled={loading}
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
        )}
      </div>

      <style>{`
        .product-card:hover .product-card-hover-btn { opacity: 1; }
      `}</style>
    </div>
  );
}
