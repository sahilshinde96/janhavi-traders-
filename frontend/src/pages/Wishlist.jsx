import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import ProductGrid from '../components/product/ProductGrid';

export default function Wishlist() {
  const navigate = useNavigate();
  const { items, loading, fetched, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (!fetched) fetchWishlist();
  }, [fetched]);

  const products = items.map(item => item.product);

  return (
    <div className="container page-container-sm" style={{ minHeight: '60vh' }}>
      {/* Header */}
      <div className="wishlist-header">
        <div>
          <h1 className="wishlist-title">
            <Heart size={28} style={{ color: 'var(--color-primary)' }} />
            My Wishlist
          </h1>
          {products.length > 0 && (
            <p className="wishlist-count">{products.length} item{products.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {loading && !fetched ? (
        <div className="wishlist-skeleton-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 16 }} />
          ))}
        </div>
      ) : products.length === 0 ? (
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
        <ProductGrid products={products} loading={false} />
      )}
    </div>
  );
}
