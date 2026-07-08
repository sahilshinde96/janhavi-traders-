import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit2, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import ProductGrid from '../components/product/ProductGrid';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import hero1 from '../assets/hero1.jpg';

const WHY_US = [
  { icon: '✅', title: '100% Authentic', desc: 'All products are sourced directly from brands' },
  { icon: '🌿', title: 'Cruelty Free', desc: 'We only stock cruelty-free certified brands' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered to your door in 2-5 days' },
  { icon: '↩️', title: 'Easy Returns', desc: '7-day hassle-free return policy' },
];

const FALLBACK_BANNERS = [
  { id: 1, name: "Good Vibes", image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", link_url: "/products?search=Good+Vibes", sort_order: 1 },
  { id: 2, name: "Nivea", image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", link_url: "/products?search=Nivea", sort_order: 2 },
  { id: 3, name: "NY Bae", image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600", link_url: "/products?search=NY+Bae", sort_order: 3 },
  { id: 4, name: "The Derma Co", image_url: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=600", link_url: "/products?search=Derma", sort_order: 4 },
  { id: 5, name: "DermDoc", image_url: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600", link_url: "/products?search=DermDoc", sort_order: 5 },
  { id: 6, name: "Lakme", image_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600", link_url: "/products?search=Lakme", sort_order: 6 },
  { id: 7, name: "Alps Goodness", image_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600", link_url: "/products?search=Alps", sort_order: 7 },
  { id: 8, name: "Swiss Beauty", image_url: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600", link_url: "/products?search=Swiss", sort_order: 8 },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.is_staff;

  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [brandBanners, setBrandBanners] = useState([]);
  
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingBanners, setLoadingBanners] = useState(true);
  
  const [activeSlide, setActiveSlide] = useState(0);
  const [bestDiscountProduct, setBestDiscountProduct] = useState(null);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(0);

  // Modal Editor state
  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    name: '',
    image_url: '',
    link_url: '',
    sort_order: 1
  });

  const fetchBanners = () => {
    setLoadingBanners(true);
    api.get('/products/brand-banners/')
      .then(r => {
        const data = r.data.results || r.data;
        setBrandBanners(data || []);
        setLoadingBanners(false);
      })
      .catch(() => {
        setLoadingBanners(false);
      });
  };

  useEffect(() => {
    api.get('/products/featured/').then(r => { setFeatured(r.data.results || r.data); setLoadingFeatured(false); }).catch(() => setLoadingFeatured(false));
    api.get('/products/new-arrivals/').then(r => { setNewArrivals(r.data.results || r.data); setLoadingNew(false); }).catch(() => setLoadingNew(false));
    fetchBanners();

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

  // Modal handlers
  const handleOpenEdit = (banner) => {
    setSelectedBanner(banner);
    setBannerForm({
      name: banner.name || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      sort_order: banner.sort_order || 1
    });
    setShowModal(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.name.trim() || !bannerForm.image_url.trim()) {
      toast.error("Name and Image URL are required");
      return;
    }
    setSavingBanner(true);
    try {
      if (selectedBanner && selectedBanner.id) {
        // Edit existing
        await api.patch(`/products/brand-banners/${selectedBanner.id}/`, bannerForm);
        toast.success("Brand banner updated successfully!");
      } else {
        // Create new (if somehow needed)
        await api.post('/products/brand-banners/', bannerForm);
        toast.success("Brand banner created successfully!");
      }
      fetchBanners();
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to save brand banner. Verify credentials.");
    } finally {
      setSavingBanner(false);
    }
  };

  // Determine grid rendering data (use seeded/fetched DB banners, falling back to static layout)
  const displayBanners = brandBanners.length > 0 ? brandBanners : FALLBACK_BANNERS;

  return (
    <div>
      {/* ─── Hero Carousel ────────────────────────────────────────────────── */}
      <div className="container mt-24 mb-32">
        <section className="hero-container">
        
        {/* Slide 1: Custom Image Uploaded */}
        <div
          className={`hero-slide ${activeSlide === 0 ? 'hero-slide--visible' : 'hero-slide--hidden'}`}
          style={{ backgroundImage: `url(${hero1})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* Dark overlay for readability */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: 580, animation: activeSlide === 0 ? 'slideUp 0.7s ease' : 'none' }}>
              <div className="hero-pill hero-pill--primary-bright">
                ✨ Premium Cosmetics &amp; Skincare
              </div>
              <h1 className="hero-title" style={{ color: 'white' }}>
                Your Glow Journey<br />
                <span style={{ color: 'var(--color-primary-light)' }}>Begins Here</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: 20, lineHeight: 1.7 }}>
                Explore dermatologist-tested cosmetics and skincare products curated to match your skin's unique needs.
              </p>
              <div className="flex gap-16 flex-wrap">
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
        <div
          className={`hero-slide ${activeSlide === 1 ? 'hero-slide--visible' : 'hero-slide--hidden'}`}
          style={{ background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B3D 50%, #4A1942 100%)' }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 70% 50%, rgba(244,137,147,0.25) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(201,168,76,0.15) 0%, transparent 50%)',
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: 580, animation: activeSlide === 1 ? 'slideUp 0.7s ease' : 'none' }}>
              <div className="hero-pill hero-pill--primary">
                ✨ Premium Cosmetics
              </div>
              <h1 className="hero-title" style={{ color: 'white' }}>
                Beauty That<br />
                <span style={{ color: 'var(--color-primary-light)' }}>Defines You</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: 20, lineHeight: 1.7 }}>
                Discover authentic cosmetics from top brands.<br />
                Makeup, Skincare &amp; Haircare — all in one place.
              </p>
              <div className="flex gap-16 flex-wrap">
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
          <div style={{ position: 'absolute', right: '5%', top: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(244,137,147,0.08)', border: '1px solid rgba(244,137,147,0.15)' }} />
          <div style={{ position: 'absolute', right: '12%', top: '20%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }} />
        </div>

        {/* Slide 3: Most Discounted Item Banner */}
        <div
          className={`hero-slide ${activeSlide === 2 ? 'hero-slide--visible' : 'hero-slide--hidden'}`}
          style={{ background: 'linear-gradient(135deg, #1C1C2E 0%, #29153B 50%, #15253A 100%)' }}
        >
          <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            {bestDiscountProduct ? (
              <div className="flex-between flex-wrap gap-40" style={{ animation: activeSlide === 2 ? 'slideUp 0.7s ease' : 'none' }}>
                <div style={{ maxWidth: 550 }}>
                  <div className="hero-pill hero-pill--gold">
                    🔥 Deal of the Day: {maxDiscountPercent.toFixed(0)}% OFF
                  </div>
                  <h1 className="hero-title" style={{ 
                    color: 'white', 
                    fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)', 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                    marginBottom: 16
                  }}>
                    {bestDiscountProduct.name}
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: 16, lineHeight: 1.5 }}>
                    Get this bestseller now at an unbeatable price! Only COD and free shipping above ₹299.
                  </p>
                  <div className="flex align-center gap-16 mb-20">
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFD369' }}>₹{bestDiscountProduct.offer_price}</span>
                    <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>₹{bestDiscountProduct.mrp}</span>
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={() => navigate(`/products/${bestDiscountProduct.slug}`)}>
                    Grab this Offer
                  </button>
                </div>
                {/* Floating Product Image on the Right */}
                <div className="hidden-mobile" style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 24,
                  padding: 20,
                  maxWidth: 340,
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
                    style={{ height: 200, objectFit: 'contain', borderRadius: 16, marginBottom: 12 }}
                  />
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {bestDiscountProduct.name}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 580 }}>
                <div className="hero-pill hero-pill--gold">
                  🔥 Exclusive Offers
                </div>
                <h1 className="hero-title" style={{ color: 'white' }}>
                  Mega Beauty<br />
                  <span style={{ color: '#FFD369' }}>Discounts</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: 20 }}>
                  Don't miss our highest discount items. Quality makeup and skincare at unbeatable prices!
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/products?is_featured=true')}>
                  View Bestsellers
                </button>
              </div>
            )}
          </div>
        </div>

        </section>

        {/* Carousel indicators/dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16,
        }}>
          {[0, 1, 2].map(idx => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              style={{
                width: activeSlide === idx ? 28 : 10,
                height: 10,
                borderRadius: 99,
                background: activeSlide === idx ? 'var(--color-primary)' : 'rgba(244, 137, 147, 0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

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
          <div className="flex-between mb-40">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="text-medium">Handpicked bestsellers just for you</p>
            </div>
            <Link to="/products?is_featured=true" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              View All →
            </Link>
          </div>
          <ProductGrid products={featured} loading={loadingFeatured} />
        </div>
      </section>

      {/* ─── Brand Promotional Banners Grid (Admin Uploadable) ────────────── */}
      <section className="section" style={{ background: 'var(--color-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="text-center mb-40">
            <h2 className="section-title">Shop by Brand Deals</h2>
            <p className="section-subtitle" style={{ color: 'var(--color-text-medium)', fontSize: '0.95rem', marginTop: 8 }}>
              Click on your favorite brands to view exclusive discounts and offers!
            </p>
          </div>
          
          <div className="grid-4" style={{ gap: 20 }}>
            {displayBanners.map((banner) => (
              <div 
                key={banner.id} 
                className="brand-banner-card"
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  aspectRatio: '1.1',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: banner.link_url ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (banner.link_url) navigate(banner.link_url);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Banner Image */}
                <div style={{ flex: 1, overflow: 'hidden', background: '#f5f5f5', position: 'relative' }}>
                  <img 
                    src={banner.image_url} 
                    alt={banner.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* Admin Controls overlay */}
                  {isAdmin && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Stop navigation redirect
                        handleOpenEdit(banner);
                      }}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 34,
                        height: 34,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        zIndex: 10,
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                      title="Edit Brand Banner"
                    >
                      <Edit2 size={15} />
                    </button>
                  )}
                </div>

                {/* Footer Label */}
                <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text-dark)', marginBottom: 2 }}>{banner.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 700 }}>Exclusive Deal</span>
                  </div>
                  {banner.link_url && <ExternalLink size={14} style={{ color: 'var(--color-text-light)' }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="text-center mb-48">
            <h2 className="section-title">Why <span style={{ color: 'var(--color-primary)' }}>BLUSHH</span>?</h2>
            <p className="section-subtitle">We take pride in what we deliver</p>
          </div>
          <div className="grid-4">
            {WHY_US.map((item, i) => (
              <div key={i} className="feature-card" style={{ border: '1px solid var(--color-border)', background: 'var(--color-secondary)' }}>
                <div className="feature-icon">{item.icon}</div>
                <h4 className="feature-title">{item.title}</h4>
                <p className="feature-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── New Arrivals ─────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="flex-between mb-40">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="text-medium">Fresh additions to our collection</p>
            </div>
            <Link to="/products" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              Shop All →
            </Link>
          </div>
          <ProductGrid products={newArrivals} loading={loadingNew} />
        </div>
      </section>

      {/* ─── Newsletter ───────────────────────────────────────────────────── */}
      <section className="section-dark">
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 16 }}>
            Stay in the Loop
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 40, fontSize: '1.1rem' }}>
            Subscribe for exclusive offers, new arrivals &amp; beauty tips
          </p>
          <div className="flex gap-12" style={{ justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
            <input
              type="email"
              placeholder="Enter your email"
              className="input flex-1"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
            />
            <button className="btn btn-primary">Subscribe</button>
          </div>
        </div>
      </section>

      {/* ─── Admin Edit Brand Banner Modal ───────────────────────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            maxWidth: 480,
            width: '100%',
            padding: 24,
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-border)',
            animation: 'slideUp 0.3s ease'
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: 20, color: 'var(--color-text-dark)' }}>
              Edit Brand Banner ({selectedBanner?.name || 'New'})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Brand Name *</label>
                <input 
                  className="input" 
                  value={bannerForm.name} 
                  onChange={e => setBannerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Nivea"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Image URL *</label>
                <input 
                  className="input" 
                  value={bannerForm.image_url} 
                  onChange={e => setBannerForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="Paste Cloudinary/Image link..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Redirect Redirect URL (optional)</label>
                <input 
                  className="input" 
                  value={bannerForm.link_url} 
                  onChange={e => setBannerForm(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="e.g. /products?search=nivea"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Sort Order</label>
                <input 
                  className="input" 
                  type="number"
                  value={bannerForm.sort_order} 
                  onChange={e => setBannerForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowModal(false)}
                disabled={savingBanner}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveBanner}
                disabled={savingBanner}
              >
                {savingBanner ? '⏳ Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
