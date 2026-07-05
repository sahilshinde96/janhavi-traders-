import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import OrderTracker from '../components/order/OrderTracker';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${id}/cancel/`);
      setOrder(data);
      setShowConfirmCancel(false);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    api.get(`/orders/${id}/`).then(r => { setOrder(r.data); setLoading(false); }).catch(() => { setLoading(false); navigate('/orders'); });
  }, [id]);

  if (loading) return <div className="container" style={{ padding: 40 }}><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></div>;
  if (!order) return null;

  return (
    <div className="container page-container-sm">
      <button className="btn btn-ghost btn-sm mb-24" onClick={() => navigate('/orders')}>
        <ChevronLeft size={16} /> My Orders
      </button>

      <div className="flex-between flex-wrap gap-12 mb-32">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>Order #{order.id}</h1>
        <p className="text-medium fs-sm">
          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Tracker */}
      <div className="card-panel mb-24">
        <h3 className="fw-700 mb-16">Order Status</h3>
        <OrderTracker status={order.status} />

        {/* Shipment info */}
        {order.courier_name && (
          <div style={{ marginTop: 20, padding: '16px', background: 'var(--color-bg)', borderRadius: 10 }}>
            <p className="fw-700 mb-8 fs-sm">📦 Shipment Details</p>
            <div className="grid-2" style={{ fontSize: '0.8rem' }}>
              <div><span className="text-light">Courier</span><p className="fw-600">{order.courier_name}</p></div>
              <div><span className="text-light">Tracking #</span><p className="fw-600">{order.tracking_number || 'N/A'}</p></div>
              {order.estimated_delivery && <div><span className="text-light">Expected By</span><p className="fw-600">{new Date(order.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div>}
              {order.tracking_url && (
                <div>
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                    className="text-primary fw-600 flex align-center gap-4 fs-sm mt-16">
                    Track on Courier Site <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="order-detail-grid">
        {/* Items */}
        <div>
          <div className="card-panel mb-24">
            <h3 className="fw-700 mb-16">Items Ordered</h3>
            <div className="flex-col gap-16">
              {order.items?.map(item => (
                <div key={item.id} className="flex gap-12 align-center" style={{ paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0 }}>
                    {item.product_image
                      ? <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div className="flex-center" style={{ width: '100%', height: '100%', fontSize: '1.5rem' }}>🧴</div>}
                  </div>
                  <div className="flex-1">
                    <p className="fw-600 mb-4">{item.product_name}</p>
                    <p className="fs-xs text-light">SKU: {item.product_sku} · Qty: {item.quantity}</p>
                  </div>
                  <p className="fw-700">₹{parseFloat(item.subtotal).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card-panel">
            <h3 className="fw-700 mb-16">📍 Delivery Address</h3>
            <p className="fw-600 mb-4">{order.address_name}</p>
            <p className="text-medium fs-sm" style={{ lineHeight: 1.7 }}>
              {order.address_line1}{order.address_line2 && `, ${order.address_line2}`}<br />
              {order.address_city}, {order.address_state} – {order.address_pincode}<br />
              📞 {order.address_phone}
            </p>
          </div>
        </div>

        {/* Price summary */}
        <div>
          <div className="card-panel-shadow sticky-sidebar">
            <h3 className="fw-700 mb-20">Price Breakdown</h3>
            <div className="order-summary-rows">
              <div className="order-summary-row fw-600">
                <span className="text-medium">Discounted Price</span>
                <span>₹{parseFloat(order.subtotal).toFixed(0)}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div className="order-summary-row">
                  <span className="text-success">Discount ({order.coupon_code})</span>
                  <span className="text-success">-₹{parseFloat(order.discount_amount).toFixed(0)}</span>
                </div>
              )}
              <div className="order-summary-row">
                <span className="text-medium">Delivery</span>
                <span className={parseFloat(order.delivery_charge) === 0 ? 'text-success' : ''}>
                  {parseFloat(order.delivery_charge) === 0 ? 'FREE' : `₹${parseFloat(order.delivery_charge).toFixed(0)}`}
                </span>
              </div>
            </div>
            <div className="divider" />
            <div className="order-total-row">
              <span>Total Paid</span>
              <span className="text-primary">₹{parseFloat(order.total_amount).toFixed(0)}</span>
            </div>
            <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem' }}>
              <p className="fw-600">💵 Payment: Cash on Delivery</p>
            </div>

            {['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery'].includes(order.status) && (
              <button
                className="btn btn-outline w-full mt-16"
                style={{ justifyContent: 'center', color: '#dc2626', borderColor: '#dc2626', fontWeight: 600 }}
                onClick={() => setShowConfirmCancel(true)}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation */}
      {showConfirmCancel && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3 className="fw-800 text-primary mb-12" style={{ fontSize: '1.25rem' }}>Cancel Order?</h3>
            <p className="text-medium fs-sm mb-24" style={{ lineHeight: 1.5 }}>
              Are you sure you want to cancel your Order #{order.id}? This action cannot be undone and will restore stock items.
            </p>
            <div className="flex gap-12" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline flex-1" onClick={() => setShowConfirmCancel(false)} disabled={cancelling}>
                No, Keep Order
              </button>
              <button className="btn btn-primary flex-1" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: 'white' }} onClick={handleCancelOrder} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
