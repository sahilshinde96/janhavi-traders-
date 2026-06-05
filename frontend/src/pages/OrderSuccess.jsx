import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) navigate('/orders');
  }, []);

  if (!order) return null;

  return (
    <div style={{
      minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: 48, maxWidth: 480, width: '100%',
        textAlign: 'center', boxShadow: 'var(--shadow-lg)',
        animation: 'scaleIn 0.4s ease',
      }}>
        {/* Animated checkmark */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'var(--color-success-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '2.5rem',
          animation: 'bounce 0.6s ease 0.3s both',
        }}>
          🎉
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, marginBottom: 8, color: 'var(--color-success)' }}>
          Order Placed!
        </h1>
        <p style={{ color: 'var(--color-text-medium)', marginBottom: 24, lineHeight: 1.6 }}>
          Your order has been placed successfully.<br />
          We'll update you when it's on its way!
        </p>

        <div style={{ background: 'var(--color-bg)', borderRadius: 12, padding: '16px 20px', marginBottom: 32, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-medium)' }}>Order ID</span>
            <span style={{ fontWeight: 700 }}>#{order.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-medium)' }}>Total Amount</span>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{parseFloat(order.total_amount).toFixed(0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-medium)' }}>Payment</span>
            <span style={{ fontWeight: 600 }}>Cash on Delivery</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate(`/orders/${order.id}`)}>
            Track My Order
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
