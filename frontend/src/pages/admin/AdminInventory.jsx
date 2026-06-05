import { useState, useEffect } from 'react';
import { AlertTriangle, Save } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState({});
  const [saving, setSaving] = useState({});
  const [filter, setFilter] = useState('low'); // 'all' | 'low' | 'out'

  useEffect(() => {
    api.get('/products/?ordering=stock_qty&page_size=100').then(r => {
      setProducts(r.data.results || r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    if (filter === 'low') return p.stock_qty <= 10;
    if (filter === 'out') return p.stock_qty === 0;
    return true;
  });

  const handleSave = async (slug) => {
    const newQty = parseInt(updates[slug]);
    if (isNaN(newQty) || newQty < 0) { toast.error('Invalid quantity'); return; }
    setSaving(s => ({ ...s, [slug]: true }));
    try {
      await api.patch(`/products/${slug}/`, { stock_qty: newQty });
      setProducts(prev => prev.map(p => p.slug === slug ? { ...p, stock_qty: newQty } : p));
      setUpdates(u => { const n = { ...u }; delete n[slug]; return n; });
      toast.success('Stock updated!');
    } catch { toast.error('Failed to update stock'); }
    finally { setSaving(s => ({ ...s, [slug]: false })); }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>Inventory</h1>
        <p style={{ color: 'var(--color-text-medium)', fontSize: '0.875rem' }}>Manage product stock levels</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Products', value: products.length, color: '#0984E3' },
          { label: 'Low Stock (≤10)', value: products.filter(p => p.stock_qty > 0 && p.stock_qty <= 10).length, color: '#F57C00' },
          { label: 'Out of Stock', value: products.filter(p => p.stock_qty === 0).length, color: '#C62828' },
        ].map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: 12, padding: '20px 24px', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-medium)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{card.label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all','All'], ['low','Low Stock'], ['out','Out of Stock']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '6px 16px', borderRadius: 99,
            border: `1px solid ${filter === val ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: filter === val ? 'var(--color-primary)' : 'white',
            color: filter === val ? 'white' : 'var(--color-text-medium)',
            fontSize: '0.8rem', fontWeight: filter === val ? 700 : 400, cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {['Product', 'SKU', 'Category', 'Current Stock', 'Update Stock', ''].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={6} style={{ padding: 14 }}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td></tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-medium)' }}>No products match this filter</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {p.primary_image ? <img src={p.primary_image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧴</div>}
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-light)', fontFamily: 'monospace' }}>{p.sku}</td>
                <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>{p.category_name}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {p.stock_qty === 0 && <AlertTriangle size={14} color="#C62828" />}
                    <span style={{
                      fontWeight: 700,
                      color: p.stock_qty === 0 ? '#C62828' : p.stock_qty <= 10 ? '#F57C00' : '#2E7D32',
                    }}>
                      {p.stock_qty}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <input className="input" type="number" min="0" style={{ width: 90, textAlign: 'center' }}
                    placeholder={p.stock_qty}
                    value={updates[p.slug] !== undefined ? updates[p.slug] : ''}
                    onChange={e => setUpdates(u => ({ ...u, [p.slug]: e.target.value }))} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {updates[p.slug] !== undefined && updates[p.slug] !== '' && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleSave(p.slug)} disabled={saving[p.slug]}>
                      <Save size={13} /> {saving[p.slug] ? '...' : 'Save'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
