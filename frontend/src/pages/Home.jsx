import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ProductGrid from '../components/product/ProductGrid';
import hero1 from '../assets/hero1.jpg';


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
  const [activeSlide, setActiveSlide] = useState(0);
  const [bestDiscountProduct, setBestDiscountProduct] = useState(null);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(0);

  useEffect(() => {
    api.get('/products/featured/').then(r => { setFeatured(r.data.results || r.data); setLoadingFeatured(false); }).catch(() => setLoadingFeatured(false));
    api.get('/products/new-arrivals/').then(r => { setNewArrivals(r.data.results || r.data); setLoadingNew(false); }).catch(() => setLoadingNew(false));
    
    // Fetch all products to find the most discounted one
    api.get('/products/')
      .then(r => {
        const prods = r.data.results || r.data;
        if (prods && prods.length > 0) {
          let bestProd = null;
          let maxPct = 0;
          prods.forEach(p => {
            const mrp = parseFloat(p.mrp);
            const offer = parseFloat(p.offer_price);
            if (mrp && offer && mrp > offer) {
              const pct = ((mrp - offer) / mrp) * 100;
              if (pct > maxPct) {
                maxPct = pct;
                bestProd = p;
              }
            }
          });
          if (bestProd) {
            setBestDiscountProduct(bestProd);
            setMaxDiscountPercent(maxPct);
          }
        }
      })
      .catch(err => console.error("Error loading products for slider:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(current => (current + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* ─── Hero Carousel ────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: '85vh', overflow: 'hidden', background: '#1C1C2E' }}>
        
        {/* Slide 1: Custom Image Uploaded */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${hero1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: activeSlide === 0 ? 1 : 0,
          visibility: activeSlide === 0 ? 'visible' : 'hidden',
          transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out',
          display: 'flex', alignItems: 'center',
        }}>
          {/* Dark overlay for readability */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
          
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: 580, animation: activeSlide === 0 ? 'slideUp 0.7s ease' : 'none' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(200,73,106,0.3)', color: '#FFB3C6',
                border: '1px solid rgba(200,73,106,0.6)',
                padding: '6px 18px', borderRadius: 99, fontSize: '0.78rem',
                fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
                marginBottom: 24,
              }}>
                ✨ Premium Cosmetics & Skincare
              </div>
              <h1 className="hero-title" style={{ color: 'white' }}>
                Your Glow Journey<br />
                <span style={{ color: 'var(--color-primary-light)' }}>Begins Here</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: 36, lineHeight: 1.7 }}>
                Explore dermatologist-tested cosmetics and skincare products curated to match your skin's unique needs.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/products?category=skincare')}>
                  Explore Skincare
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/products')}
                  style={{ borderColor: 'rgba(255,255,255,0.6)', color: 'white' }}>
                  All Products
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2: Original Landing Page Template */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B3D 50%, #4A1942 100%)',
          opacity: activeSlide === 1 ? 1 : 0,
          visibility: activeSlide === 1 ? 'visible' : 'hidden',
          transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 70% 50%, rgba(200,73,106,0.25) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(201,168,76,0.15) 0%, transparent 50%)',
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: 580, animation: activeSlide === 1 ? 'slideUp 0.7s ease' : 'none' }}>
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
              <h1 className="hero-title" style={{ color: 'white' }}>
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
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/products?is_featured=true')}
                  style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
                  View Offers
                </button>
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', right: '5%', top: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(200,73,106,0.08)', border: '1px solid rgba(200,73,106,0.15)' }} />
          <div style={{ position: 'absolute', right: '12%', top: '20%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }} />
        </div>

        {/* Slide 3: Most Discounted Item Banner */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #1C1C2E 0%, #29153B 50%, #15253A 100%)',
          opacity: activeSlide === 2 ? 1 : 0,
          visibility: activeSlide === 2 ? 'visible' : 'hidden',
          transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out',
          display: 'flex', alignItems: 'center',
        }}>
          <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            {bestDiscountProduct ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, animation: activeSlide === 2 ? 'slideUp 0.7s ease' : 'none' }}>
                <div style={{ maxWidth: 550 }}>
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(201,168,76,0.2)', color: '#FFD369',
                    border: '1px solid rgba(201,168,76,0.4)',
                    padding: '6px 18px', borderRadius: 99, fontSize: '0.78rem',
                    fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                    marginBottom: 24,
                  }}>
                    🔥 Deal of the Day: {maxDiscountPercent.toFixed(0)}% OFF
                  </div>
                  <h1 className="hero-title" style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                    {bestDiscountProduct.name}
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: 28, lineHeight: 1.6 }}>
                    Get this bestseller now at an unbeatable price! Only COD and free shipping above ₹500.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 36 }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFD369' }}>₹{bestDiscountProduct.offer_price}</span>
                    <span style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>₹{bestDiscountProduct.mrp}</span>
                  </div>
                  {/* Route page redirection uses product slug (e.g. '/products/my-face-wash') instead of database id */}
                  {/* to match the routing definitions and prevent a 404 error page (BUG-01/BUG-03 fix). */}
                  <button className="btn btn-primary btn-lg" onClick={() => navigate(`/products/${bestDiscountProduct.slug}`)}>
                    Grab this Offer
                  </button>

                </div>
                {/* Floating Product Image on the Right */}
                <div className="hidden-mobile" style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 24,
                  padding: 24,
                  maxWidth: 380,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <img 
                    src={bestDiscountProduct.primary_image || bestDiscountProduct.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500'} 
                    alt={bestDiscountProduct.name} 
                    style={{ height: 260, objectFit: 'contain', borderRadius: 16, marginBottom: 20 }}
                  />
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {bestDiscountProduct.name}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 580 }}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(201,168,76,0.2)', color: '#FFD369',
                  border: '1px solid rgba(201,168,76,0.4)',
                  padding: '6px 18px', borderRadius: 99, fontSize: '0.78rem',
                  fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                  marginBottom: 24,
                }}>
                  🔥 Exclusive Offers
                </div>
                <h1 className="hero-title" style={{ color: 'white' }}>
                  Mega Beauty<br />
                  <span style={{ color: '#FFD369' }}>Discounts</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: 36 }}>
                  Don't miss our highest discount items. Quality makeup and skincare at unbeatable prices!
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/products?is_featured=true')}>
                  View Bestsellers
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel indicators/dots */}
        <div style={{
          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 12, zIndex: 10,
        }}>
          {[0, 1, 2].map(idx => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              style={{
                width: activeSlide === idx ? 28 : 10,
                height: 10,
                borderRadius: 99,
                background: activeSlide === idx ? 'var(--color-primary)' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </section>

      {/* ─── Moving Offer Banner ─────────────────────────────────────────── */}
      <div className="marquee-container">
        <div className="marquee-track">
          <span className="marquee-item">🚚 FREE Delivery  &nbsp;|&nbsp; Only COD available</span>
          <span className="marquee-item">🚚 FREE Delivery  &nbsp;|&nbsp; Only COD available</span>
          <span className="marquee-item">🚚 FREE Delivery  &nbsp;|&nbsp; Only COD available</span>
          <span className="marquee-item">🚚 FREE Delivery  &nbsp;|&nbsp; Only COD available</span>
          <span className="marquee-item">🚚 FREE Delivery  &nbsp;|&nbsp; Only COD available</span>
        </div>
      </div>


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
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          background: linear-gradient(90deg, var(--color-primary-dark), var(--color-primary), var(--color-primary-light));
          padding: 14px 0;
          color: white;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .marquee-track {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 25s linear infinite;
        }
        .marquee-item {
          display: inline-block;
          padding: 0 40px;
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem !important; }
          .hidden-mobile { display: none !important; }
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
