import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit2, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import ProductGrid from '../components/product/ProductGrid';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import hero1 from '../assets/hero1.jpg';
import MobileQuickNav from '../components/layout/MobileQuickNav';

const WHY_US = [
  { icon: '✅', title: '100% Authentic', desc: 'All products are sourced directly from brands' },
  { icon: '🌿', title: 'Cruelty Free', desc: 'We only stock cruelty-free certified brands' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered to your door in 2-5 days' },
  { icon: '↩️', title: 'Easy Returns', desc: '7-day hassle-free return policy' },
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
    sort_order: 1,
    is_deal_of_the_day: false
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
  }, []);

  const displaySlides = heroBanners;
  const totalSlides = displaySlides.length;

  useEffect(() => {
    if (totalSlides <= 0) {
      if (activeSlide !== 0) setActiveSlide(0);
      return;
    }

    if (isNaN(activeSlide) || activeSlide >= totalSlides || activeSlide < 0) {
      setActiveSlide(0);
      return;
      
    }

    const interval = setInterval(() => {
      setActiveSlide(current => {
        if (isNaN(current) || current >= totalSlides || current < 0) {
          return 0;
        }
        return (current + 1) % totalSlides;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [totalSlides, activeSlide]);

  // Modal handlers for Brand Banners
  const handleOpenEdit = (banner) => {
    // If this is a fallback banner (not in DB yet), open in CREATE mode
    // so it does POST instead of trying to PATCH a non-existent ID
    const isFallback = banner._isFallback === true;
    setSelectedBanner(isFallback ? null : banner);
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
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.response?.data?.image_url?.[0] || err?.response?.data?.name?.[0];
      if (status === 403) toast.error('Permission denied — log out and log back in as admin.');
      else if (status === 401) toast.error('Session expired — please log out and log in again.');
      else if (status === 400 && detail) toast.error(`Validation error: ${detail}`);
      else toast.error(detail || 'Failed to save brand banner. Please try again.');
      console.error('Banner save error:', err?.response?.status, err?.response?.data);
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner || !selectedBanner.id) return;
    if (!window.confirm(`Are you sure you want to delete the brand banner "${selectedBanner.name}"?`)) return;
    
    setSavingBanner(true);
    try {
      await api.delete(`/products/brand-banners/${selectedBanner.id}/`);
      toast.success("Brand banner deleted successfully!");
      fetchBanners();
      setShowModal(false);
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 403) toast.error('Permission denied — log out and log back in as admin.');
      else if (status === 401) toast.error('Session expired — please log out and log in again.');
      else toast.error(detail || 'Failed to delete brand banner. Please try again.');
      console.error('Banner delete error:', err?.response?.status, err?.response?.data);
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
      sort_order: heroBanners.length + 1,
      is_deal_of_the_day: false
    });
    setShowHeroModal(true);
  };

  const handleOpenEditHero = (banner) => {
    const record = banner.configRecord || banner;
    setSelectedHero(record);
    setHeroForm({
      title: record.title || '',
      subtitle: record.subtitle || '',
      image_url: record.image_url || '',
      link_url: record.link_url || '',
      button_text: record.button_text || 'Shop Now',
      sort_order: record.sort_order || 1,
      is_deal_of_the_day: record.is_deal_of_the_day || false
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
    if (!heroForm.image_url.trim()) {
      toast.error("Image URL is required");
      return;
    }
    setSavingHero(true);
    try {
      const payload = {
        title: heroForm.title.trim() || `Banner ${heroForm.sort_order || Date.now()}`,
        subtitle: '',
        image_url: heroForm.image_url.trim(),
        link_url: heroForm.link_url.trim(),
        button_text: 'Shop Now',
        sort_order: heroForm.sort_order,
        is_deal_of_the_day: heroForm.is_deal_of_the_day
      };
      if (selectedHero && selectedHero.id) {
        await api.patch(`/products/hero-banners/${selectedHero.id}/`, payload);
        toast.success("Hero slide updated!");
      } else {
        await api.post('/products/hero-banners/', payload);
        toast.success("New hero slide added!");
      }
      fetchHeroBanners();
      setShowHeroModal(false);
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.response?.data?.title?.[0];
      if (status === 403) toast.error('Permission denied — log out and log back in as admin.');
      else if (status === 401) toast.error('Session expired — please log out and log in again.');
      else if (status === 400 && detail) toast.error(`Validation error: ${detail}`);
      else toast.error(detail || 'Failed to save hero slide. Please try again.');
      console.error('Hero banner save error:', err?.response?.status, err?.response?.data);
    } finally {
      setSavingHero(false);
    }
  };

  // Determine grid rendering data (use seeded/fetched DB banners)
  const displayBanners = brandBanners;

  return (
    <div>
      {/* ─── Hero Carousel ────────────────────────────────────────────────── */}
      <div className="container mt-24 mb-32">

        {/* Mobile Quick Navigation */}
        <MobileQuickNav />

        <section className="hero-container">
        
        {displaySlides.map((banner, idx) => {
          return (
            <div
              key={banner.id}
              className={`hero-slide ${activeSlide === idx ? 'hero-slide--visible' : 'hero-slide--hidden'}`}
              style={{
                position: 'absolute',
                inset: 0,
                cursor: banner.link_url ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
              onClick={() => {
                if (banner.link_url) {
                  navigate(banner.link_url);
                }
              }}
            >
              {banner.image_url ? (
                <img 
                  src={banner.image_url} 
                  alt={banner.title || "Hero Banner"} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div className="hero-image-placeholder" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  GLOW
                </div>
              )}

              {/* Admin quick-edit badge on active slide only */}
              {isAdmin && activeSlide === idx && (
                <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenEditHero(banner); }}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 20,
                      padding: '6px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
                      backdropFilter: 'blur(4px)',
                    }}
                    title="Edit this slide"
                  >
                    <Edit2 size={13} /> Edit Slide
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

        {/* ── Admin Hero Slide Manager Panel ─────────────────────── */}
        {isAdmin && (
          <div style={{
            marginTop: 20,
            background: 'rgba(244,137,147,0.07)',
            border: '1.5px dashed var(--color-primary-light)',
            borderRadius: 16,
            padding: '16px 20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)', letterSpacing: 0.5 }}>
                🎛️ Admin — Hero Slide Manager
              </span>
              <button
                onClick={handleOpenCreateHero}
                style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                ➕ Add Slide
              </button>
            </div>

            {/* Slide thumbnail row */}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {heroBanners.map((slide, idx) => (
                <div
                  key={slide.id}
                  style={{
                    flexShrink: 0,
                    width: 180,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: `2px solid ${activeSlide === heroBanners.indexOf(slide) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: slide.image_url ? `url(${slide.image_url}) center/cover` : 'linear-gradient(135deg,#1C1C2E,#2D1B3D)',
                    position: 'relative',
                    aspectRatio: '16/9',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onClick={() => setActiveSlide(heroBanners.indexOf(slide))}
                >
                  {/* Overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

                  {/* Title */}
                  <div style={{
                    position: 'absolute',
                    bottom: 36,
                    left: 8,
                    right: 8,
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    zIndex: 2,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {slide.title}
                  </div>

                  {/* Deal badge */}
                  {slide.is_deal_of_the_day && (
                    <div style={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      background: '#FFD369',
                      color: '#1C1C2E',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      borderRadius: 99,
                      padding: '2px 7px',
                      zIndex: 2
                    }}>🔥 DEAL</div>
                  )}

                  {/* Slide number */}
                  <div style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: 99,
                    padding: '2px 7px',
                    zIndex: 2
                  }}>Slide {slide.sort_order}</div>

                  {/* Action buttons */}
                  <div style={{
                    position: 'absolute',
                    bottom: 6,
                    left: 6,
                    right: 6,
                    display: 'flex',
                    gap: 6,
                    zIndex: 2
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEditHero(slide); }}
                      style={{
                        flex: 1,
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '4px 0',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                      title="Edit slide"
                    >
                      <Edit2 size={11} /> Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteHeroBanner(slide.id); }}
                      style={{
                        background: 'rgba(220,38,38,0.85)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '4px 8px',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                      }}
                      title="Delete slide"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
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



      {/* ─── Brand Promotional Banners Grid (Admin Uploadable) ────────────── */}
      {(displayBanners.length > 0 || isAdmin) && (
        <section className="section" style={{ background: 'var(--color-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>Shop by Brand Deals</h2>
                <p className="section-subtitle" style={{ color: 'var(--color-text-medium)', fontSize: '0.95rem', marginTop: 8, textAlign: 'left' }}>
                  Click on your favorite brands to view exclusive discounts and offers!
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenEdit({ _isFallback: true })}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 20,
                    padding: '8px 18px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  ➕ Add Brand Banner
                </button>
              )}
            </div>
            
            {displayBanners.length > 0 ? (
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
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '48px 0',
                color: 'var(--color-text-light)',
                border: '1.5px dashed var(--color-border)',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem'
              }}>
                No brand promotional banners currently configured. Click "Add Brand Banner" above to create one.
              </div>
            )}
          </div>
        </section>
      )}

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
              {selectedBanner ? `✏️ Edit Brand Banner (${selectedBanner.name})` : `➕ Create Brand Banner (${bannerForm.name || 'New'})`}
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
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Redirect URL (optional)</label>
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

            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedBanner && selectedBanner.id ? (
                <button
                  className="btn"
                  onClick={handleDeleteBanner}
                  disabled={savingBanner}
                  style={{
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                >
                  Delete Banner
                </button>
              ) : <div />}
              
              <div style={{ display: 'flex', gap: 12 }}>
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
                  {savingBanner ? '⏳ Saving...' : (selectedBanner ? 'Save Changes' : 'Create Banner')}
                </button>
              </div>
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
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-text-dark)', margin: 0 }}>
                {selectedHero ? `✏️ Edit Slide` : '➕ New Hero Slide'}
              </h3>
              <button onClick={() => setShowHeroModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text-light)', lineHeight: 1 }}>✕</button>
            </div>

            {/* Live image preview */}
            {heroForm.image_url && (
              <div style={{
                width: '100%',
                height: 140,
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 16,
                background: `url(${heroForm.image_url}) center/cover`,
                border: '1px solid var(--color-border)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                <div style={{ position: 'absolute', bottom: 10, left: 12, color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                  {heroForm.title || 'Slide Preview'}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Image URL *</label>
                <input 
                  className="input" 
                  value={heroForm.image_url} 
                  onChange={e => setHeroForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="Paste Unsplash, Cloudinary, or any image URL..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Redirect URL (connected to image button click)</label>
                <input 
                  className="input" 
                  value={heroForm.link_url} 
                  onChange={e => setHeroForm(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="e.g. /products?category=skincare or /products/slug"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0, width: 120 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Sort Order</label>
                <input 
                  className="input" 
                  type="number"
                  value={heroForm.sort_order} 
                  onChange={e => setHeroForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                />
              </div>

              {/* Deal of the Day toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: heroForm.is_deal_of_the_day ? 'rgba(255,211,105,0.12)' : 'var(--color-bg)',
                border: `1.5px solid ${heroForm.is_deal_of_the_day ? '#FFD369' : 'var(--color-border)'}`,
                borderRadius: 10,
                padding: '10px 14px',
                transition: 'all 0.2s'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-dark)' }}>🔥 Deal of the Day Slide</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-medium)', marginTop: 2 }}>Uses this slide image as the background for the highest discount product deal</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={heroForm.is_deal_of_the_day}
                    onChange={e => setHeroForm(prev => ({ ...prev, is_deal_of_the_day: e.target.checked }))}
                  />
                  <span className="toggle-slider" />
                </label>
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
                {savingHero ? '⏳ Saving...' : '💾 Save Slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
