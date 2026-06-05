import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', image: '', sort_order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/products/categories/').then(r => { setCategories(r.data.results || r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (cat) => { setForm({ name: cat.name, description: cat.description, image: cat.image || '', sort_order: cat.sort_order }); setEditId(cat.id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        const cat = categories.find(c => c.id === editId);
        const { data } = await api.put(`/products/categories/${cat.slug}/`, form);
        setCategories(prev => prev.map(c => c.id === editId ? data : c));
        toast.success('Category updated!');
      } else {
        const { data } = await api.post('/products/categories/', form);
        setCategories(prev => [...prev, data]);
        toast.success('Category created!');
      }
      closeForm();
    } catch { toast.error('Failed to save category'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (slug, name) => {
    if (!confirm(`Delete category "${name}"? Products in this category will be uncategorized.`)) return;
    try {
      await api.delete(`/products/categories/${slug}/`);
      setCategories(prev => prev.filter(c => c.slug !== slug));
      toast.success('Category deleted');
    } catch { toast.error('Failed to delete category'); }
  };

  const handleToggle = async (cat) => {
    try {
      const { data } = await api.patch(`/products/categories/${cat.slug}/`, { is_active: !cat.is_active });
      setCategories(prev => prev.map(c => c.id === cat.id ? data : c));
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>Categories</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '2px solid var(--color-primary)', marginBottom: 24, animation: 'slideDown 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>{editId ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Makeup" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sort Order</label>
              <input className="input" type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Category description..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Image URL</label>
              <input className="input" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? '...' : <><Check size={14} /> {editId ? 'Update' : 'Create'}</>}
            </button>
            <button className="btn btn-ghost" onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {loading ? (
          [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)
        ) : categories.map(cat => (
          <div key={cat.id} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontWeight: 700 }}>{cat.name}</h3>
                  <span style={{
                    background: cat.is_active ? '#E8F5E9' : '#FFEBEE',
                    color: cat.is_active ? '#2E7D32' : '#C62828',
                    padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                  }}>{cat.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-medium)', marginBottom: 4 }}>{cat.description}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{cat.product_count} products</p>
              </div>
              {cat.image && (
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={cat.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>
                <Edit size={13} /> Edit
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(cat)} style={{ color: cat.is_active ? 'var(--color-error)' : 'var(--color-success)' }}>
                {cat.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button className="btn btn-sm" onClick={() => handleDelete(cat.slug, cat.name)} style={{ color: 'var(--color-error)', background: '#FFEBEE', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', marginLeft: 'auto' }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
