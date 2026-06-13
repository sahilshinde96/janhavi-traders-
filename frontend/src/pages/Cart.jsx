import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, X, Tag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, fetchCart, updateItem, removeItem, loading } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => { fetchCart(); }, []);

  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.total || 0);
  const discount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount) : 0;
  const deliveryCharge = 0;
  const total = subtotal - discount + deliveryCharge;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/discounts/apply/', { code: couponCode, order_total: subtotal });
      setAppliedCoupon(data);
      toast.success(`Coupon applied! You save ₹${parseFloat(data.discount_amount).toFixed(0)}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); };

  if (!cart || items.length === 0) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 40 }}>
      <ShoppingBag size={64} color="var(--color-border)" />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>Your cart is empty</h2>
      <p style={{ color: 'var(--color-text-medium)' }}>Add some beautiful products to get started</p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>Shop Now</button>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: 32 }}>Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
        {/* Cart Items */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: 'white', borderRadius: 16, padding: 20,
                border: '1px solid var(--color-border)', display: 'flex', gap: 16,
                boxShadow: 'var(--shadow-xs)',
              }}>
                <div style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0 }}>
                  {item.product?.primary_image ? (
                    <img src={item.product.primary_image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🧴</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{item.product?.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: 12 }}>{item.product?.category_name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => updateItem(item.id, item.quantity - 1)} style={{ padding: '8px 14px', background: 'var(--color-bg)', border: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
                      <span style={{ padding: '8px 16px', fontWeight: 700, borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} style={{ padding: '8px 14px', background: 'var(--color-bg)', border: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>₹{parseFloat(item.subtotal || 0).toFixed(0)}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginLeft: 6 }}>
                          (₹{parseFloat(item.product?.offer_price || 0).toFixed(0)} each)
                        </span>
                      </div>
                      <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 4 }}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Order Summary</h3>

            {/* Coupon */}
            <div style={{ marginBottom: 20 }}>
              {appliedCoupon ? (
                <div style={{ background: 'var(--color-success-light)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.875rem' }}>
                      <Tag size={12} style={{ marginRight: 4 }} />{appliedCoupon.code}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: 2 }}>{appliedCoupon.description}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success)' }}><X size={16} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" style={{ flex: 1, fontSize: '0.875rem' }}
                    placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()} />
                  <button className="btn btn-outline btn-sm" onClick={handleApplyCoupon} disabled={couponLoading}>
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-medium)' }}>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-success)' }}>Discount</span>
                  <span style={{ color: 'var(--color-success)' }}>-₹{discount.toFixed(0)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-medium)' }}>Delivery</span>
                <span style={{ color: 'var(--color-success)' }}>FREE</span>
              </div>
              {subtotal < 150 && (
                <p style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginTop: 4 }}>
                  Minimum order value is ₹150. Add ₹{(150 - subtotal).toFixed(0)} more to checkout.
                </p>
              )}
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{total.toFixed(0)}</span>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                opacity: subtotal < 150 ? 0.6 : 1, 
                cursor: subtotal < 150 ? 'not-allowed' : 'pointer' 
              }}
              disabled={subtotal < 150}
              onClick={() => navigate('/checkout', { state: { appliedCoupon } })}
            >
              Proceed to Checkout
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 12 }}>
              💳 Cash on Delivery | 🔒 Secure Checkout
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
