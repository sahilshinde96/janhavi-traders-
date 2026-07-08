import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Plus, Minus } from 'lucide-react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import ProductGrid from '../components/product/ProductGrid';
import toast from 'react-hot-toast';

const TABS = ['description', 'ingredients', 'how_to_use'];
const TAB_LABELS = { description: 'Description', ingredients: 'Ingredients', how_to_use: 'How to Use' };

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}/`).then(r => {
      setProduct(r.data);
      setLoading(false);
      if (r.data.category) {
        api.get(`/products/?category=${r.data.category}&ordering=-created_at`).then(rel => {
          const items = (rel.data.results || rel.data).filter(p => p.slug !== slug).slice(0, 4);
          setRelated(items);
        }).catch(() => {});
      }
    }).catch(() => { setLoading(false); navigate('/products'); });
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    const r = await addToCart(product.id, qty);
    if (r.success) toast.success(`Added to cart!`);
    else toast.error(r.error || 'Failed to add to cart');
  };

  if (loading) return (
    <div className="container page-container-sm">
      <div className="product-detail-grid">
        <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 16 }} />
        <div>
          {[100, 60, 80, 40, 100].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: i === 0 ? 32 : 20, width: `${w}%`, borderRadius: 4, marginBottom: 16 }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const images = product.images || [];
  const currentImage = images[selectedImage]?.image_url || product.primary_image;
  const discountPct = product.discount_percent || 0;
  const inStock = product.stock_qty > 0;

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      <div className="container page-container-sm">
        {/* Back */}
        <button className="btn btn-ghost btn-sm mb-24" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Back
        </button>

        <div className="product-detail-grid">
          {/* Images */}
          <div>
            <div style={{
              aspectRatio: '1', borderRadius: 20, overflow: 'hidden',
              background: 'var(--color-secondary)', marginBottom: 16,
              border: '1px solid var(--color-border)',
            }}>
              {currentImage ? (
                <img src={currentImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="flex-center" style={{ width: '100%', height: '100%', fontSize: '5rem' }}>🧴</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-10">
                {images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(i)} style={{
                    width: 72, height: 72, borderRadius: 10, overflow: 'hidden',
                    border: `2px solid ${i === selectedImage ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    cursor: 'pointer', flexShrink: 0,
                  }}>
                    <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category_name && (
              <span className="badge badge-neutral mb-16" style={{ display: 'inline-block' }}>
                {product.category_name}
              </span>
            )}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>
              {product.name}
              {product.net_quantity && (
                <span style={{ fontSize: '1.25rem', color: 'var(--color-text-medium)', fontWeight: 500, marginLeft: 10 }}>
                  ({product.net_quantity})
                </span>
              )}
            </h1>
            <p className="fs-xs text-light mb-24">SKU: {product.sku}</p>

            {/* Price box */}
            <div className="price-box">
              <div className="price-row">
                <span className="price-main">₹{parseFloat(product.offer_price).toFixed(0)}</span>
                {discountPct > 0 && (
                  <>
                    <span className="price-mrp-lg">₹{parseFloat(product.mrp).toFixed(0)}</span>
                    <span className="badge badge-error">{discountPct}% OFF</span>
                  </>
                )}
              </div>
              {discountPct > 0 && (
                <p className="fs-sm text-success">
                  You save ₹{(parseFloat(product.mrp) - parseFloat(product.offer_price)).toFixed(0)}!
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="mb-24">
              {inStock ? (
                <span className="text-success fw-600 fs-sm">✓ In Stock ({product.stock_qty} available)</span>
              ) : (
                <span className="text-error fw-600 fs-sm">✗ Out of Stock</span>
              )}
            </div>

            {/* Quantity */}
            {inStock && (
              <div className="mb-24">
                <p className="fw-600 mb-10 fs-sm">Quantity</p>
                <div className="qty-control">
                  <button className="qty-control-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={16} /></button>
                  <span className="qty-control-value">{qty}</span>
                  <button className="qty-control-btn" onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))}><Plus size={16} /></button>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              className="btn btn-primary btn-lg w-full"
              style={{ justifyContent: 'center', marginBottom: 12, opacity: inStock ? 1 : 0.5 }}
              onClick={handleAddToCart}
              disabled={!inStock || cartLoading}
            >
              <ShoppingCart size={20} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Delivery info */}
            <div className="delivery-info-box">
              <p>🚚 <strong>Free delivery</strong></p>
              <p>💳 <strong>Cash on Delivery</strong></p>
              <p>↩️ <strong>7-day</strong> easy returns</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-48">
          <div className="tab-nav">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`tab-btn${activeTab === tab ? ' tab-btn--active' : ''}`}>
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
          <div style={{ maxWidth: 680, color: 'var(--color-text-medium)', lineHeight: 1.8, fontSize: '0.95rem' }}>
            {product[activeTab] || <em className="text-light">No information available.</em>}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-64">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 24 }}>You May Also Like</h2>
            <ProductGrid products={related} loading={false} />
          </div>
        )}
      </div>
    </div>
  );
}
