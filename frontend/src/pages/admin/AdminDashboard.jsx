import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, IndianRupee, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../../api/axios';

const STATUS_STYLE = {
  placed: { bg: '#E3F2FD', color: '#1565C0', label: 'Placed' },
  confirmed: { bg: '#E8F5E9', color: '#2E7D32', label: 'Confirmed' },
  packed: { bg: '#FFF3E0', color: '#F57C00', label: 'Packed' },
  shipped: { bg: '#F3E5F5', color: '#6A1B9A', label: 'Shipped' },
  out_for_delivery: { bg: '#FBE9E7', color: '#E65100', label: 'Out for Delivery' },
  delivered: { bg: '#E8F5E9', color: '#2E7D32', label: 'Delivered' },
  cancelled: { bg: '#FFEBEE', color: '#C62828', label: 'Cancelled' },
};

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--color-primary)' }) => (
  <div style={{
    background: 'white', borderRadius: 16, padding: 24,
    border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--color-text-medium)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-dark)', marginBottom: 4 }}>{value}</p>
        {sub && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{sub}</p>}
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--color-text-medium)' }}>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`} sub={`₹${(stats?.month_revenue || 0).toLocaleString('en-IN')} this month`} color="#C8496A" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.total_orders || 0} sub={`${stats?.today_orders || 0} today`} color="#0984E3" />
        <StatCard icon={Users} label="Total Customers" value={stats?.total_users || 0} color="#00B894" />
        <StatCard icon={Package} label="Active Products" value={stats?.total_products || 0} sub={stats?.low_stock_products > 0 ? `${stats.low_stock_products} low stock` : undefined} color="#6C5CE7" />
      </div>

      {/* Low stock warning */}
      {stats?.low_stock_products > 0 && (
        <div style={{
          background: '#FFF3E0', border: '1px solid #FFE0B2', borderRadius: 12, padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
        }}>
          <AlertTriangle size={18} color="#F57C00" />
          <p style={{ fontSize: '0.875rem', color: '#E65100', fontWeight: 600 }}>
            {stats.low_stock_products} product{stats.low_stock_products > 1 ? 's' : ''} running low on stock
            <button onClick={() => navigate('/admin/inventory')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', marginLeft: 8, fontWeight: 700, textDecoration: 'underline' }}>
              View →
            </button>
          </p>
        </div>
      )}

      {/* Status breakdown + Recent orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Status breakdown */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Orders by Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(stats?.status_counts || []).map(({ status, count }) => {
              const st = STATUS_STYLE[status] || { bg: '#eee', color: '#666', label: status };
              return (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>
                    {st.label}
                  </span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent orders */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>Recent Orders</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/orders')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(stats?.recent_orders || []).slice(0, 6).map(order => {
              const st = STATUS_STYLE[order.status] || STATUS_STYLE.placed;
              return (
                <div key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid var(--color-border)', transition: 'background 0.2s',
                }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Order #{order.id}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                      {order.customer_email || order.customer_phone} · {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600 }}>{st.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{parseFloat(order.total_amount).toFixed(0)}</span>
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
