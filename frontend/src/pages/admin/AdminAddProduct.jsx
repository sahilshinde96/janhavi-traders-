import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, X } from 'lucide-react';
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
  
  // Variants list for create mode, each variant now has its own image_urls list
  const [variants, setVariants] = useState([
    { net_quantity: '', mrp: '', offer_price: '', stock_qty: '0', image_urls: [] }
  ]);
  
  // Temporary input state dictionary for variant image text inputs
  const [variantInputs, setVariantInputs] = useState({});
  
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

  // Add image to a specific variant row
  const handleAddVariantImage = (vIdx, url) => {
    if (!url || !url.trim()) return;
    const newV = [...variants];
    if (!newV[vIdx].image_urls) newV[vIdx].image_urls = [];
    newV[vIdx].image_urls.push(url.trim());
    setVariants(newV);
    setVariantInputs(prev => ({ ...prev, [vIdx]: '' }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category) {
      toast.error('Please fill in all required fields'); return;
    }
    
    // Validation for create vs edit flow
    if (isEdit) {
      if (!form.mrp || !form.offer_price) {
        toast.error('Please fill in MRP and Offer Price'); return;
      }
    } else {
      // Create mode variants validation
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.net_quantity.trim() || !v.mrp || !v.offer_price) {
          toast.error(`Please fill in Net Qty, MRP, and Offer Price for Variant #${i + 1}`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      if (isEdit) {
        const payload = { 
          ...form, 
          mrp: parseFloat(form.mrp), 
          offer_price: parseFloat(form.offer_price), 
          stock_qty: parseInt(form.stock_qty || 0) 
        };
        await api.patch(`/products/${slug}/`, payload);
        toast.success('Product updated!');
      } else {
        // Multi-variant creation!
        const basePayload = {
          name: form.name,
          category: form.category,
          description: form.description,
          ingredients: form.ingredients,
          how_to_use: form.how_to_use,
          is_active: form.is_active,
          is_featured: form.is_featured,
        };
        
        // Loop through all variants and send post requests
        const requests = variants.map(v => {
          const payload = {
            ...basePayload,
            net_quantity: v.net_quantity,
            mrp: parseFloat(v.mrp),
            offer_price: parseFloat(v.offer_price),
            stock_qty: parseInt(v.stock_qty || 0),
            // Use specific variant images if added, else fallback to global images
            image_urls: v.image_urls && v.image_urls.length > 0 ? v.image_urls : form.image_urls
          };
          return api.post('/products/', payload);
        });
        
        await Promise.all(requests);
        toast.success(`Successfully created ${variants.length} product variants!`);
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
          {/* Basic info */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Matte Lipstick Rose Red" />
            </div>
            
            {/* Show Net Quantity field in main form ONLY in Edit mode */}
            {isEdit && (
              <div className="form-group">
                <label className="form-label">Net Quantity / Size (Optional)</label>
                <input className="input" value={form.net_quantity} onChange={e => set('net_quantity', e.target.value)} placeholder="e.g. 100ml, 50g, Pack of 2" />
              </div>
            )}

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

          {/* Product Variants (Multiple size variants creation) */}
          {!isEdit && (
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Size Variants &amp; Pricing</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-medium)', marginTop: 4 }}>
                    Add one or more variants (e.g. 50ml, 100ml) with their respective prices, stocks, and specific photos.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setVariants(prev => [...prev, { net_quantity: '', mrp: '', offer_price: '', stock_qty: '0', image_urls: [] }])}
                >
                  ➕ Add Size Variant
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {variants.map((v, idx) => (
                  <div key={idx} style={{ background: 'var(--color-bg)', padding: 16, borderRadius: 12, border: '1px solid var(--color-border)' }}>
                    {/* Basic pricing fields */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Net Qty / Size *</label>
                        <input className="input" placeholder="e.g. 100ml" value={v.net_quantity} onChange={e => {
                          const newV = [...variants];
                          newV[idx].net_quantity = e.target.value;
                          setVariants(newV);
                        }} />
                      </div>
                      <div style={{ flex: '1 1 100px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>MRP (₹) *</label>
                        <input className="input" type="number" placeholder="0" value={v.mrp} onChange={e => {
                          const newV = [...variants];
                          newV[idx].mrp = e.target.value;
                          setVariants(newV);
                        }} />
                      </div>
                      <div style={{ flex: '1 1 100px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Offer Price *</label>
                        <input className="input" type="number" placeholder="0" value={v.offer_price} onChange={e => {
                          const newV = [...variants];
                          newV[idx].offer_price = e.target.value;
                          setVariants(newV);
                        }} />
                      </div>
                      <div style={{ flex: '1 1 80px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Stock</label>
                        <input className="input" type="number" placeholder="0" value={v.stock_qty} onChange={e => {
                          const newV = [...variants];
                          newV[idx].stock_qty = e.target.value;
                          setVariants(newV);
                        }} />
                      </div>
                      {variants.length > 1 && (
                        <button 
                          type="button"
                          className="btn btn-sm"
                          style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)', background: 'transparent', height: 38 }}
                          onClick={() => setVariants(prev => prev.filter((_, i) => i !== idx))}
                        >
                          Remove Size
                        </button>
                      )}
                    </div>

                    {/* Specific Variant Images */}
                    <div style={{ marginTop: 12, borderTop: '1px dashed var(--color-border)', paddingTop: 12 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--color-text-medium)' }}>
                        Variant-Specific Images (Optional — falls back to global images below if empty)
                      </label>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input 
                          className="input" 
                          style={{ flex: 1, padding: '6px 12px', fontSize: '0.85rem' }} 
                          placeholder="Paste image URL specifically for this size..." 
                          value={variantInputs[idx] || ''} 
                          onChange={e => setVariantInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddVariantImage(idx, variantInputs[idx]);
                            }
                          }}
                        />
                        <button 
                          type="button" 
                          className="btn btn-outline btn-sm"
                          style={{ height: 36 }}
                          onClick={() => handleAddVariantImage(idx, variantInputs[idx])}
                        >
                          Add Size Image
                        </button>
                      </div>

                      {/* Variant specific image thumbnails */}
                      {v.image_urls && v.image_urls.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                          {v.image_urls.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} style={{ position: 'relative', width: 44, height: 44, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                              <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newV = [...variants];
                                  newV[idx].image_urls = newV[idx].image_urls.filter((_, i) => i !== imgIdx);
                                  setVariants(newV);
                                }} 
                                style={{
                                  position: 'absolute', top: 1, right: 1, width: 14, height: 14,
                                  background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                                  cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '8px', padding: 0
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global Images (Used as fallback for variants, or main images for editing) */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>
              {isEdit ? 'Product Images' : 'Global / Shared Product Images'}
            </h3>
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
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 8 }}>
              {isEdit ? 'First image will be used as the primary display image.' : 'These photos will be used for any size variants that do not have their own specific images.'}
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Pricing (Single variant edit view) */}
          {isEdit && (
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
          )}

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
