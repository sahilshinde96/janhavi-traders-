import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_STYLE = {
  placed:           { bg: '#E3F2FD', color: '#1565C0', label: '📋 Placed' },
  confirmed:        { bg: '#E8F5E9', color: '#2E7D32', label: '✅ Confirmed' },
  packed:           { bg: '#FFF3E0', color: '#F57C00', label: '📦 Packed' },
  shipped:          { bg: '#F3E5F5', color: '#6A1B9A', label: '🚚 Shipped' },
  out_for_delivery: { bg: '#FBE9E7', color: '#E65100', label: '🛵 Out for Delivery' },
  delivered:        { bg: '#E8F5E9', color: '#2E7D32', label: '🎉 Delivered' },
  cancelled:        { bg: '#FFEBEE', color: '#C62828', label: '❌ Cancelled' },
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State (BUG-12 fix).
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchOrders = (p = 1) => {
    setLoading(true);
    api.get(`/orders/?page=${p}`).then(r => {
      setOrders(r.data.results || r.data);
      setTotal(r.data.count || 0);
      setHasNext(!!r.data.next);
      setHasPrev(!!r.data.previous);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  if (loading) return (
    <div className="container page-container">
      <div className="flex-col gap-16">
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon">📦</div>
      <h2 className="empty-state-title">No orders yet</h2>
      <p className="text-medium">Your orders will appear here once you shop</p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>Start Shopping</button>
    </div>
  );

  return (
    <div className="container page-container">
      <h1 className="page-title mb-32">My Orders</h1>
      <div className="flex-col gap-16">
        {orders.map(order => {
          const st = STATUS_STYLE[order.status] || STATUS_STYLE.placed;
          return (
            <div key={order.id} className="order-card" onClick={() => navigate(`/orders/${order.id}`)}>
              <div className="flex-1 min-w-0">
                <div className="flex align-center gap-12 mb-8 flex-wrap">
                  <p className="fw-700" style={{ fontSize: '1rem' }}>Order #{order.id}</p>
                  <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                    {st.label}
                  </span>
                </div>
                <p className="fs-sm text-medium mb-4">
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  &nbsp;·&nbsp; {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                </p>
                <p className="fs-xs text-light">
                  {order.address_city}, {order.address_state}
                </p>
              </div>
              <div className="text-right">
                <p className="fw-800 text-primary" style={{ fontSize: '1.2rem' }}>₹{parseFloat(order.total_amount).toFixed(0)}</p>
                <p className="fs-xs text-light">COD</p>
              </div>
              <div className="text-light">›</div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="pagination-row">
          <button className="btn btn-ghost btn-sm" disabled={!hasPrev} onClick={() => setPage(p => p - 1)}>← Previous</button>
          <span className="fs-sm text-medium" style={{ padding: '8px 16px' }}>Page {page} of {Math.ceil(total / 20)}</span>
          <button className="btn btn-ghost btn-sm" disabled={!hasNext} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
