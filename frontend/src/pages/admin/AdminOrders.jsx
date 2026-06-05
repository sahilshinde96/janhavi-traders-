import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_STYLE = {
  placed: { bg: '#E3F2FD', color: '#1565C0' },
  confirmed: { bg: '#E8F5E9', color: '#2E7D32' },
  packed: { bg: '#FFF3E0', color: '#F57C00' },
  shipped: { bg: '#F3E5F5', color: '#6A1B9A' },
  out_for_delivery: { bg: '#FBE9E7', color: '#E65100' },
  delivered: { bg: '#E8F5E9', color: '#2E7D32' },
  cancelled: { bg: '#FFEBEE', color: '#C62828' },
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page });
    if (statusFilter) params.set('status', statusFilter);
    api.get(`/orders/admin/all/?${params}`).then(r => {
      setOrders(r.data.results || r.data);
      setTotal(r.data.count || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [statusFilter, page]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/status/`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>Orders</h1>
          <p style={{ color: 'var(--color-text-medium)', fontSize: '0.875rem' }}>{total} orders total</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', ...STATUS_OPTIONS].map(s => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }} style={{
            padding: '6px 16px', borderRadius: 99, border: `1px solid ${statusFilter === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: statusFilter === s ? 'var(--color-primary)' : 'white',
            color: statusFilter === s ? 'white' : 'var(--color-text-medium)',
            fontSize: '0.8rem', fontWeight: statusFilter === s ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize',
          }}>
            {s || 'All Orders'}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={7} style={{ padding: 14 }}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td></tr>
            )) : orders.map(o => {
              const st = STATUS_STYLE[o.status] || STATUS_STYLE.placed;
              return (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.875rem' }}>#{o.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{o.address_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{o.customer_email || o.customer_phone}</p>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>{o.items?.length} items</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-primary)' }}>₹{parseFloat(o.total_amount).toFixed(0)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)} style={{
                      padding: '4px 10px', borderRadius: 99, border: 'none',
                      background: st.bg, color: st.color, fontWeight: 700,
                      fontSize: '0.75rem', cursor: 'pointer',
                    }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-medium)' }}>
                    {new Date(o.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/orders/${o.id}`)}>View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && !loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-medium)' }}>No orders yet</div>
        )}
      </div>

      {total > 20 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ padding: '8px 16px', fontSize: '0.875rem' }}>Page {page} of {Math.ceil(total / 20)}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
