import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_STYLE = {
  placed: { bg: '#E3F2FD', color: '#1565C0', label: '📋 Placed' },
  confirmed: { bg: '#E8F5E9', color: '#2E7D32', label: '✅ Confirmed' },
  packed: { bg: '#FFF3E0', color: '#F57C00', label: '📦 Packed' },
  shipped: { bg: '#F3E5F5', color: '#6A1B9A', label: '🚚 Shipped' },
  out_for_delivery: { bg: '#FBE9E7', color: '#E65100', label: '🛵 Out for Delivery' },
  delivered: { bg: '#E8F5E9', color: '#2E7D32', label: '🎉 Delivered' },
  cancelled: { bg: '#FFEBEE', color: '#C62828', label: '❌ Cancelled' },
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State (BUG-12 fix).
  // Stores the current page index, checks if there are next/previous pages in the paginated response,
  // and tracks the total order counts.
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch orders from API for a specific page number
  const fetchOrders = (p = 1) => {
    setLoading(true);
    api.get(`/orders/?page=${p}`).then(r => {
      // Handle standard paginated objects returned by Django Rest Framework (e.g. { results, count, next, previous })
      // as well as fallback lists.
      setOrders(r.data.results || r.data);
      setTotal(r.data.count || 0);
      setHasNext(!!r.data.next);
      setHasPrev(!!r.data.previous);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  // Re-fetch orders whenever the page state changes.
  useEffect(() => { fetchOrders(page); }, [page]);


  if (loading) return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 40 }}>
      <div style={{ fontSize: '4rem' }}>📦</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>No orders yet</h2>
      <p style={{ color: 'var(--color-text-medium)' }}>Your orders will appear here once you shop</p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>Start Shopping</button>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: 32 }}>My Orders</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {orders.map(order => {
          const st = STATUS_STYLE[order.status] || STATUS_STYLE.placed;
          return (
            <div key={order.id} onClick={() => navigate(`/orders/${order.id}`)} style={{
              background: 'white', borderRadius: 16, padding: '20px 24px',
              border: '1px solid var(--color-border)', cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>Order #{order.id}</p>
                  <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                    {st.label}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)', marginBottom: 4 }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  &nbsp;·&nbsp; {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                  {order.address_city}, {order.address_state}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>₹{parseFloat(order.total_amount).toFixed(0)}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>COD</p>
              </div>
              <div style={{ color: 'var(--color-text-light)' }}>›</div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" disabled={!hasPrev} onClick={() => setPage(p => p - 1)}>← Previous</button>
          <span style={{ padding: '8px 16px', fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>Page {page} of {Math.ceil(total / 20)}</span>
          <button className="btn btn-ghost btn-sm" disabled={!hasNext} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
