import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../api/axios';
import ProductGrid from '../components/product/ProductGrid';

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
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categorySlug) params.set('category_slug', categorySlug);
    if (ordering) params.set('ordering', ordering);
    if (isFeatured) params.set('is_featured', isFeatured);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    params.set('page', page);

    api.get(`/products/?${params}`).then(r => {
      setProducts(r.data.results || r.data);
      setTotalCount(r.data.count || (r.data.results || r.data).length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [search, categorySlug, ordering, isFeatured, minPrice, maxPrice, page]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setPage(1);
    setSearchParams(p);
  };

  const clearAll = () => { setSearchParams({}); setPage(1); };

  const activeFilters = [categorySlug && `Category`, minPrice && `Min ₹${minPrice}`, maxPrice && `Max ₹${maxPrice}`, isFeatured && 'Featured'].filter(Boolean);

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
          {categorySlug ? categories.find(c => c.slug === categorySlug)?.name || 'Products' : 'All Products'}
        </h1>
        <p style={{ color: 'var(--color-text-medium)' }}>
          {loading ? 'Loading...' : `${totalCount} products found`}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
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
        <div style={{
          background: 'white', borderRadius: 12, padding: '20px 24px', marginBottom: 24,
          border: '1px solid var(--color-border)',
          display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end',
          animation: 'slideDown 0.2s ease',
        }}>
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
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!isFeatured}
              onChange={e => updateParam('is_featured', e.target.checked ? 'true' : '')} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Featured Only</span>
          </label>
        </div>
      )}

      {/* Grid */}
      <ProductGrid products={products} loading={loading} />

      {/* Pagination */}
      {totalCount > 20 && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
          <span style={{ padding: '8px 16px', fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>
            Page {page} of {Math.ceil(totalCount / 20)}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(totalCount / 20)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
