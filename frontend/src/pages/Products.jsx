import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../api/axios';
import ProductGrid from '../components/product/ProductGrid';
import MobileQuickNav from '../components/layout/MobileQuickNav';

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'offer_price', label: 'Price: Low to High' },
  { value: '-offer_price', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category_slug') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  const isFeatured = searchParams.get('is_featured') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  useEffect(() => {
    api.get('/products/categories/').then(r => setCategories(r.data.results || r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categorySlug) params.set('category_slug', categorySlug);
    if (ordering) params.set('ordering', ordering);
    if (isFeatured) params.set('is_featured', isFeatured);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    params.set('page', page);

    api.get(`/products/?${params}`).then(r => {
      const newProducts = r.data.results || r.data;
      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      setTotalCount(r.data.count || (r.data.results || r.data).length);
      setLoading(false);
      setLoadingMore(false);
    }).catch(() => {
      setLoading(false);
      setLoadingMore(false);
    });
  }, [search, categorySlug, ordering, isFeatured, minPrice, maxPrice, page]);

  // Infinite Scroll Event Listener
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || products.length >= totalCount) return;
      
      // Load more when scrolled close to the bottom (within 300px)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, products.length, totalCount]);

  // Scroll to top when products load on page 1
  useEffect(() => {
    if (!loading && page === 1) {
      const performScroll = () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        if (document.body) {
          document.body.scrollTop = 0;
        }
      };

      performScroll();
      requestAnimationFrame(performScroll);
      const timer = setTimeout(performScroll, 50);
      return () => clearTimeout(timer);
    }
  }, [loading, page]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setPage(1);
    setSearchParams(p);
  };

  const clearAll = () => { setSearchParams({}); setPage(1); };

  const activeFilters = [
    categorySlug && `Category`, 
    minPrice && `Min ₹${minPrice}`, 
    maxPrice && `Max ₹${maxPrice}`, 
    isFeatured && 'Featured'
  ].filter(Boolean);

  return (
    <div className="container page-container-sm">
      {/* Mobile Quick Navigation */}
      <MobileQuickNav />

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          {categorySlug ? categories.find(c => c.slug === categorySlug)?.name || 'Products' : 'All Products'}
        </h1>
        <p className="text-medium">
          {loading ? 'Loading...' : `${totalCount} products found`}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-12 mb-24 flex-wrap align-center">
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search products..."
            value={search}
            onChange={e => updateParam('search', e.target.value)}
          />
        </div>

        {/* Category */}
        <select className="select" style={{ flex: '1 1 160px', maxWidth: 200 }}
          value={categorySlug} onChange={e => updateParam('category_slug', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>

        {/* Sort */}
        <select className="select" style={{ flex: '1 1 180px', maxWidth: 220 }}
          value={ordering} onChange={e => updateParam('ordering', e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Filter toggle */}
        <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={16} />
          Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
        </button>

        {activeFilters.length > 0 && (
          <button className="btn btn-sm" style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)', background: 'transparent', borderRadius: 99 }} onClick={clearAll}>
            <X size={14} /> Clear All
          </button>
        )}
      </div>

      {/* Price filters */}
      {showFilters && (
        <div className="filter-panel">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Min Price (₹)</label>
            <input className="input" type="number" placeholder="0" style={{ width: 120 }}
              value={minPrice} onChange={e => updateParam('min_price', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Max Price (₹)</label>
            <input className="input" type="number" placeholder="5000" style={{ width: 120 }}
              value={maxPrice} onChange={e => updateParam('max_price', e.target.value)} />
          </div>
          <label className="flex align-center gap-8" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={!!isFeatured}
              onChange={e => updateParam('is_featured', e.target.checked ? 'true' : '')} />
            <span className="fs-sm fw-600">Featured Only</span>
          </label>
        </div>
      )}

      {/* Grid */}
      <ProductGrid products={products} loading={loading} />

      {/* Load More Skeleton row at the bottom */}
      {loadingMore && (
        <div className="grid-products" style={{ marginTop: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
              <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 16, borderRadius: 4, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '60%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 36, borderRadius: 20 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* End of results message */}
      {!loading && !loadingMore && products.length >= totalCount && products.length > 0 && (
        <div style={{ textAlign: 'center', margin: '40px 0', color: 'var(--color-text-light)', fontSize: '0.85rem', fontWeight: 600 }}>
          ✨ You've viewed all {totalCount} products
        </div>
      )}
    </div>
  );
}
