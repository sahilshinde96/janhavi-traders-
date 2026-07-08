import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page });
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    api.get(`/products/?${params}`).then(r => {
      setProducts(r.data.results || r.data);
      setTotal(r.data.count || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/products/categories/')
      .then(r => setCategories(r.data.results || r.data))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [search, page, selectedCategory]);

  const handleDelete = async (slug, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${slug}/`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete product'); }
  };

  const handleToggleActive = async (slug, current) => {
    try {
      await api.patch(`/products/${slug}/`, { is_active: !current });
      setProducts(p => p.map(prod => prod.slug === slug ? { ...prod, is_active: !current } : prod));
      toast.success(current ? 'Product hidden' : 'Product visible');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>Products</h1>
          <p style={{ color: 'var(--color-text-medium)', fontSize: '0.875rem' }}>{total} products total</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/products/add')}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Controls (Search & Category Filter) */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input className="input" style={{ paddingLeft: 36, background: 'white' }} placeholder="Search products..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {/* Category Filter */}
        <select 
          className="select" 
          style={{ width: '100%', maxWidth: 200, background: 'white' }}
          value={selectedCategory}
          onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {['Product', 'Category', 'MRP', 'Offer Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))
            ) : products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0 }}>
                      {p.primary_image ? <img src={p.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧴</div>}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>{p.category_name}</td>
                <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>₹{parseFloat(p.mrp).toFixed(0)}</td>
                <td style={{ padding: '14px 16px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{parseFloat(p.offer_price).toFixed(0)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    background: p.stock_qty === 0 ? '#FFEBEE' : p.stock_qty <= 10 ? '#FFF3E0' : '#E8F5E9',
                    color: p.stock_qty === 0 ? '#C62828' : p.stock_qty <= 10 ? '#F57C00' : '#2E7D32',
                    padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {p.stock_qty === 0 ? 'Out of Stock' : `${p.stock_qty} left`}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    background: p.is_active ? '#E8F5E9' : '#FFEBEE',
                    color: p.is_active ? '#2E7D32' : '#C62828',
                    padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-icon btn-ghost btn-sm" onClick={() => navigate(`/admin/products/edit/${p.slug}`)} title="Edit">
                      <Edit size={15} />
                    </button>
                    <button className="btn-icon btn-ghost btn-sm" onClick={() => handleToggleActive(p.slug, p.is_active)} title={p.is_active ? 'Hide' : 'Show'}>
                      {p.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button className="btn-icon btn-sm" onClick={() => handleDelete(p.slug, p.name)} title="Delete"
                      style={{ color: 'var(--color-error)', background: '#FFEBEE', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && !loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-medium)' }}>
            No products found. <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={() => navigate('/admin/products/add')}>Add Product</button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ padding: '8px 16px', fontSize: '0.875rem' }}>Page {page} of {Math.ceil(total / 20)}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
