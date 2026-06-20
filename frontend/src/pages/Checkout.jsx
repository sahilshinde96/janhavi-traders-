import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, MapPin, Check } from 'lucide-react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, fetchCart, clearCart } = useCartStore();
  const appliedCoupon = location.state?.appliedCoupon;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home', name: '', phone: '', line1: '', line2: '', city: '',
    state: 'Maharashtra', pincode: '', latitude: null, longitude: null
  });

  // Geolocation and geofencing states
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState(null);

  // Store coordinates (Pisavli Village, Kalyan East, Kalyan, Maharashtra 421306)
  const STORE_LAT = 19.213000;
  const STORE_LON = 73.151000;

  // Calculate distance between two coordinates using the Haversine formula (BUG-14)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Automatically recalculate distance whenever the active address selection or its coordinates change
  useEffect(() => {
    let lat = NaN, lon = NaN;
    if (selectedAddress) {
      lat = parseFloat(selectedAddress.latitude);
      lon = parseFloat(selectedAddress.longitude);
    } else if (showNewForm) {
      lat = parseFloat(newAddr.latitude);
      lon = parseFloat(newAddr.longitude);
    }

    if (!isNaN(lat) && !isNaN(lon)) {
      const dist = calculateDistance(STORE_LAT, STORE_LON, lat, lon);
      setCalculatedDistance(dist);
    } else {
      setCalculatedDistance(null);
    }
  }, [selectedAddress, newAddr.latitude, newAddr.longitude, showNewForm]);

  // Request browser geolocation coordinates (GPS) helper
  const getBrowserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        reject(new Error("Not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            toast.error("GPS access denied. We need location permissions to verify delivery radius.");
          } else {
            toast.error("Failed to retrieve GPS location. Please try again.");
          }
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  // Request browser geolocation coordinates (GPS) using HTML5 API for new address form
  const handleFetchCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const coords = await getBrowserLocation();
      setNewAddr(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
      toast.success("Location coordinates pinned successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingLocation(false);
    }
  };

  // Update existing saved address with coordinates
  const handlePinCoordinatesToAddress = async (addressId) => {
    setFetchingLocation(true);
    try {
      const coords = await getBrowserLocation();
      const { data } = await api.put(`/auth/addresses/${addressId}/`, {
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      // Update local state list
      setAddresses(prev => prev.map(addr => addr.id === addressId ? data : addr));
      // Update selectedAddress to reflect the updated coordinates immediately
      setSelectedAddress(data);
      toast.success("GPS coordinates pinned to this address successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update coordinates for the address.");
    } finally {
      setFetchingLocation(false);
    }
  };

  useEffect(() => {
    fetchCart();
    api.get('/auth/addresses/').then(r => {
      setAddresses(r.data);
      const def = r.data.find(a => a.is_default) || r.data[0];
      if (def) setSelectedAddress(def);
      if (r.data.length === 0) setShowNewForm(true);
    }).catch(() => setShowNewForm(true));
  }, []);

  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.total || 0);
  const discount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount) : 0;
  const deliveryCharge = 0;
  const total = subtotal - discount + deliveryCharge;

  const handleAddAddress = async () => {
    const required = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const f of required) {
      if (!newAddr[f].trim()) { toast.error(`Please fill in ${f}`); return; }
    }
    if (newAddr.latitude === null || newAddr.longitude === null) {
      toast.error('Please fetch your GPS coordinates using "Use My Current Location" button before saving.');
      return;
    }
    try {
      const { data } = await api.post('/auth/addresses/', newAddr);
      setAddresses(prev => [...prev, data]);
      setSelectedAddress(data);
      setShowNewForm(false);
      toast.success('Address saved!');
    } catch { toast.error('Failed to save address'); }
  };

  const handlePlaceOrder = async () => {
    if (subtotal < 150) {
      toast.error('Minimum order value is ₹150');
      return;
    }
    if (!selectedAddress && !showNewForm) { toast.error('Please select a delivery address'); return; }

    let address = selectedAddress;
    if (showNewForm) {
      const required = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
      for (const f of required) {
        if (!newAddr[f].trim()) { toast.error(`Please fill in ${f}`); return; }
      }
      if (newAddr.latitude === null || newAddr.longitude === null) {
        toast.error('Please fetch your GPS coordinates using "Use My Current Location" button.');
        return;
      }
      address = newAddr;
    }

    setPlacing(true);
    try {
      const { data } = await api.post('/orders/place/', {
        address: { 
          name: address.name, 
          phone: address.phone, 
          line1: address.line1, 
          line2: address.line2 || '', 
          city: address.city, 
          state: address.state, 
          pincode: address.pincode,
          latitude: address.latitude,
          longitude: address.longitude
        },
        coupon_code: appliedCoupon?.code || '',
      });
      await clearCart();
      navigate('/order-success', { state: { order: data } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
      setPlacing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: 32 }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
        {/* Left: Address */}
        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="var(--color-primary)" /> Delivery Address
            </h3>

            {/* Saved addresses */}
            {addresses.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {addresses.map(addr => (
                  <div key={addr.id} onClick={() => { setSelectedAddress(addr); setShowNewForm(false); }} style={{
                    border: `2px solid ${selectedAddress?.id === addr.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 12, padding: '16px', cursor: 'pointer',
                    background: selectedAddress?.id === addr.id ? 'var(--color-secondary)' : 'white',
                    transition: 'all 0.2s',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: `2px solid ${selectedAddress?.id === addr.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: selectedAddress?.id === addr.id ? 'var(--color-primary)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selectedAddress?.id === addr.id && <Check size={12} color="white" />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: 4 }}>{addr.name} <span className="badge badge-neutral" style={{ marginLeft: 8 }}>{addr.label}</span></p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>{addr.city}, {addr.state} – {addr.pincode}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>📞 {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Geofencing distance feedback for selected saved address */}
            {selectedAddress && (() => {
              const hasCoords = !isNaN(parseFloat(selectedAddress.latitude)) && !isNaN(parseFloat(selectedAddress.longitude));
              
              let bg = 'var(--color-neutral-light, #F5F5F5)';
              let color = 'var(--color-text-medium, #666666)';
              
              if (!hasCoords) {
                bg = 'var(--color-warning-light, #FFF3E0)';
                color = 'var(--color-warning, #F57C00)';
              } else if (calculatedDistance !== null) {
                if (calculatedDistance <= 10) {
                  bg = 'var(--color-success-light, #E8F5E9)';
                  color = 'var(--color-success, #2E7D32)';
                } else {
                  bg = 'var(--color-error-light, #FFEBEE)';
                  color = 'var(--color-error, #C62828)';
                }
              }

              return (
                <div style={{
                  background: bg,
                  color: color,
                  padding: '12px 16px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, margin: '16px 0',
                  border: '1px solid currentColor',
                  transition: 'all 0.2s ease'
                }}>
                  {!hasCoords ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span>⚠️ This address is missing GPS coordinates required for delivery radius verification. You can pin your current location to update it:</span>
                      <button type="button" className="btn btn-outline btn-xs" 
                        onClick={() => handlePinCoordinatesToAddress(selectedAddress.id)} 
                        disabled={fetchingLocation}
                        style={{ alignSelf: 'flex-start', marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                        {fetchingLocation ? '⏳ Pining Coordinates...' : '📍 Pin Current GPS Coordinates to this Address'}
                      </button>
                    </div>
                  ) : (
                    calculatedDistance !== null ? (
                      calculatedDistance <= 10
                        ? `🟢 Deliverable: Located ${calculatedDistance.toFixed(1)} km from store (within 10km range)`
                        : `🔴 Undeliverable: Located ${calculatedDistance.toFixed(1)} km from store (exceeds 10km range limit)`
                    ) : (
                      <span>⏳ Calculating distance...</span>
                    )
                  )}
                </div>
              );
            })()}

            {/* Add new */}
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowNewForm(!showNewForm); setSelectedAddress(null); }}>
              <Plus size={14} /> {showNewForm ? 'Cancel' : 'Add New Address'}
            </button>

            {showNewForm && (
              <div style={{ marginTop: 20, animation: 'slideDown 0.2s ease' }}>
                {/* Geolocation Button */}
                <div style={{ marginBottom: 16 }}>
                  <button type="button" className="btn btn-outline" onClick={handleFetchCurrentLocation} disabled={fetchingLocation} style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 8, alignItems: 'center' }}>
                    {fetchingLocation ? '⏳ Pining Coordinates...' : '📍 Pin My Current GPS Location *'}
                  </button>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: 4 }}>* Required to verify you are within our 10km delivery radius.</p>
                </div>

                {/* GPS Pin range status indicator */}
                {newAddr.latitude !== null && calculatedDistance !== null && (
                  <div style={{
                    background: calculatedDistance <= 10 ? 'var(--color-success-light, #E8F5E9)' : 'var(--color-error-light, #FFEBEE)',
                    color: calculatedDistance <= 10 ? 'var(--color-success, #2E7D32)' : 'var(--color-error, #C62828)',
                    padding: '10px 14px', borderRadius: 8, fontSize: '0.825rem', fontWeight: 600, display: 'flex', gap: 6, marginBottom: 16,
                    border: '1px solid currentColor'
                  }}>
                    {calculatedDistance <= 10
                      ? `🟢 Within Delivery Area! (Distance: ${calculatedDistance.toFixed(1)} km)`
                      : `🔴 Out of Delivery Range! (Distance: ${calculatedDistance.toFixed(1)} km - limit is 10km)`
                    }
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {[['name','Full Name'],['phone','Phone Number'],['line1','Address Line 1'],['line2','Address Line 2 (Optional)'],['city','City'],['pincode','PIN Code']].map(([key, label]) => (
                    <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{label}</label>
                      <input className="input" value={newAddr[key]} onChange={e => setNewAddr(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={handleAddAddress}>Save Address</button>
              </div>
            )}
          </div>

          {/* Payment */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>💳 Payment Method</h3>
            <div style={{
              border: '2px solid var(--color-primary)', borderRadius: 12, padding: '16px 20px',
              background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>💵 Cash on Delivery (COD)</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-medium)' }}>Pay when your order arrives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: 250, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0 }}>
                    {item.product?.primary_image ? <img src={item.product.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧴</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>₹{parseFloat(item.subtotal || 0).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-text-medium)' }}>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
              {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-success)' }}>Coupon Discount</span><span style={{ color: 'var(--color-success)' }}>-₹{discount.toFixed(0)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-text-medium)' }}>Delivery</span><span style={{ color: deliveryCharge === 0 ? 'var(--color-success)' : undefined }}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>
              <span>Total</span><span style={{ color: 'var(--color-primary)' }}>₹{total.toFixed(0)}</span>
            </div>

            {(() => {
              const hasCoords = selectedAddress 
                ? (!isNaN(parseFloat(selectedAddress.latitude)) && !isNaN(parseFloat(selectedAddress.longitude)))
                : (showNewForm && !isNaN(parseFloat(newAddr.latitude)) && !isNaN(parseFloat(newAddr.longitude)));

              const isCheckoutDisabled = selectedAddress
                ? (!hasCoords || calculatedDistance === null || calculatedDistance > 10)
                : (showNewForm
                    ? (!hasCoords || calculatedDistance === null || calculatedDistance > 10)
                    : true);
              
              return (
                <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handlePlaceOrder} disabled={placing || isCheckoutDisabled}>
                  {placing ? '⏳ Placing Order...' : '✅ Place Order (COD)'}
                </button>
              );
            })()}

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 12 }}>
              By placing order, you agree to our terms
            </p>
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
