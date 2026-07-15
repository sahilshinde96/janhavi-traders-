import { useState, useEffect, useRef } from 'react';
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

  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState(null);

  const STORE_LAT = 19.213000;
  const STORE_LON = 73.151000;

  const ALLOWED_PINCODES = ['421301', '421306', '421308', '421201', '421202', '421203', '421204', '421004'];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

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
      setCalculatedDistance(calculateDistance(STORE_LAT, STORE_LON, lat, lon));
    } else {
      setCalculatedDistance(null);
    }
  }, [selectedAddress, newAddr.latitude, newAddr.longitude, showNewForm]);

  const getBrowserLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) { toast.error('Geolocation is not supported by your browser'); reject(new Error('Not supported')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('GPS permission denied. Please allow location access in your browser settings.');
        } else {
          toast.error('Could not retrieve GPS coordinates. Please try again or verify location settings are enabled.');
        }
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });

  const handleFetchCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const coords = await getBrowserLocation();
      setNewAddr(prev => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }));
      toast.success('Location coordinates pinned successfully!');
    } catch (err) { console.error(err); } finally { setFetchingLocation(false); }
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
  const deliveryCharge = subtotal >= 199 ? 0 : 20;
  const total = subtotal - discount + deliveryCharge;

  const handleAddAddress = async () => {
    const required = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const f of required) {
      if (!newAddr[f].trim()) { toast.error(`Please fill in ${f}`); return; }
    }
    const pincode = newAddr.pincode.trim();
    if (!ALLOWED_PINCODES.includes(pincode)) {
      toast.error(`Sorry, we do not deliver to pincode ${pincode}. Delivery is only available in Kalyan/Dombivli areas.`);
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
    if (!selectedAddress && !showNewForm) { toast.error('Please select a delivery address'); return; }

    let address = selectedAddress;
    if (showNewForm) {
      const required = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
      for (const f of required) {
        if (!newAddr[f].trim()) { toast.error(`Please fill in ${f}`); return; }
      }
      address = newAddr;
    }

    // Pincode validation
    const pincode = address.pincode.trim();
    if (!ALLOWED_PINCODES.includes(pincode)) {
      toast.error(`Sorry, we do not deliver to pincode ${pincode}. Delivery is only available in Kalyan/Dombivli areas.`);
      return;
    }

    // GPS Geofence validation (only if coordinates are present)
    const lat = parseFloat(address.latitude);
    const lon = parseFloat(address.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      const distance = calculateDistance(STORE_LAT, STORE_LON, lat, lon);
      if (distance > 10) {
        toast.error(`Delivery is only available within 10km of our store. Your location is ${distance.toFixed(1)}km away.`);
        return;
      }
    }

    setPlacing(true);
    try {
      const { data } = await api.post('/orders/place/', {
        address: {
          name: address.name, phone: address.phone, line1: address.line1,
          line2: address.line2 || '', city: address.city, state: address.state,
          pincode: address.pincode, latitude: address.latitude, longitude: address.longitude
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
    <div className="container page-container">
      <h1 className="page-title mb-32">Checkout</h1>

      <div className="checkout-grid">
        {/* Left: Address */}
        <div>
          <div className="card-panel mb-24">
            <h3 className="flex align-center gap-8 fw-700 mb-20">
              <MapPin size={18} color="var(--color-primary)" /> Delivery Address
            </h3>

            {/* Saved addresses */}
            {addresses.length > 0 && (
              <div className="flex-col gap-12 mb-16">
                {addresses.map(addr => (
                  <div key={addr.id} onClick={() => { setSelectedAddress(addr); setShowNewForm(false); }} style={{
                    border: `2px solid ${selectedAddress?.id === addr.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 12, padding: '16px', cursor: 'pointer',
                    background: selectedAddress?.id === addr.id ? 'var(--color-secondary)' : 'white',
                    transition: 'all 0.2s', display: 'flex', gap: 12, alignItems: 'flex-start',
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
                      <p className="fw-700 mb-4">{addr.name} <span className="badge badge-neutral" style={{ marginLeft: 8 }}>{addr.label}</span></p>
                      <p className="fs-sm text-medium">{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                      <p className="fs-sm text-medium">{addr.city}, {addr.state} – {addr.pincode}</p>
                      <p className="fs-sm text-medium">📞 {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery area status alert for selected address */}
            {selectedAddress && (() => {
              const lat = parseFloat(selectedAddress.latitude);
              const lon = parseFloat(selectedAddress.longitude);
              const hasCoords = !isNaN(lat) && !isNaN(lon);
              
              if (hasCoords) {
                const dist = calculateDistance(STORE_LAT, STORE_LON, lat, lon);
                return (
                  <div className={`info-banner info-banner--${dist <= 10 ? 'success' : 'error'} mt-16`}>
                    {dist <= 10 
                      ? `🟢 Deliverable: Located ${dist.toFixed(1)} km from Kalyan store (within 10km delivery area).`
                      : `🔴 Undeliverable: Located ${dist.toFixed(1)} km from Kalyan store (exceeds 10km range).`
                    }
                  </div>
                );
              } else {
                return (
                  <div className="info-banner info-banner--success mt-16">
                    🟢 Deliverable: Pincode area verified.
                  </div>
                );
              }
            })()}

            {/* Add new */}
            <div className="mt-16">
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowNewForm(!showNewForm); setSelectedAddress(null); }}>
                <Plus size={14} style={{ marginRight: 6 }} /> {showNewForm ? 'Cancel' : 'Add New Address'}
              </button>
            </div>

            {showNewForm && (
              <div className="mt-20" style={{ animation: 'slideDown 0.2s ease' }}>
                <div className="grid-2 mb-16">
                  {[['name','Full Name'],['phone','Phone Number'],['line1','Address Line 1'],['line2','Address Line 2 (Optional)'],['city','City'],['pincode','PIN Code']].map(([key, label]) => (
                    <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{label}</label>
                      <input className="input" value={newAddr[key]} onChange={e => setNewAddr(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div className="grid-2">
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

                <div className="divider" style={{ margin: '20px 0' }} />

                {/* Location pinning via GPS */}
                <button type="button" className="btn btn-outline btn-sm w-full"
                  style={{ justifyContent: 'center', display: 'flex', gap: 8, alignItems: 'center' }}
                  onClick={handleFetchCurrentLocation} disabled={fetchingLocation}>
                  {fetchingLocation ? '⏳ Querying GPS Location...' : '📍 Verify My Current Location via GPS'}
                </button>
                
                {newAddr.latitude !== null && (() => {
                  const dist = calculateDistance(STORE_LAT, STORE_LON, parseFloat(newAddr.latitude), parseFloat(newAddr.longitude));
                  return (
                    <div className={`info-banner info-banner--${dist <= 10 ? 'success' : 'error'} mt-12`}>
                      {dist <= 10 
                        ? `🟢 Deliverable Location: Coordinates verified. Distance: ${dist.toFixed(1)} km from Kalyan store.`
                        : `🔴 Undeliverable Location: Distance is ${dist.toFixed(1)} km from Kalyan store (exceeds 10km radius).`
                      }
                    </div>
                  );
                })()}

                <div className="divider" style={{ margin: '20px 0' }} />

                <button className="btn btn-primary btn-sm" onClick={handleAddAddress}>Save Address</button>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="card-panel">
            <h3 className="fw-700 mb-16">💳 Payment Method</h3>
            <div style={{
              border: '2px solid var(--color-primary)', borderRadius: 12, padding: '16px 20px',
              background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div className="flex-center" style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)' }}>
                <Check size={12} color="white" />
              </div>
              <div>
                <p className="fw-700">💵 Cash on Delivery (COD)</p>
                <p className="fs-xs text-medium">Pay when your order arrives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="sticky-sidebar">
          <div className="card-panel-shadow">
            <h3 className="card-panel-title mb-20">Order Summary</h3>

            <div className="flex-col gap-12 mb-20" style={{ maxHeight: 250, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.id} className="flex gap-10 align-center">
                  <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0 }}>
                    {item.product?.primary_image
                      ? <img src={item.product.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div className="flex-center" style={{ width: '100%', height: '100%' }}>🧴</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</p>
                    <p className="fs-xs text-light">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className="fw-700 fs-sm" style={{ display: 'block' }}>₹{parseFloat(item.subtotal || 0).toFixed(0)}</span>
                    {parseFloat(item.product?.mrp || 0) > parseFloat(item.product?.offer_price || 0) && (
                      <span className="fs-xxs text-light" style={{ textDecoration: 'line-through' }}>
                        ₹{(parseFloat(item.product.mrp) * item.quantity).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />
            {(() => {
              const totalMRP = items.reduce((sum, item) => sum + parseFloat(item.product?.mrp || item.product?.offer_price || 0) * item.quantity, 0);
              const totalOfferPrice = subtotal;
              const productDiscount = totalMRP - totalOfferPrice;
              return (
                <div className="order-summary-rows">
                  {productDiscount > 0 ? (
                    <>
                      <div className="order-summary-row">
                        <span className="text-medium">Total MRP</span>
                        <span className="text-light" style={{ textDecoration: 'line-through' }}>₹{totalMRP.toFixed(0)}</span>
                      </div>
                      <div className="order-summary-row">
                        <span className="text-success">Product Discount</span>
                        <span className="text-success">-₹{productDiscount.toFixed(0)}</span>
                      </div>
                      <div className="order-summary-row fw-600">
                        <span className="text-medium">Discounted Price</span>
                        <span>₹{totalOfferPrice.toFixed(0)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="order-summary-row fw-600">
                      <span className="text-medium">Discounted Price</span>
                      <span>₹{subtotal.toFixed(0)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="order-summary-row">
                      <span className="text-success">Coupon Discount</span>
                      <span className="text-success">-₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="order-summary-row">
                    <span className="text-medium">Delivery</span>
                    {deliveryCharge === 0 ? (
                      <span className="text-success fw-700">FREE</span>
                    ) : (
                      <span className="fw-700" style={{ color: 'var(--color-text-dark)' }}>₹20</span>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="divider" />
            <div className="order-total-row">
              <span>Total</span>
              <span className="text-primary">₹{total.toFixed(0)}</span>
            </div>

            {(() => {
              const isCheckoutDisabled = !selectedAddress && !showNewForm;
              return (
                <button className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }}
                  onClick={handlePlaceOrder} disabled={placing || isCheckoutDisabled}>
                  {placing ? '⏳ Placing Order...' : '✅ Place Order (COD)'}
                </button>
              );
            })()}

            <p className="text-center fs-xs text-light mt-12">
              By placing order, you agree to our terms
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
