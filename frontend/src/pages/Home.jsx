import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ProductGrid from '../components/product/ProductGrid';

const CATEGORIES = [
  { name: 'Makeup', slug: 'makeup', emoji: '💄', desc: 'Lips, Eyes & Face', gradient: 'linear-gradient(135deg, #FF6B9D, #C8496A)' },
  { name: 'Skincare', slug: 'skincare', emoji: '💧', desc: 'Glow & Hydrate', gradient: 'linear-gradient(135deg, #74B9FF, #0984E3)' },
  { name: 'Haircare', slug: 'haircare', emoji: '🌿', desc: 'Nourish & Shine', gradient: 'linear-gradient(135deg, #55EFC4, #00B894)' },
];

const WHY_US = [
  { icon: '✅', title: '100% Authentic', desc: 'All products are sourced directly from brands' },
  { icon: '🌿', title: 'Cruelty Free', desc: 'We only stock cruelty-free certified brands' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered to your door in 2-5 days' },
  { icon: '↩️', title: 'Easy Returns', desc: '7-day hassle-free return policy' },
];

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);

  useEffect(() => {
    api.get('/products/featured/').then(r => { setFeatured(r.data.results || r.data); setLoadingFeatured(false); }).catch(() => setLoadingFeatured(false));
    api.get('/products/new-arrivals/').then(r => { setNewArrivals(r.data.results || r.data); setLoadingNew(false); }).catch(() => setLoadingNew(false));
  }, []);

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B3D 50%, #4A1942 100%)',
        minHeight: '85vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 70% 50%, rgba(200,73,106,0.25) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(201,168,76,0.15) 0%, transparent 50%)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 580, animation: 'slideUp 0.7s ease' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(200,73,106,0.2)', color: '#E8849A',
              border: '1px solid rgba(200,73,106,0.4)',
              padding: '6px 18px', borderRadius: 99, fontSize: '0.78rem',
              fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
              marginBottom: 24,
            }}>
              ✨ Premium Cosmetics
            </div>
            <h1 className="hero-title">
              Beauty That<br />
              <span style={{ color: 'var(--color-primary-light)' }}>Defines You</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: 36, lineHeight: 1.7 }}>
              Discover authentic cosmetics from top brands.<br />
              Makeup, Skincare & Haircare — all in one place.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>
                Shop Now
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/products?featured=true')}
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
                View Offers
              </button>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 48, color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
              <div><span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.2rem' }}>500+</span><br />Products</div>
              <div><span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.2rem' }}>10K+</span><br />Happy Customers</div>
              <div><span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.2rem' }}>100%</span><br />Authentic</div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: '5%', top: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(200,73,106,0.08)', border: '1px solid rgba(200,73,106,0.15)' }} />
        <div style={{ position: 'absolute', right: '12%', top: '20%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }} />
      </section>

      {/* ─── Offer Banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary), var(--color-primary-light))',
        padding: '14px 0', textAlign: 'center', color: 'white',
        fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px',
      }}>
        🎉 FREE Delivery on orders above ₹500 &nbsp;|&nbsp; Use code <strong>BEAUTY20</strong> for 20% off your first order!
      </div>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find everything you need in one place</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {CATEGORIES.map(cat => (
              <div
                key={cat.slug}
                onClick={() => navigate(`/products?category_slug=${cat.slug}`)}
                style={{
                  background: cat.gradient, borderRadius: 20, padding: '40px 24px',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  color: 'white',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>{cat.emoji}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>{cat.name}</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>{cat.desc}</p>
                <div style={{
                  marginTop: 20, display: 'inline-block',
                  background: 'rgba(255,255,255,0.2)', borderRadius: 20,
                  padding: '6px 20px', fontSize: '0.8rem', fontWeight: 600,
                }}>
                  Explore →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p style={{ color: 'var(--color-text-medium)' }}>Handpicked bestsellers just for you</p>
            </div>
            <Link to="/products?is_featured=true" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              View All →
            </Link>
          </div>
          <ProductGrid products={featured} loading={loadingFeatured} />
        </div>
      </section>

      {/* ─── Why Choose Us ────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Why Janhavi Traders?</h2>
            <p className="section-subtitle">We take pride in what we deliver</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {WHY_US.map((item, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 16, padding: '32px 24px',
                textAlign: 'center', boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{item.icon}</div>
                <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{item.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── New Arrivals ─────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p style={{ color: 'var(--color-text-medium)' }}>Fresh additions to our collection</p>
            </div>
            <Link to="/products" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              Shop All →
            </Link>
          </div>
          <ProductGrid products={newArrivals} loading={loadingNew} />
        </div>
      </section>

      {/* ─── Newsletter ───────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #1C1C2E, #2D1B3D)',
        padding: '80px 0', textAlign: 'center', color: 'white',
      }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 16 }}>
            Stay in the Loop
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 40, fontSize: '1.1rem' }}>
            Subscribe for exclusive offers, new arrivals & beauty tips
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
            <input
              type="email"
              placeholder="Enter your email"
              className="input"
              style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
            />
            <button className="btn btn-primary">Subscribe</button>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem !important; }
          [style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          [style*="grid-template-columns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          [style*="grid-template-columns: repeat(2, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
