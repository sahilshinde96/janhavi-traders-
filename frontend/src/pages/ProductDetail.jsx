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
      // Fetch related
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
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
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
      <div className="container" style={{ padding: '32px 20px' }}>
        {/* Back */}
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
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
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🧴</div>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 10 }}>
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
              <span className="badge badge-neutral" style={{ marginBottom: 16, display: 'inline-block' }}>
                {product.category_name}
              </span>
            )}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: 24 }}>SKU: {product.sku}</p>

            {/* Price */}
            <div style={{ marginBottom: 24, padding: '20px', background: 'var(--color-bg)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                  ₹{parseFloat(product.offer_price).toFixed(0)}
                </span>
                {discountPct > 0 && (
                  <>
                    <span style={{ fontSize: '1.1rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                      ₹{parseFloat(product.mrp).toFixed(0)}
                    </span>
                    <span className="badge badge-error">{discountPct}% OFF</span>
                  </>
                )}
              </div>
              {discountPct > 0 && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-success)' }}>
                  You save ₹{(parseFloat(product.mrp) - parseFloat(product.offer_price)).toFixed(0)}!
                </p>
              )}
            </div>

            {/* Stock */}
            <div style={{ marginBottom: 24 }}>
              {inStock ? (
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.875rem' }}>
                  ✓ In Stock ({product.stock_qty} available)
                </span>
              ) : (
                <span style={{ color: 'var(--color-error)', fontWeight: 600, fontSize: '0.875rem' }}>✗ Out of Stock</span>
              )}
            </div>

            {/* Quantity */}
            {inStock && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.875rem' }}>Quantity</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'fit-content', border: '1.5px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '10px 16px', background: 'var(--color-bg)', border: 'none', cursor: 'pointer', fontSize: '1rem' }}><Minus size={16} /></button>
                  <span style={{ padding: '10px 20px', fontWeight: 700, fontSize: '1rem', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))} style={{ padding: '10px 16px', background: 'var(--color-bg)', border: 'none', cursor: 'pointer', fontSize: '1rem' }}><Plus size={16} /></button>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 12, opacity: inStock ? 1 : 0.5 }}
              onClick={handleAddToCart}
              disabled={!inStock || cartLoading}
            >
              <ShoppingCart size={20} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Delivery info */}
            <div style={{ padding: '16px', background: 'var(--color-secondary)', borderRadius: 10, fontSize: '0.8rem' }}>
              <p style={{ marginBottom: 4 }}>🚚 <strong>Free delivery</strong> </p>
              <p style={{ marginBottom: 4 }}>💳 <strong>Cash on Delivery</strong> available</p>
              <p>↩️ <strong>7-day</strong> easy returns</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--color-border)', marginBottom: 32 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '14px 24px', background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--color-primary)' : 'transparent'}`,
                marginBottom: -2, cursor: 'pointer',
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-medium)',
                fontSize: '0.9rem', transition: 'all 0.2s',
              }}>
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
          <div style={{ maxWidth: 680, color: 'var(--color-text-medium)', lineHeight: 1.8, fontSize: '0.95rem' }}>
            {product[activeTab] || <em style={{ color: 'var(--color-text-light)' }}>No information available.</em>}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 24 }}>You May Also Like</h2>
            <ProductGrid products={related} loading={false} />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
