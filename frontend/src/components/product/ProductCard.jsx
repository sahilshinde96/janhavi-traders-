import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product, isMerged = false }) {
  const navigate = useNavigate();
  const { addToCart, loading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggleWishlist } = useWishlistStore();

  const wishlisted = isWishlisted(product.id);

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

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      navigate('/login');
      return;
    }
    const result = await toggleWishlist(product.id);
    if (result.added) {
      toast.success('Added to wishlist ♡');
    } else {
      toast('Removed from wishlist', { icon: '💔' });
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/products/${product.slug}`;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on BLUSHH — ₹${parseFloat(product.offer_price).toFixed(0)}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    }
  };

  const discountPct = product.discount_percent || 0;
  const isOutOfStock = product.stock_qty === 0;
  const image = product.primary_image;

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/products/${product.slug}`)}
      style={{ 
        cursor: 'pointer',
        ...(isMerged ? {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        } : {})
      }}
    >
      {/* Image */}
      <div 
        className="product-card-image"
        style={isMerged ? { background: 'transparent' } : {}}
      >
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

        {/* Badges on top-left */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          display: 'flex', gap: 6, flexDirection: 'column',
          alignItems: 'flex-start', zIndex: 10
        }}>
          {product.category_name && (
            <div style={{
              background: 'rgba(255,255,255,0.9)', color: 'var(--color-text-medium)',
              padding: '3px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600,
              backdropFilter: 'blur(4px)',
            }}>
              {product.category_name}
            </div>
          )}
          {discountPct > 0 && (
            <div style={{
              background: 'var(--color-error)', color: 'white',
              padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700,
            }}>
              -{discountPct}%
            </div>
          )}
        </div>

        {/* Wishlist button */}
        <button
          className={`product-wishlist-btn${wishlisted ? ' wishlisted' : ''}`}
          onClick={handleWishlist}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={wishlisted ? 'var(--color-primary)' : 'none'} />
        </button>

        {/* Share button */}
        <button
          className="product-share-btn"
          onClick={handleShare}
          title="Share product"
        >
          <Share2 size={16} />
        </button>

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
      <div 
        className="product-card-body"
        style={isMerged ? { padding: '14px 0 0 0' } : {}}
      >
        <p className="product-card-name">
          {product.name}
          {product.net_quantity && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-medium)', fontWeight: 500, marginLeft: 6 }}>
              ({product.net_quantity})
            </span>
          )}
        </p>
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
