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
  const [heroBanners, setHeroBanners] = useState([]);
  
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingHeroBanners, setLoadingHeroBanners] = useState(true);
  
  const [activeSlide, setActiveSlide] = useState(0);
  const [bestDiscountProduct, setBestDiscountProduct] = useState(null);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(0);

  // Modal Editor state for Brand Banners
  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    name: '',
    image_url: '',
    link_url: '',
    sort_order: 1
  });

  // Modal Editor state for Hero Banners
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [selectedHero, setSelectedHero] = useState(null);
  const [savingHero, setSavingHero] = useState(false);
  const [heroForm, setHeroForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    button_text: 'Shop Now',
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

  const fetchHeroBanners = () => {
    setLoadingHeroBanners(true);
    api.get('/products/hero-banners/')
      .then(r => {
        const data = r.data.results || r.data;
        setHeroBanners(data || []);
        setLoadingHeroBanners(false);
      })
      .catch(() => {
        setLoadingHeroBanners(false);
      });
  };

  useEffect(() => {
    api.get('/products/featured/').then(r => { setFeatured(r.data.results || r.data); setLoadingFeatured(false); }).catch(() => setLoadingFeatured(false));
    api.get('/products/new-arrivals/').then(r => { setNewArrivals(r.data.results || r.data); setLoadingNew(false); }).catch(() => setLoadingNew(false));
    fetchBanners();
    fetchHeroBanners();

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

  // Build slide array dynamically to include the database-loaded custom slides AND the dynamic Deal of the Day slide
  const displaySlides = [...heroBanners];
  
  if (bestDiscountProduct) {
    displaySlides.push({
      id: 'dynamic-deal-of-the-day',
      isDynamicDeal: true,
      title: bestDiscountProduct.name,
      subtitle: "Get this bestseller now at an unbeatable price! Only COD and free shipping above ₹299.",
      image_url: bestDiscountProduct.primary_image || bestDiscountProduct.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
      link_url: `/products/${bestDiscountProduct.slug}`,
      button_text: "Grab this Offer",
      mrp: bestDiscountProduct.mrp,
      offer_price: bestDiscountProduct.offer_price,
      discount_percent: maxDiscountPercent
    });
  } else {
    displaySlides.push({
      id: 'dynamic-deal-fallback',
      isDynamicDealFallback: true,
      title: "Mega Beauty Discounts",
      subtitle: "Don't miss our highest discount items. Quality makeup and skincare at unbeatable prices!",
      link_url: "/products?is_featured=true",
      button_text: "View Bestsellers"
    });
  }

  const totalSlides = displaySlides.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(current => (current + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  // Modal handlers for Brand Banners
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
        // Create new
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

  // Modal handlers for Hero Banners
  const handleOpenCreateHero = () => {
    setSelectedHero(null);
    setHeroForm({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      button_text: 'Shop Now',
      sort_order: heroBanners.length + 1
    });
    setShowHeroModal(true);
  };

  const handleOpenEditHero = (banner) => {
    setSelectedHero(banner);
    setHeroForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      button_text: banner.button_text || 'Shop Now',
      sort_order: banner.sort_order || 1
    });
    setShowHeroModal(true);
  };

  const handleDeleteHeroBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Hero Banner slide?")) return;
    try {
      await api.delete(`/products/hero-banners/${id}/`);
      toast.success("Hero banner deleted successfully!");
      fetchHeroBanners();
      setActiveSlide(0);
    } catch (err) {
      toast.error("Failed to delete hero banner.");
    }
  };

  const handleSaveHeroBanner = async () => {
    if (!heroForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSavingHero(true);
    try {
      if (selectedHero && selectedHero.id) {
        await api.patch(`/products/hero-banners/${selectedHero.id}/`, heroForm);
        toast.success("Hero banner updated successfully!");
      } else {
        await api.post('/products/hero-banners/', heroForm);
        toast.success("Hero banner created successfully!");
      }
      fetchHeroBanners();
      setShowHeroModal(false);
    } catch (err) {
      toast.error("Failed to save hero banner. Verify details.");
    } finally {
      setSavingHero(false);
    }
  };

  // Determine grid rendering data (use seeded/fetched DB banners, falling back to static layout)
  const displayBanners = brandBanners.length > 0 ? brandBanners : FALLBACK_BANNERS;

  return (
    <div>
      {/* ─── Hero Carousel ────────────────────────────────────────────────── */}
      <div className="container mt-24 mb-32">
        <section className="hero-container">
        
        {displaySlides.map((banner, idx) => {
          if (banner.isDynamicDeal) {
            return (
              <div
                key={banner.id}
                className={`hero-slide ${activeSlide === idx ? 'hero-slide--visible' : 'hero-slide--hidden'}`}
                style={{ background: 'linear-gradient(135deg, #1C1C2E 0%, #29153B 50%, #15253A 100%)' }}
              >
                <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                  <div className="flex-between flex-wrap gap-40" style={{ animation: activeSlide === idx ? 'slideUp 0.7s ease' : 'none' }}>
                    <div style={{ maxWidth: 550 }}>
                      <div className="hero-pill hero-pill--gold">
                        🔥 Deal of the Day: {banner.discount_percent.toFixed(0)}% OFF
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
                        {banner.title}
                      </h1>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: 16, lineHeight: 1.5 }}>
                        {banner.subtitle}
                      </p>
                      <div className="flex align-center gap-16 mb-20">
                        <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFD369' }}>₹{banner.offer_price}</span>
                        <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>₹{banner.mrp}</span>
                      </div>
                      <button className="btn btn-primary btn-lg" onClick={() => navigate(banner.link_url)}>
                        {banner.button_text}
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
                        src={banner.image_url} 
                        alt={banner.title} 
                        style={{ height: 200, objectFit: 'contain', borderRadius: 16, marginBottom: 12 }}
                      />
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {banner.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (banner.isDynamicDealFallback) {
            return (
              <div
                key={banner.id}
                className={`hero-slide ${activeSlide === idx ? 'hero-slide--visible' : 'hero-slide--hidden'}`}
                style={{ background: 'linear-gradient(135deg, #1C1C2E 0%, #29153B 50%, #15253A 100%)' }}
              >
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ maxWidth: 580, animation: activeSlide === idx ? 'slideUp 0.7s ease' : 'none' }}>
                    <div className="hero-pill hero-pill--gold">
                      🔥 Exclusive Offers
                    </div>
                    <h1 className="hero-title" style={{ color: 'white' }}>
                      Mega Beauty<br />
                      <span style={{ color: '#FFD369' }}>Discounts</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: 20 }}>
                      {banner.subtitle}
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate(banner.link_url)}>
                      {banner.button_text}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={banner.id}
              className={`hero-slide ${activeSlide === idx ? 'hero-slide--visible' : 'hero-slide--hidden'}`}
              style={{
                backgroundImage: banner.image_url ? `url(${banner.image_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#1C1C2E',
                position: 'relative'
              }}
            >
              {!banner.image_url && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B3D 50%, #4A1942 100%)',
                }} />
              )}
              {/* Dark overlay for readability */}
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
              <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
                <div style={{ maxWidth: 580, animation: activeSlide === idx ? 'slideUp 0.7s ease' : 'none' }}>
                  <div className="hero-pill hero-pill--primary-bright">
                    ✨ Featured Deal
                  </div>
                  <h1 className="hero-title" style={{ color: 'white' }}>
                    {banner.title}
                  </h1>
                  {banner.subtitle && (
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: 20, lineHeight: 1.7 }}>
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.link_url && (
                    <button className="btn btn-primary btn-lg" onClick={() => navigate(banner.link_url)}>
                      {banner.button_text || 'Shop Now'}
                    </button>
                  )}
                </div>
              </div>

              {/* Admin Slide Editing controls */}
              {isAdmin && (
                <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, display: 'flex', gap: 10 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenEditHero(banner); }}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                    title="Edit Hero Banner"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteHeroBanner(banner.id); }}
                    style={{
                      backgroundColor: 'var(--color-error)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                    title="Delete Hero Banner"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          );
        })}

        </section>

        {/* Carousel indicators/dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16,
        }}>
          {Array.from({ length: totalSlides }).map((_, idx) => (
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

        {/* Admin Create Hero Slide button */}
        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <button
              className="btn btn-sm"
              onClick={handleOpenCreateHero}
              style={{
                background: 'rgba(244,137,147,0.15)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-light)',
                borderRadius: 20,
                padding: '6px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              ➕ Add New Hero Slide
            </button>
          </div>
        )}
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

      {/* ─── Why Choose Us ────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="text-center mb-48">
            <h2 className="section-title">Why <span style={{ color: 'var(--color-primary)' }}>BLUSHH</span>?</h2>
            <p className="section-subtitle">We take pride in what we deliver</p>
          </div>
          <div className="grid-4">
            {WHY_US.map((item, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ background: 'var(--color-secondary)', boxShadow: 'none' }}>{item.icon}</div>
                <h4 className="feature-title">{item.title}</h4>
                <p className="feature-desc">{item.desc}</p>
              </div>
            ))}
          </div>
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
                  background: 'transparent',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: 'none',
                  position: 'relative',
                  aspectRatio: '1.1',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: banner.link_url ? 'pointer' : 'default',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  if (banner.link_url) navigate(banner.link_url);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Banner Image */}
                <div style={{ flex: 1, overflow: 'hidden', background: 'transparent', position: 'relative', borderRadius: 'var(--radius-lg)' }}>
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
                <div style={{ padding: '12px 0 0 0', background: 'transparent', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* ─── Admin Edit Hero Banner Modal ─────────────────────────────────── */}
      {showHeroModal && (
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
              {selectedHero ? 'Edit Hero Slide' : 'Add Hero Slide'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Slide Title *</label>
                <input 
                  className="input" 
                  value={heroForm.title} 
                  onChange={e => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Mega Clearance Sale"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Subtitle</label>
                <textarea 
                  className="textarea" 
                  rows="3"
                  value={heroForm.subtitle} 
                  onChange={e => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Up to 50% off on all organic items..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Image URL</label>
                <input 
                  className="input" 
                  value={heroForm.image_url} 
                  onChange={e => setHeroForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="Leave blank for color gradient background..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Button Text</label>
                <input 
                  className="input" 
                  value={heroForm.button_text} 
                  onChange={e => setHeroForm(prev => ({ ...prev, button_text: e.target.value }))}
                  placeholder="e.g. Shop Now"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Redirect URL</label>
                <input 
                  className="input" 
                  value={heroForm.link_url} 
                  onChange={e => setHeroForm(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="e.g. /products?is_featured=true"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Sort Order</label>
                <input 
                  className="input" 
                  type="number"
                  value={heroForm.sort_order} 
                  onChange={e => setHeroForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowHeroModal(false)}
                disabled={savingHero}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveHeroBanner}
                disabled={savingHero}
              >
                {savingHero ? '⏳ Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
