import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, IndianRupee, Users, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';

const STATUS_STYLE = {
  placed:           { bg: '#E3F2FD', color: '#1565C0', label: 'Placed' },
  confirmed:        { bg: '#E8F5E9', color: '#2E7D32', label: 'Confirmed' },
  packed:           { bg: '#FFF3E0', color: '#F57C00', label: 'Packed' },
  shipped:          { bg: '#F3E5F5', color: '#6A1B9A', label: 'Shipped' },
  out_for_delivery: { bg: '#FBE9E7', color: '#E65100', label: 'Out for Delivery' },
  delivered:        { bg: '#E8F5E9', color: '#2E7D32', label: 'Delivered' },
  cancelled:        { bg: '#FFEBEE', color: '#C62828', label: 'Cancelled' },
};

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--color-primary)' }) => (
  <div className="card-panel flex-between" style={{ alignItems: 'flex-start' }}>
    <div>
      <p className="text-medium fw-600 mb-8" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <p className="fw-800 mb-4" style={{ fontSize: '1.8rem' }}>{value}</p>
      {sub && <p className="fs-xs text-light">{sub}</p>}
    </div>
    <div className="flex-center" style={{ width: 48, height: 48, borderRadius: 12, background: `${color}1A` }}>
      <Icon size={22} color={color} />
    </div>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/admin/dashboard/').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="stat-card-grid">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-medium">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="stat-card-grid">
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`} sub={`₹${(stats?.month_revenue || 0).toLocaleString('en-IN')} this month`} color="#C8496A" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.total_orders || 0} sub={`${stats?.today_orders || 0} today`} color="#0984E3" />
        <StatCard icon={Users} label="Total Customers" value={stats?.total_users || 0} color="#00B894" />
        <StatCard icon={Package} label="Active Products" value={stats?.total_products || 0} sub={stats?.low_stock_products > 0 ? `${stats.low_stock_products} low stock` : undefined} color="#6C5CE7" />
      </div>

      {/* Low stock warning */}
      {stats?.low_stock_products > 0 && (
        <div className="info-banner info-banner--warning flex align-center gap-12 mb-24">
          <AlertTriangle size={18} />
          <p className="fs-sm fw-600">
            {stats.low_stock_products} product{stats.low_stock_products > 1 ? 's' : ''} running low on stock
            <button onClick={() => navigate('/admin/inventory')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', marginLeft: 8, fontWeight: 700, textDecoration: 'underline' }}>
              View →
            </button>
          </p>
        </div>
      )}

      {/* Status breakdown + Recent orders */}
      <div className="admin-two-col">
        {/* Status breakdown */}
        <div className="card-panel">
          <h3 className="card-panel-title">Orders by Status</h3>
          <div className="flex-col gap-10">
            {(stats?.status_counts || []).map(({ status, count }) => {
              const st = STATUS_STYLE[status] || { bg: '#eee', color: '#666', label: status };
              return (
                <div key={status} className="order-summary-row">
                  <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>
                    {st.label}
                  </span>
                  <span className="fw-700">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent orders */}
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Recent Orders</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/orders')}>View All</button>
          </div>
          <div className="flex-col gap-12">
            {(stats?.recent_orders || []).slice(0, 6).map(order => {
              const st = STATUS_STYLE[order.status] || STATUS_STYLE.placed;
              return (
                <div key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="flex-between"
                  style={{
                    padding: '12px', borderRadius: 10, cursor: 'pointer',
                    border: '1px solid var(--color-border)', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <p className="fw-600 fs-sm">Order #{order.id}</p>
                    <p className="fs-xs text-light">
                      {order.customer_email || order.customer_phone} · {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex align-center gap-12">
                    <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600 }}>{st.label}</span>
                    <span className="fw-700 text-primary">₹{parseFloat(order.total_amount).toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
