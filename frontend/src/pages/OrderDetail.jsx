import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import OrderTracker from '../components/order/OrderTracker';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}/`).then(r => { setOrder(r.data); setLoading(false); }).catch(() => { setLoading(false); navigate('/orders'); });
  }, [id]);

  if (loading) return <div className="container" style={{ padding: 40 }}><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></div>;
  if (!order) return null;

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate('/orders')}>
        <ChevronLeft size={16} /> My Orders
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>Order #{order.id}</h1>
        <p style={{ color: 'var(--color-text-medium)', fontSize: '0.875rem' }}>
          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Tracker */}
      <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid var(--color-border)', marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Order Status</h3>
        <OrderTracker status={order.status} />

        {/* Shipment info */}
        {order.courier_name && (
          <div style={{ marginTop: 20, padding: '16px', background: 'var(--color-bg)', borderRadius: 10 }}>
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.875rem' }}>📦 Shipment Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
              <div><span style={{ color: 'var(--color-text-light)' }}>Courier</span><p style={{ fontWeight: 600 }}>{order.courier_name}</p></div>
              <div><span style={{ color: 'var(--color-text-light)' }}>Tracking #</span><p style={{ fontWeight: 600 }}>{order.tracking_number || 'N/A'}</p></div>
              {order.estimated_delivery && <div><span style={{ color: 'var(--color-text-light)' }}>Expected By</span><p style={{ fontWeight: 600 }}>{new Date(order.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div>}
              {order.tracking_url && (
                <div>
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', marginTop: 16 }}>
                    Track on Courier Site <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Items */}
        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Items Ordered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {order.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0 }}>
                    {item.product_image ? <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🧴</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: 2 }}>{item.product_name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>SKU: {item.product_sku} · Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 700 }}>₹{parseFloat(item.subtotal).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📍 Delivery Address</h3>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{order.address_name}</p>
            <p style={{ color: 'var(--color-text-medium)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              {order.address_line1}{order.address_line2 && `, ${order.address_line2}`}<br />
              {order.address_city}, {order.address_state} – {order.address_pincode}<br />
              📞 {order.address_phone}
            </p>
          </div>
        </div>

        {/* Price summary */}
        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', position: 'sticky', top: 80 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Price Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-text-medium)' }}>Subtotal</span><span>₹{parseFloat(order.subtotal).toFixed(0)}</span></div>
              {parseFloat(order.discount_amount) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-success)' }}>Discount ({order.coupon_code})</span><span style={{ color: 'var(--color-success)' }}>-₹{parseFloat(order.discount_amount).toFixed(0)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-text-medium)' }}>Delivery</span><span style={{ color: parseFloat(order.delivery_charge) === 0 ? 'var(--color-success)' : undefined }}>{parseFloat(order.delivery_charge) === 0 ? 'FREE' : `₹${parseFloat(order.delivery_charge).toFixed(0)}`}</span></div>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16 }}>
              <span>Total Paid</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{parseFloat(order.total_amount).toFixed(0)}</span>
            </div>
            <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem' }}>
              <p style={{ fontWeight: 600 }}>💵 Payment: Cash on Delivery</p>
            </div>
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
