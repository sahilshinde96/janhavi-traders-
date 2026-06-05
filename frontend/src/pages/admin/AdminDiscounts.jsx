import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, Tag } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_value: '', max_discount_amount: '', max_uses: '', is_active: true, valid_from: '', valid_until: '' };

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/discounts/admin/coupons/').then(r => { setCoupons(r.data.results || r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (c) => {
    setForm({ code: c.code, description: c.description, discount_type: c.discount_type, discount_value: c.discount_value, min_order_value: c.min_order_value, max_discount_amount: c.max_discount_amount || '', max_uses: c.max_uses || '', is_active: c.is_active, valid_from: c.valid_from ? c.valid_from.slice(0, 16) : '', valid_until: c.valid_until ? c.valid_until.slice(0, 16) : '' });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.code || !form.discount_value) { toast.error('Code and discount value are required'); return; }
    setSaving(true);
    const payload = { ...form, discount_value: parseFloat(form.discount_value), min_order_value: parseFloat(form.min_order_value || 0), max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null, max_uses: form.max_uses ? parseInt(form.max_uses) : null, valid_from: form.valid_from || null, valid_until: form.valid_until || null };
    try {
      if (editId) {
        const { data } = await api.put(`/discounts/admin/coupons/${editId}/`, payload);
        setCoupons(prev => prev.map(c => c.id === editId ? data : c));
        toast.success('Coupon updated!');
      } else {
        const { data } = await api.post('/discounts/admin/coupons/', payload);
        setCoupons(prev => [data, ...prev]);
        toast.success('Coupon created!');
      }
      setShowForm(false); setEditId(null); setForm(EMPTY);
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.code?.[0] || d?.discount_value?.[0] || 'Failed to save coupon');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try { await api.delete(`/discounts/admin/coupons/${id}/`); setCoupons(prev => prev.filter(c => c.id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>Discounts & Coupons</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Create Coupon</button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '2px solid var(--color-primary)', marginBottom: 24, animation: 'slideDown 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>{editId ? 'Edit Coupon' : 'New Coupon'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Coupon Code *</label>
              <input className="input" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SAVE20" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Discount Type</label>
              <select className="select" value={form.discount_type} onChange={e => set('discount_type', e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Discount Value *</label>
              <input className="input" type="number" value={form.discount_value} onChange={e => set('discount_value', e.target.value)} placeholder={form.discount_type === 'percentage' ? '20' : '100'} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Min Order Value (₹)</label>
              <input className="input" type="number" value={form.min_order_value} onChange={e => set('min_order_value', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Discount (₹) <span style={{ color: 'var(--color-text-light)' }}>(% only)</span></label>
              <input className="input" type="number" value={form.max_discount_amount} onChange={e => set('max_discount_amount', e.target.value)} placeholder="Optional" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Uses</label>
              <input className="input" type="number" value={form.max_uses} onChange={e => set('max_uses', e.target.value)} placeholder="Unlimited" />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 3' }}>
              <label className="form-label">Description</label>
              <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. 20% off your first order" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Valid From</label>
              <input className="input" type="datetime-local" value={form.valid_from} onChange={e => set('valid_from', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Valid Until</label>
              <input className="input" type="datetime-local" value={form.valid_until} onChange={e => set('valid_until', e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} id="active" />
              <label htmlFor="active" style={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Active</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? '...' : <><Check size={14} /> {editId ? 'Update' : 'Create'}</>}</button>
            <button className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />) :
        coupons.map(c => (
          <div key={c.id} style={{ background: 'white', borderRadius: 16, padding: '18px 24px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'var(--color-secondary)', borderRadius: 10, padding: '10px 16px', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)', letterSpacing: '2px' }}>
                {c.code}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                  </span>
                  {c.min_order_value > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>min ₹{c.min_order_value}</span>}
                  <span style={{ background: c.is_active ? '#E8F5E9' : '#FFEBEE', color: c.is_active ? '#2E7D32' : '#C62828', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-medium)' }}>
                  {c.description} · Used: {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}
                  {c.valid_until && ` · Expires: ${new Date(c.valid_until).toLocaleDateString('en-IN')}`}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}><Edit size={14} /> Edit</button>
              <button className="btn btn-sm" onClick={() => handleDelete(c.id, c.code)} style={{ color: 'var(--color-error)', background: '#FFEBEE', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-medium)' }}>
            <Tag size={40} color="var(--color-border)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, marginBottom: 8 }}>No coupons yet</p>
            <button className="btn btn-primary" onClick={openAdd}>Create First Coupon</button>
          </div>
        )}
      </div>
    </div>
  );
}
