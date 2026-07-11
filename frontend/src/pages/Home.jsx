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
  { id: null, _isFallback: true, name: "Good Vibes", image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", link_url: "/products?search=Good+Vibes", sort_order: 1 },
  { id: null, _isFallback: true, name: "Nivea", image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", link_url: "/products?search=Nivea", sort_order: 2 },
  { id: null, _isFallback: true, name: "NY Bae", image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600", link_url: "/products?search=NY+Bae", sort_order: 3 },
  { id: null, _isFallback: true, name: "The Derma Co", image_url: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=600", link_url: "/products?search=Derma", sort_order: 4 },
  { id: null, _isFallback: true, name: "DermDoc", image_url: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600", link_url: "/products?search=DermDoc", sort_order: 5 },
  { id: null, _isFallback: true, name: "Lakme", image_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600", link_url: "/products?search=Lakme", sort_order: 6 },
  { id: null, _isFallback: true, name: "Alps Goodness", image_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600", link_url: "/products?search=Alps", sort_order: 7 },
  { id: null, _isFallback: true, name: "Swiss Beauty", image_url: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600", link_url: "/products?search=Swiss", sort_order: 8 },
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
  const [isGraphicOnly, setIsGraphicOnly] = useState(false);
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

  // Get the special configuration banner for Deal of the Day from the DB
  const dealConfig = heroBanners.find(b => b.is_deal_of_the_day);

  // General custom hero banners
  const generalBanners = heroBanners.filter(b => !b.is_deal_of_the_day);

  // Build slide array dynamically to include the database-loaded custom slides AND the dynamic Deal of the Day slide
  const displaySlides = [...generalBanners];
  
  if (bestDiscountProduct) {
    displaySlides.push({
      id: dealConfig?.id || 'dynamic-deal-of-the-day',
      isDynamicDeal: true,
      title: bestDiscountProduct.name,
      // Use the background image from the database slide config, or fall back to a beautiful beauty deal unsplash image if none
      image_url: dealConfig?.image_url || 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=1600',
      link_url: `/products/${bestDiscountProduct.slug}`,
      mrp: bestDiscountProduct.mrp,
      offer_price: bestDiscountProduct.offer_price,
      discount_percent: maxDiscountPercent,
      subtitle: dealConfig?.subtitle || "Get this bestseller now at an unbeatable price! Only COD and free shipping above ₹299.",
      button_text: dealConfig?.button_text || "Grab this Offer",
      configRecord: dealConfig
    });
  } else {
    displaySlides.push({
      id: dealConfig?.id || 'dynamic-deal-fallback',
      isDynamicDealFallback: true,
      title: dealConfig?.title || "Mega Beauty Discounts",
      subtitle: dealConfig?.subtitle || "Don't miss our highest discount items. Quality makeup and skincare at unbeatable prices!",
      image_url: dealConfig?.image_url || 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=1600',
      link_url: dealConfig?.link_url || "/products?is_featured=true",
      button_text: dealConfig?.button_text || "View Bestsellers",
      configRecord: dealConfig
    });
  }

  const totalSlides = displaySlides.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(current => (current + 1) % totalSlides);
    }, 6000);
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
    setIsGraphicOnly(false);
    setShowHeroModal(true);
  };

  const handleOpenEditHero = (banner) => {
    const record = banner.configRecord || banner;
    setSelectedHero(record);
    const graphicMode = record.title ? record.title.startsWith('[GRAPHIC]') : false;
    setHeroForm({
      title: graphicMode ? record.title.replace('[GRAPHIC]', '').trim() : (record.title || ''),
      subtitle: record.subtitle || '',
      image_url: record.image_url || '',
      link_url: record.link_url || '',
      button_text: record.button_text || 'Shop Now',
      sort_order: record.sort_order || 1,
      is_deal_of_the_day: record.is_deal_of_the_day || false
    });
    setIsGraphicOnly(graphicMode);
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
    if (!heroForm.title.trim() && !isGraphicOnly) {
      toast.error("Title is required");
      return;
    }
    setSavingHero(true);
    try {
      const savedTitle = isGraphicOnly ? `[GRAPHIC] ${heroForm.title.trim()}`.trim() : heroForm.title.trim();
      const payload = {
        title: savedTitle || '[GRAPHIC]',
        subtitle: isGraphicOnly ? '' : heroForm.subtitle,
        image_url: heroForm.image_url,
        link_url: heroForm.link_url,
        button_text: isGraphicOnly ? '' : heroForm.button_text,
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

  // Determine grid rendering data (use seeded/fetched DB banners, falling back to static layout)
  const displayBanners = brandBanners.length > 0 ? brandBanners : FALLBACK_BANNERS;

  return (
    <div>
      {/* ─── Hero Carousel ────────────────────────────────────────────────── */}
      <div className="container mt-24 mb-32">
        <section className="hero-container">
        
        {displaySlides.map((banner, idx) => {
          const isDeal = banner.isDynamicDeal;
          const isGraphicOnly = banner.title && banner.title.startsWith('[GRAPHIC]');
          const cleanTitle = isGraphicOnly ? banner.title.replace('[GRAPHIC]', '').trim() : banner.title;
          
          return (
            <div
              key={banner.id}
              className={`hero-slide ${activeSlide === idx ? 'hero-slide--visible' : 'hero-slide--hidden'}`}
              style={{
                backgroundImage: banner.image_url ? `url(${banner.image_url})` : 'none',
                backgroundSize: isGraphicOnly ? 'contain' : 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundColor: isGraphicOnly ? '#1e2630' : '#1C1C2E',
                position: 'absolute',
                inset: 0,
                cursor: (isGraphicOnly && banner.link_url) ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (isGraphicOnly && banner.link_url) {
                  navigate(banner.link_url);
                }
              }}
            >
              {/* Dark overlay for contrast - only if NOT graphic-only */}
              {!isGraphicOnly && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1 }} />
              )}
              
              {!isGraphicOnly && (
                <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div style={{ maxWidth: 620, animation: activeSlide === idx ? 'slideUp 0.7s ease' : 'none' }}>
                    
                    {/* category/deal pill */}
                    <div className={`hero-pill ${isDeal ? 'hero-pill--gold' : 'hero-pill--primary-bright'}`}>
                      {isDeal ? `🔥 Deal of the Day: ${banner.discount_percent?.toFixed(0)}% OFF` : '✨ Featured Deal'}
                    </div>

                    {/* title */}
                    <h1 className="hero-title" style={{ color: 'white', lineHeight: 1.25, marginBottom: 16 }}>
                      {cleanTitle}
                    </h1>

                    {/* subtitle */}
                    {banner.subtitle && (
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: 20, lineHeight: 1.65 }}>
                        {banner.subtitle}
                      </p>
                    )}

                    {/* Price info for dynamic deals */}
                    {isDeal && (
                      <div className="flex align-center gap-16 mb-24">
                        <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFD369' }}>₹{banner.offer_price}</span>
                        <span style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>₹{banner.mrp}</span>
                      </div>
                    )}

                    {/* CTA button */}
                    {banner.link_url && (
                      <button className="btn btn-primary btn-lg" onClick={() => navigate(banner.link_url)}>
                        {banner.button_text || 'Shop Now'}
                      </button>
                    )}
                  </div>
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
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Slide Title *</label>
                <input 
                  className="input" 
                  value={heroForm.title} 
                  onChange={e => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Your Glow Journey Begins Here"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Subtitle</label>
                <textarea 
                  className="textarea" 
                  
                  rows="2"
                  value={heroForm.subtitle} 
                  onChange={e => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Explore dermatologist-tested cosmetics..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Background Image URL</label>
                <input 
                  className="input" 
                  value={heroForm.image_url} 
                  onChange={e => setHeroForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="Paste Unsplash or Cloudinary URL..."
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group flex-1" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Button Text</label>
                  <input 
                    className="input" 
                    value={heroForm.button_text} 
                    onChange={e => setHeroForm(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0, width: 90 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Order</label>
                  <input 
                    className="input" 
                    type="number"
                    value={heroForm.sort_order} 
                    onChange={e => setHeroForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Redirect URL (on button click)</label>
                <input 
                  className="input" 
                  value={heroForm.link_url} 
                  onChange={e => setHeroForm(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="e.g. /products?category=skincare"
                />
              </div>

              {/* Graphic Only toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isGraphicOnly ? 'rgba(244,137,147,0.08)' : 'var(--color-bg)',
                border: `1.5px solid ${isGraphicOnly ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 10,
                padding: '10px 14px',
                transition: 'all 0.2s',
                marginBottom: 10
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-dark)' }}>🖼️ Graphic-Only Banner (Full Bleed)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-medium)', marginTop: 2 }}>Hides title/subtitle text overlays. Shows full image without dark shading.</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isGraphicOnly}
                    onChange={e => setIsGraphicOnly(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
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
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-medium)', marginTop: 2 }}>Shows the product with highest discount automatically</div>
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
