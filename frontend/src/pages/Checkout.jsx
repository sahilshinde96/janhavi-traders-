import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, MapPin, Check } from 'lucide-react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, fetchCart, clearCart } = useCartStore();
  const appliedCoupon = location.state?.appliedCoupon;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: 'Maharashtra', pincode: '' });

  useEffect(() => {
    fetchCart();
    api.get('/auth/addresses/').then(r => {
      setAddresses(r.data);
      const def = r.data.find(a => a.is_default) || r.data[0];
      if (def) setSelectedAddress(def);
      if (r.data.length === 0) setShowNewForm(true);
    }).catch(() => setShowNewForm(true));
  }, []);

  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.total || 0);
  const discount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount) : 0;
  const deliveryCharge = subtotal >= 500 ? 0 : (subtotal > 0 ? 50 : 0);
  const total = subtotal - discount + deliveryCharge;

  const handleAddAddress = async () => {
    const required = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const f of required) {
      if (!newAddr[f].trim()) { toast.error(`Please fill in ${f}`); return; }
    }
    try {
      const { data } = await api.post('/auth/addresses/', newAddr);
      setAddresses(prev => [...prev, data]);
      setSelectedAddress(data);
      setShowNewForm(false);
      toast.success('Address saved!');
    } catch { toast.error('Failed to save address'); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && !showNewForm) { toast.error('Please select a delivery address'); return; }

    let address = selectedAddress;
    if (showNewForm) {
      const required = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
      for (const f of required) {
        if (!newAddr[f].trim()) { toast.error(`Please fill in ${f}`); return; }
      }
      address = newAddr;
    }

    setPlacing(true);
    try {
      const { data } = await api.post('/orders/place/', {
        address: { name: address.name, phone: address.phone, line1: address.line1, line2: address.line2 || '', city: address.city, state: address.state, pincode: address.pincode },
        coupon_code: appliedCoupon?.code || '',
      });
      await clearCart();
      navigate('/order-success', { state: { order: data } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
      setPlacing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: 32 }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
        {/* Left: Address */}
        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="var(--color-primary)" /> Delivery Address
            </h3>

            {/* Saved addresses */}
            {addresses.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {addresses.map(addr => (
                  <div key={addr.id} onClick={() => { setSelectedAddress(addr); setShowNewForm(false); }} style={{
                    border: `2px solid ${selectedAddress?.id === addr.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 12, padding: '16px', cursor: 'pointer',
                    background: selectedAddress?.id === addr.id ? 'var(--color-secondary)' : 'white',
                    transition: 'all 0.2s',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: `2px solid ${selectedAddress?.id === addr.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: selectedAddress?.id === addr.id ? 'var(--color-primary)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selectedAddress?.id === addr.id && <Check size={12} color="white" />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: 4 }}>{addr.name} <span className="badge badge-neutral" style={{ marginLeft: 8 }}>{addr.label}</span></p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>{addr.city}, {addr.state} – {addr.pincode}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>📞 {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new */}
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowNewForm(!showNewForm); setSelectedAddress(null); }}>
              <Plus size={14} /> {showNewForm ? 'Cancel' : 'Add New Address'}
            </button>

            {showNewForm && (
              <div style={{ marginTop: 20, animation: 'slideDown 0.2s ease' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {[['name','Full Name'],['phone','Phone Number'],['line1','Address Line 1'],['line2','Address Line 2 (Optional)'],['city','City'],['pincode','PIN Code']].map(([key, label]) => (
                    <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{label}</label>
                      <input className="input" value={newAddr[key]} onChange={e => setNewAddr(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">State</label>
                    <select className="select" value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))}>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Label</label>
                    <select className="select" value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))}>
                      <option>Home</option><option>Work</option><option>Other</option>
                    </select>
                  </div>
                </div>
                {addresses.length > 0 && (
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={handleAddAddress}>Save Address</button>
                )}
              </div>
            )}
          </div>

          {/* Payment */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>💳 Payment Method</h3>
            <div style={{
              border: '2px solid var(--color-primary)', borderRadius: 12, padding: '16px 20px',
              background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>💵 Cash on Delivery (COD)</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-medium)' }}>Pay when your order arrives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: 250, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0 }}>
                    {item.product?.primary_image ? <img src={item.product.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧴</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>₹{parseFloat(item.subtotal || 0).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-text-medium)' }}>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
              {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-success)' }}>Coupon Discount</span><span style={{ color: 'var(--color-success)' }}>-₹{discount.toFixed(0)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-text-medium)' }}>Delivery</span><span style={{ color: deliveryCharge === 0 ? 'var(--color-success)' : undefined }}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>
              <span>Total</span><span style={{ color: 'var(--color-primary)' }}>₹{total.toFixed(0)}</span>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
              onClick={handlePlaceOrder} disabled={placing}>
              {placing ? '⏳ Placing Order...' : '✅ Place Order (COD)'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 12 }}>
              By placing order, you agree to our terms
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 360px"] { grid-template-columns: 1fr !important; }
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
