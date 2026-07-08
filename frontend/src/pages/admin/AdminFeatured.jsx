import { useState, useEffect } from 'react';
import { Star, Search, Plus, Trash2, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminFeatured() {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Fetch all featured products (can support larger limit/page size to list all)
  const fetchFeatured = async () => {
    setLoadingFeatured(true);
    try {
      const res = await api.get('/products/?is_featured=true&page_size=100');
      // If backend defaults to paginated list, we read results
      setFeatured(res.data.results || res.data);
    } catch (err) {
      toast.error('Failed to load featured products');
    } finally {
      setLoadingFeatured(false);
    }
  };

  // Search products database
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const res = await api.get(`/products/?search=${encodeURIComponent(query)}&page_size=10`);
      const results = res.data.results || res.data;
      // Filter out products that are already featured
      const featuredIds = new Set(featured.map(p => p.id));
      setSearchResults(results.filter(p => !featuredIds.has(p.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Toggle Featured status
  const handleToggleFeatured = async (product, makeFeatured) => {
    try {
      await api.patch(`/products/${product.slug}/`, { is_featured: makeFeatured });
      toast.success(
        makeFeatured 
          ? `Added "${product.name}" to Featured Products` 
          : `Removed "${product.name}" from Featured Products`
      );
      
      // Refresh featured products
      await fetchFeatured();
      
      // Update search results list if query is active
      if (searchQuery.trim()) {
        if (makeFeatured) {
          setSearchResults(prev => prev.filter(p => p.id !== product.id));
        } else {
          // If removed, we don't necessarily add it back to search results unless they match the query
          if (product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            setSearchResults(prev => [...prev, product]);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Star size={26} style={{ color: '#E9C46A', fill: '#E9C46A' }} /> Featured Homepage Products
        </h1>
        <p style={{ color: 'var(--color-text-medium)', fontSize: '0.875rem', marginTop: 4 }}>
          Featured products are displayed highlighted in the primary carousel grids on your customer homepage.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
        {/* Left: Current Featured Products list */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Highlighted Products</span>
            <span style={{ fontSize: '0.75rem', padding: '3px 10px', background: 'var(--color-secondary)', color: 'var(--color-primary)', borderRadius: 99, fontWeight: 700 }}>
              {featured.length} Total
            </span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginBottom: 20 }}>
            List of products currently featured on your storefront homepage.
          </p>

          {loadingFeatured ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '2px dashed var(--color-border)', borderRadius: 12 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⭐</div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-medium)' }}>No Featured Products</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', maxWidth: 240, margin: '6px auto 0' }}>
                Use the search block on the right to add highlighted products to the homepage.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto', paddingRight: 6 }}>
              {featured.map(product => (
                <div 
                  key={product.id} 
                  style={{
                    display: 'flex', alignItems: 'center', justifyItems: 'space-between', 
                    padding: 12, borderRadius: 12, border: '1px solid var(--color-border)',
                    background: '#FCFCFC'
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0, marginRight: 12 }}>
                    {product.primary_image ? (
                      <img src={product.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧴</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
                      {product.category_name} {product.net_quantity && `• ${product.net_quantity}`}
                    </p>
                  </div>
                  <button 
                    type="button"
                    title="Remove from Featured"
                    onClick={() => handleToggleFeatured(product, false)}
                    style={{
                      border: 'none', background: '#FFEBEE', color: 'var(--color-error)',
                      borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFCDD2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FFEBEE'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Search & Add Products card */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>Add Products</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginBottom: 20 }}>
            Search products in your catalog database and feature them instantly.
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
            <input 
              className="input" 
              style={{ paddingLeft: 36, background: 'white' }} 
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          {loadingSearch ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2].map(i => (
                <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
              ))}
            </div>
          ) : searchQuery.trim() === '' ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '2px dashed var(--color-border)', borderRadius: 12, color: 'var(--color-text-light)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</div>
              <p style={{ fontSize: '0.85rem' }}>Type above to search your products catalog</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-medium)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>No matching products found</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 4 }}>
                All matching items may already be featured, or do not exist in active catalogs.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto' }}>
              {searchResults.map(product => (
                <div 
                  key={product.id} 
                  style={{
                    display: 'flex', alignItems: 'center', 
                    padding: 12, borderRadius: 12, border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0, marginRight: 12 }}>
                    {product.primary_image ? (
                      <img src={product.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧴</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
                      {product.category_name} {product.net_quantity && `• ${product.net_quantity}`}
                    </p>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', height: 'fit-content' }}
                    onClick={() => handleToggleFeatured(product, true)}
                  >
                    <Plus size={14} /> Feature
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
