import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Truck } from 'lucide-react';
import api from '../../api/axios';
import OrderTracker from '../../components/order/OrderTracker';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState({ courier_name: '', tracking_number: '', tracking_url: '', status: 'pending', estimated_delivery: '' });
  const [savingShip, setSavingShip] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}/`).then(r => {
      setOrder(r.data);
      setLoading(false);
      if (r.data.courier_name) {
        setShipment({
          courier_name: r.data.courier_name || '',
          tracking_number: r.data.tracking_number || '',
          tracking_url: r.data.tracking_url || '',
          status: r.data.shipment_status || 'pending',
          estimated_delivery: r.data.estimated_delivery || '',
        });
      }
    }).catch(() => { setLoading(false); navigate('/admin/orders'); });
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await api.put(`/orders/admin/${id}/status/`, { status: newStatus });
      setOrder(data);
      toast.success('Order status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  const handleSaveShipment = async () => {
    setSavingShip(true);
    try {
      await api.post(`/shipments/admin/order/${id}/`, shipment);
      toast.success('Shipment details saved!');
      // Refresh order
      const { data } = await api.get(`/orders/${id}/`);
      setOrder(data);
    } catch { toast.error('Failed to save shipment details'); }
    finally { setSavingShip(false); }
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;
  if (!order) return null;

  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate('/admin/orders')}>
        <ChevronLeft size={16} /> All Orders
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>Order #{order.id}</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Status:</label>
          <select value={order.status} onChange={e => handleStatusChange(e.target.value)} className="select" style={{ minWidth: 180 }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Tracker */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', marginBottom: 24 }}>
        <OrderTracker status={order.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Shipment form */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Truck size={18} color="var(--color-primary)" /> Shipment Details
          </h3>
          <div className="form-group">
            <label className="form-label">Courier Name</label>
            <input className="input" value={shipment.courier_name} onChange={e => setShipment(p => ({ ...p, courier_name: e.target.value }))} placeholder="e.g. Delhivery, DTDC" />
          </div>
          <div className="form-group">
            <label className="form-label">Tracking Number</label>
            <input className="input" value={shipment.tracking_number} onChange={e => setShipment(p => ({ ...p, tracking_number: e.target.value }))} placeholder="AWB/Tracking ID" />
          </div>
          <div className="form-group">
            <label className="form-label">Tracking URL</label>
            <input className="input" value={shipment.tracking_url} onChange={e => setShipment(p => ({ ...p, tracking_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Shipment Status</label>
              <select className="select" value={shipment.status} onChange={e => setShipment(p => ({ ...p, status: e.target.value }))}>
                {['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Est. Delivery Date</label>
              <input className="input" type="date" value={shipment.estimated_delivery} onChange={e => setShipment(p => ({ ...p, estimated_delivery: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleSaveShipment} disabled={savingShip}>
            {savingShip ? 'Saving...' : '✅ Save Shipment Details'}
          </button>
        </div>

        {/* Customer & items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Customer</h3>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{order.address_name}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)', lineHeight: 1.7 }}>
              📧 {order.customer_email || '—'}<br />
              📞 {order.customer_phone || order.address_phone || '—'}
            </p>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.875rem' }}>📍 Delivery Address</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)', lineHeight: 1.7 }}>
                {order.address_line1}{order.address_line2 && `, ${order.address_line2}`}<br />
                {order.address_city}, {order.address_state} – {order.address_pincode}
              </p>
            </div>
          </div>

          {/* Order items */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Items</h3>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0 }}>
                  {item.product_image ? <img src={item.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧴</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.product_name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>×{item.quantity}</p>
                </div>
                <p style={{ fontWeight: 700 }}>₹{parseFloat(item.subtotal).toFixed(0)}</p>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, paddingTop: 8 }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{parseFloat(order.total_amount).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
