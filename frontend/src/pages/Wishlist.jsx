import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const navigate = useNavigate();
  const { items, loading, fetched, fetchWishlist, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [addingCartId, setAddingCartId] = useState(null);

  useEffect(() => {
    if (!fetched) fetchWishlist();
  }, [fetched]);

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    setAddingCartId(product.id);
    const result = await addToCart(product.id, 1);
    setAddingCartId(null);
    if (result.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleRemove = async (productId, e) => {
    e.stopPropagation();
    const result = await toggleWishlist(productId);
    if (!result.added) {
      toast('Removed from wishlist', { icon: '💔' });
    }
  };

  return (
    <div className="container page-container-sm" style={{ minHeight: '60vh' }}>
      {/* Header */}
      <div className="wishlist-header">
        <div>
          <h1 className="wishlist-title">
            <Heart size={28} style={{ color: 'var(--color-primary)' }} />
            My Wishlist
          </h1>
          {items.length > 0 && (
            <p className="wishlist-count">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {loading && !fetched ? (
        <div className="wishlist-skeleton-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 16 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <Heart size={48} strokeWidth={1.5} />
          </div>
          <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
          <p className="wishlist-empty-desc">
            Save the items you love by tapping the heart icon on any product.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/products')}
            style={{ justifyContent: 'center', gap: 8 }}
          >
            <ShoppingBag size={18} />
            Browse Products
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map(item => {
            const product = item.product;
            if (!product) return null;
            const discountPct = product.discount_percent || 0;
            const isOutOfStock = product.stock_qty === 0;

            return (
              <div
                key={item.id}
                className="wishlist-item-card"
                onClick={() => navigate(`/products/${product.slug}`)}
              >
                {/* Image */}
                <div className="wishlist-item-image-wrapper">
                  {product.primary_image ? (
                    <img src={product.primary_image} alt={product.name} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '3rem',
                    }}>
                      🧴
                    </div>
                  )}

                  {/* Out of stock overlay */}
                  {isOutOfStock && (
                    <div className="out-of-stock-overlay">
                      <span>Out of Stock</span>
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    className="wishlist-item-remove-btn"
                    onClick={(e) => handleRemove(product.id, e)}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Content */}
                <div className="wishlist-item-content">
                  <h3 className="wishlist-item-title">{product.name}</h3>
                  <p className="wishlist-item-category">{product.category_name}</p>

                  <div className="wishlist-item-price-row">
                    <span className="wishlist-item-offer">₹{parseFloat(product.offer_price).toFixed(0)}</span>
                    {discountPct > 0 && (
                      <>
                        <span className="wishlist-item-mrp">₹{parseFloat(product.mrp).toFixed(0)}</span>
                        <span className="wishlist-item-discount">{discountPct}% OFF</span>
                      </>
                    )}
                  </div>

                  {/* Add to Cart button */}
                  <button
                    className="btn btn-primary wishlist-item-add-cart-btn"
                    disabled={isOutOfStock || addingCartId === product.id}
                    onClick={(e) => handleAddToCart(product, e)}
                    style={{ justifyContent: 'center', gap: 6 }}
                  >
                    <ShoppingCart size={14} />
                    {isOutOfStock ? 'Out of Stock' : addingCartId === product.id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
