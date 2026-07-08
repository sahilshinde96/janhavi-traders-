import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, X, Star } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEdit = !!slug;

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', description: '', ingredients: '', how_to_use: '',
    mrp: '', offer_price: '', stock_qty: '', is_active: true, is_featured: false,
    image_urls: [], net_quantity: '',
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    api.get('/products/categories/').then(r => setCategories(r.data.results || r.data)).catch(() => {});
    if (isEdit) {
      api.get(`/products/${slug}/`).then(r => {
        const p = r.data;
        setForm({
          name: p.name, category: p.category, description: p.description,
          ingredients: p.ingredients, how_to_use: p.how_to_use,
          mrp: p.mrp, offer_price: p.offer_price, stock_qty: p.stock_qty,
          is_active: p.is_active, is_featured: p.is_featured,
          image_urls: (p.images || []).map(i => i.image_url),
          net_quantity: p.net_quantity || '',
        });
      }).catch(() => { toast.error('Product not found'); navigate('/admin/products'); });
    }
  }, [slug]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    set('image_urls', [...form.image_urls, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (idx) => {
    set('image_urls', form.image_urls.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.mrp || !form.offer_price) {
      toast.error('Please fill in all required fields'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, mrp: parseFloat(form.mrp), offer_price: parseFloat(form.offer_price), stock_qty: parseInt(form.stock_qty || 0) };
      if (isEdit) {
        await api.patch(`/products/${slug}/`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products/', payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : 'Failed to save product');
    } finally { setSaving(false); }
  };

  const discountPct = form.mrp && form.offer_price
    ? Math.round(((parseFloat(form.mrp) - parseFloat(form.offer_price)) / parseFloat(form.mrp)) * 100)
    : 0;

  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate('/admin/products')}>
        <ChevronLeft size={16} /> Products
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h1>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? '⏳ Saving...' : (isEdit ? '✅ Update' : '✅ Create Product')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Main form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Matte Lipstick Rose Red" />
            </div>
            <div className="form-group">
              <label className="form-label">Net Quantity / Size (Optional)</label>
              <input className="input" value={form.net_quantity} onChange={e => set('net_quantity', e.target.value)} placeholder="e.g. 100ml, 50g, Pack of 2" />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="input" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Product description..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Ingredients</label>
              <textarea className="input" rows={3} value={form.ingredients} onChange={e => set('ingredients', e.target.value)} placeholder="List ingredients..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">How to Use</label>
              <textarea className="input" rows={3} value={form.how_to_use} onChange={e => set('how_to_use', e.target.value)} placeholder="Usage instructions..." style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* Images */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Product Images</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Paste image URL (Cloudinary, ImgBB, etc.)"
                value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddImage()} />
              <button className="btn btn-outline btn-sm" onClick={handleAddImage}><Plus size={14} /> Add</button>
            </div>
            {form.image_urls.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {form.image_urls.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 90, height: 90, borderRadius: 10, overflow: 'hidden', border: `2px solid ${idx === 0 ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.currentTarget.src = ''} />
                    {idx === 0 && (
                      <div style={{ position: 'absolute', top: 2, left: 2, background: 'var(--color-primary)', borderRadius: 4, padding: '1px 4px', fontSize: '0.6rem', color: 'white', fontWeight: 700 }}>PRIMARY</div>
                    )}
                    <button onClick={() => handleRemoveImage(idx)} style={{
                      position: 'absolute', top: 2, right: 2, width: 20, height: 20,
                      background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                      cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 8 }}>First image will be used as the primary display image.</p>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Pricing */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Pricing</h3>
            <div className="form-group">
              <label className="form-label">MRP (₹) *</label>
              <input className="input" type="number" step="0.01" min="0" value={form.mrp} onChange={e => set('mrp', e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Offer Price (₹) *</label>
              <input className="input" type="number" step="0.01" min="0" value={form.offer_price} onChange={e => set('offer_price', e.target.value)} placeholder="0.00" />
            </div>
            {discountPct > 0 && (
              <div style={{ background: 'var(--color-secondary)', borderRadius: 8, padding: '10px 14px', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                🏷️ {discountPct}% discount applied
              </div>
            )}
            <div className="form-group" style={{ marginTop: 16, marginBottom: 0 }}>
              <label className="form-label">Stock Quantity</label>
              <input className="input" type="number" min="0" value={form.stock_qty} onChange={e => set('stock_qty', e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Settings */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Settings</h3>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, cursor: 'pointer' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Active</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Visible to customers</p>
              </div>
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 18, height: 18 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>⭐ Featured</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Show on homepage</p>
              </div>
              <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} style={{ width: 18, height: 18 }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
