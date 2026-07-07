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
  const deliveryCharge = subtotal >= 299 ? 0 : 20;
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
    <div className="empty-state">
      <ShoppingBag size={64} color="var(--color-border)" />
      <h2 className="empty-state-title">Your cart is empty</h2>
      <p className="text-medium">Add some beautiful products to get started</p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>Shop Now</button>
    </div>
  );

  return (
    <div className="container page-container">
      <h1 className="page-title mb-32">Shopping Cart</h1>

      <div className="cart-grid">
        {/* Cart Items */}
        <div className="flex-col gap-16">
          {items.map(item => (
            <div key={item.id} className="card-panel flex gap-16">
              <div style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0 }}>
                {item.product?.primary_image ? (
                  <img src={item.product.primary_image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div className="flex-center" style={{ width: '100%', height: '100%', fontSize: '2rem' }}>🧴</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="fw-700 mb-4" style={{ fontSize: '1rem' }}>{item.product?.name}</p>
                <p className="fs-xs text-light mb-12">{item.product?.category_name}</p>
                <div className="flex-between flex-wrap gap-12">
                  <div className="qty-control">
                    <button className="qty-control-btn" onClick={() => updateItem(item.id, item.quantity - 1)}><Minus size={14} /></button>
                    <span className="qty-control-value">{item.quantity}</span>
                    <button className="qty-control-btn" onClick={() => updateItem(item.id, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <div className="flex align-center gap-16">
                    <div>
                      <div className="flex align-center gap-6">
                        <span className="fw-800 text-primary" style={{ fontSize: '1.1rem' }}>₹{parseFloat(item.subtotal || 0).toFixed(0)}</span>
                        {parseFloat(item.product?.mrp || 0) > parseFloat(item.product?.offer_price || 0) && (
                          <span className="fs-sm text-light" style={{ textDecoration: 'line-through' }}>
                            ₹{(parseFloat(item.product.mrp) * item.quantity).toFixed(0)}
                          </span>
                        )}
                      </div>
                      <span className="fs-xs text-light mt-4" style={{ display: 'block' }}>
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

        {/* Summary */}
        <div className="sticky-sidebar">
          <div className="card-panel-shadow">
            <h3 className="card-panel-title mb-20">Order Summary</h3>

            {/* Coupon */}
            <div className="mb-20">
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <div>
                    <span className="fw-700 text-success fs-sm">
                      <Tag size={12} style={{ marginRight: 4 }} />{appliedCoupon.code}
                    </span>
                    <p className="fs-xs text-success mt-4">{appliedCoupon.description}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success)' }}><X size={16} /></button>
                </div>
              ) : (
                <div className="flex gap-8">
                  <input className="input flex-1" style={{ fontSize: '0.875rem' }}
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
            {(() => {
              const totalMRP = items.reduce((sum, item) => sum + parseFloat(item.product?.mrp || item.product?.offer_price || 0) * item.quantity, 0);
              const totalOfferPrice = subtotal;
              const productDiscount = totalMRP - totalOfferPrice;

              return (
                <div className="order-summary-rows">
                  {productDiscount > 0 ? (
                    <>
                      <div className="order-summary-row">
                        <span className="text-medium">Total MRP</span>
                        <span style={{ textDecoration: 'line-through' }} className="text-light">₹{totalMRP.toFixed(0)}</span>
                      </div>
                      <div className="order-summary-row">
                        <span className="text-success">Product Discount</span>
                        <span className="text-success">-₹{productDiscount.toFixed(0)}</span>
                      </div>
                      <div className="order-summary-row fw-600">
                        <span className="text-medium">Discounted Price</span>
                        <span>₹{totalOfferPrice.toFixed(0)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="order-summary-row fw-600">
                      <span className="text-medium">Discounted Price</span>
                      <span>₹{subtotal.toFixed(0)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="order-summary-row">
                      <span className="text-success">Coupon Discount</span>
                      <span className="text-success">-₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="order-summary-row">
                    <span className="text-medium">Delivery</span>
                    {deliveryCharge === 0 ? (
                      <span className="text-success fw-700">FREE</span>
                    ) : (
                      <span className="fw-700" style={{ color: 'var(--color-text-dark)' }}>₹20</span>
                    )}
                  </div>
                  {subtotal < 299 && (
                    <p className="fs-xs fw-600 mt-4" style={{ color: '#c2850a' }}>
                      🎉 Add ₹{(299 - subtotal).toFixed(0)} more for FREE delivery!
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="divider" />

            <div className="order-total-row">
              <span>Total</span>
              <span className="text-primary">₹{total.toFixed(0)}</span>
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              style={{ justifyContent: 'center' }}
              onClick={() => navigate('/checkout', { state: { appliedCoupon } })}
            >
              Proceed to Checkout
            </button>

            <p className="text-center fs-xs text-light mt-12">
              💳 Cash on Delivery | 🔒 Secure Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
