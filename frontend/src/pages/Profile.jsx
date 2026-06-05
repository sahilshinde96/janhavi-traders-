import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Package, LogOut, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: 'Maharashtra', pincode: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/addresses/').then(r => setAddresses(r.data)).catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile/', { name });
      updateUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async () => {
    const required = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const f of required) { if (!newAddr[f].trim()) { toast.error(`Fill in ${f}`); return; } }
    try {
      const { data } = await api.post('/auth/addresses/', newAddr);
      setAddresses(prev => [...prev, data]);
      setShowAddressForm(false);
      setNewAddr({ label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: 'Maharashtra', pincode: '' });
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/auth/addresses/${id}/`);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address removed');
    } catch { toast.error('Failed to remove address'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const TABS = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'addresses', icon: MapPin, label: 'Addresses' },
    { id: 'orders', icon: Package, label: 'My Orders' },
  ];

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
        {/* Sidebar */}
        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', color: 'white', fontWeight: 700, margin: '0 auto 12px',
              }}>
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{user?.name || 'Welcome!'}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{user?.email || user?.phone}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {TABS.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => id === 'orders' ? navigate('/orders') : setTab(id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: tab === id ? 'var(--color-secondary)' : 'transparent',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  color: tab === id ? 'var(--color-primary)' : 'var(--color-text-medium)',
                  fontWeight: tab === id ? 700 : 400, width: '100%', textAlign: 'left',
                  transition: 'all 0.2s',
                }}>
                  <Icon size={17} /> {label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleLogout} className="btn" style={{
            width: '100%', justifyContent: 'center', gap: 8,
            background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: 10,
          }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Content */}
        <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid var(--color-border)' }}>
          {tab === 'profile' && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 24, fontSize: '1.3rem' }}>My Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 460 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="input" value={user?.email || ''} disabled style={{ background: 'var(--color-bg)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="input" value={user?.phone || ''} disabled style={{ background: 'var(--color-bg)' }} />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {tab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>Saved Addresses</h2>
                <button className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(!showAddressForm)}>
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {addresses.length === 0 && !showAddressForm && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-medium)' }}>
                  <MapPin size={40} color="var(--color-border)" style={{ margin: '0 auto 16px' }} />
                  <p>No addresses saved yet</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 18, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <p style={{ fontWeight: 700 }}>{addr.name}</p>
                        <span className="badge badge-neutral">{addr.label}</span>
                        {addr.is_default && <span className="badge badge-primary" style={{ background: 'var(--color-primary)', color: 'white' }}>Default</span>}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)', lineHeight: 1.6 }}>
                        {addr.line1}{addr.line2 && `, ${addr.line2}`}<br />
                        {addr.city}, {addr.state} – {addr.pincode}<br />
                        📞 {addr.phone}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', alignSelf: 'flex-start' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {showAddressForm && (
                <div style={{ marginTop: 24, padding: 24, border: '1px solid var(--color-border)', borderRadius: 12, animation: 'slideDown 0.2s ease' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 20 }}>New Address</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[['name','Full Name'],['phone','Phone'],['line1','Address Line 1'],['line2','Line 2 (Optional)'],['city','City'],['pincode','PIN Code']].map(([key, label]) => (
                      <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{label}</label>
                        <input className="input" value={newAddr[key]} onChange={e => setNewAddr(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">State</label>
                      <select className="select" value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))}>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Label</label>
                      <select className="select" value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))}>
                        <option>Home</option><option>Work</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button className="btn btn-primary" onClick={handleAddAddress}>Save Address</button>
                    <button className="btn btn-ghost" onClick={() => setShowAddressForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: 240px 1fr"] { grid-template-columns: 1fr !important; }
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
