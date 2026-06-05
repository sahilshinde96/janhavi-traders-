import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, loading } = useCartStore();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeCart(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const total = parseFloat(cart?.total || 0);
  const deliveryCharge = total >= 500 ? 0 : 50;
  const finalTotal = total + deliveryCharge;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 999, animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px',
        maxWidth: '100vw', background: 'white', zIndex: 1000,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={20} color="var(--color-primary)" />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
              My Cart {items.length > 0 && <span style={{ color: 'var(--color-text-medium)', fontWeight: 400 }}>({cart?.item_count} items)</span>}
            </span>
          </div>
          <button onClick={closeCart} className="btn-icon btn-ghost" style={{ border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-medium)' }}>
              <ShoppingBag size={56} color="var(--color-border)" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 8 }}>Your cart is empty</p>
              <p style={{ fontSize: '0.875rem' }}>Add some products to get started</p>
              <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => { closeCart(); navigate('/products'); }}>
                Shop Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: 12, padding: '12px',
                  background: 'var(--color-bg)', borderRadius: 10,
                  border: '1px solid var(--color-border)',
                }}>
                  {/* Image */}
                  <div style={{
                    width: 70, height: 70, borderRadius: 8, overflow: 'hidden',
                    background: 'var(--color-secondary)', flexShrink: 0,
                  }}>
                    {item.product?.primary_image ? (
                      <img src={item.product.primary_image} alt={item.product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🧴</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 600, fontSize: '0.875rem', marginBottom: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{item.product?.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: 8 }}>
                      ₹{parseFloat(item.product?.offer_price || 0).toFixed(0)} each
                    </p>

                    {/* Qty + Remove */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden',
                      }}>
                        <button onClick={() => updateItem(item.id, item.quantity - 1)} style={{
                          padding: '4px 10px', background: 'white', border: 'none',
                          cursor: 'pointer', color: 'var(--color-text-dark)',
                        }}><Minus size={14} /></button>
                        <span style={{ padding: '4px 12px', fontSize: '0.875rem', fontWeight: 600, borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} style={{
                          padding: '4px 10px', background: 'white', border: 'none',
                          cursor: 'pointer', color: 'var(--color-text-dark)',
                        }}><Plus size={14} /></button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          ₹{parseFloat(item.subtotal || 0).toFixed(0)}
                        </span>
                        <button onClick={() => removeItem(item.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)',
                        }}><X size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-medium)' }}>Subtotal</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-medium)' }}>Delivery</span>
                <span style={{ color: deliveryCharge === 0 ? 'var(--color-success)' : 'inherit' }}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              {deliveryCharge > 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginBottom: 8 }}>
                  Add ₹{(500 - total).toFixed(0)} more for free delivery!
                </p>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontWeight: 700, fontSize: '1rem', paddingTop: 8,
                borderTop: '1px solid var(--color-border)',
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-primary)' }}>₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>
            <button className="btn btn-primary w-full" onClick={handleCheckout} style={{ width: '100%' }}>
              Proceed to Checkout
            </button>
            <button className="btn btn-ghost" onClick={() => { closeCart(); navigate('/cart'); }}
              style={{ width: '100%', marginTop: 8, textAlign: 'center' }}>
              View Full Cart
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
