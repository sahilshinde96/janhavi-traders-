import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShoppingBag, User, Search, Menu, X, ChevronDown,
  Home, Package, Tag, LogOut, Settings
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

const categories = [
  { name: 'Makeup', slug: 'makeup', emoji: '💄' },
  { name: 'Skincare', slug: 'skincare', emoji: '💧' },
  { name: 'Haircare', slug: 'haircare', emoji: '🌿' },
  { name: 'Fragrances', slug: 'fragrances', emoji: '✨' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, toggleCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { mobileMenuOpen, openMobileMenu, closeMobileMenu } = useUiStore();
  const [catDropdown, setCatDropdown] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const catRef = useRef(null);
  const accRef = useRef(null);
  const itemCount = cart?.item_count || 0;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatDropdown(false);
      if (accRef.current && !accRef.current.contains(e.target)) setAccountDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setAccountDropdown(false);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            JANHAVI <span>TRADERS</span>
          </Link>

          {/* Desktop nav links */}
          <div className="navbar-links">
            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/products" className={`navbar-link ${isActive('/products') ? 'active' : ''}`}>Products</Link>

            {/* Categories dropdown */}
            <div className="nav-dropdown-wrapper" ref={catRef}>
              <button
                className={`navbar-link ${catDropdown ? 'active' : ''}`}
                onClick={() => setCatDropdown(!catDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Categories
                <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: catDropdown ? 'rotate(180deg)' : '' }} />
              </button>
              {catDropdown && (
                <div className="nav-dropdown">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      className="nav-dropdown-item"
                      onClick={() => {
                        navigate(`/products?category=${cat.slug}`);
                        setCatDropdown(false);
                      }}
                    >
                      <span>{cat.emoji}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  autoFocus
                  className="input"
                  style={{ width: 200, padding: '8px 14px', fontSize: '0.85rem' }}
                  placeholder="Search products..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
                <button type="button" className="navbar-icon-btn" onClick={() => setSearchOpen(false)}>
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button className="navbar-icon-btn" onClick={() => setSearchOpen(true)} title="Search">
                <Search size={20} />
              </button>
            )}

            {/* Cart */}
            <button className="navbar-icon-btn" onClick={toggleCart} title="Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>

            {/* Account */}
            <div className="nav-dropdown-wrapper" ref={accRef}>
              <button
                className="navbar-icon-btn"
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else setAccountDropdown(!accountDropdown);
                }}
                title="Account"
              >
                <User size={20} />
              </button>
              {accountDropdown && isAuthenticated && (
                <div className="nav-dropdown" style={{ right: 0, left: 'auto' }}>
                  <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border)', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user?.name || 'My Account'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{user?.email || user?.phone}</div>
                  </div>
                  <button className="nav-dropdown-item" onClick={() => { navigate('/profile'); setAccountDropdown(false); }}>
                    <Settings size={15} /> Profile
                  </button>
                  <button className="nav-dropdown-item" onClick={() => { navigate('/orders'); setAccountDropdown(false); }}>
                    <Package size={15} /> My Orders
                  </button>
                  {user?.is_staff && (
                    <button className="nav-dropdown-item" onClick={() => { navigate('/admin'); setAccountDropdown(false); }}>
                      <Tag size={15} /> Admin Panel
                    </button>
                  )}
                  <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 4, paddingTop: 4 }}>
                    <button className="nav-dropdown-item" onClick={handleLogout} style={{ color: 'var(--color-error)' }}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button className="navbar-icon-btn" style={{ display: 'flex' }} onClick={openMobileMenu} title="Menu">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
          <div className="mobile-menu-drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div className="mobile-menu-logo">JANHAVI TRADERS</div>
              <button className="navbar-icon-btn" onClick={closeMobileMenu}><X size={20} /></button>
            </div>

            <button className="mobile-menu-link" onClick={() => { navigate('/'); closeMobileMenu(); }}>
              <Home size={18} /> Home
            </button>
            <button className="mobile-menu-link" onClick={() => { navigate('/products'); closeMobileMenu(); }}>
              <Package size={18} /> All Products
            </button>
            <div style={{ padding: '8px 16px 4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--color-text-light)' }}>
              Categories
            </div>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                className="mobile-menu-link"
                style={{ paddingLeft: 28, fontSize: '0.875rem' }}
                onClick={() => { navigate(`/products?category=${cat.slug}`); closeMobileMenu(); }}
              >
                <span>{cat.emoji}</span> {cat.name}
              </button>
            ))}
            <div className="divider" />
            {isAuthenticated ? (
              <>
                <button className="mobile-menu-link" onClick={() => { navigate('/profile'); closeMobileMenu(); }}>
                  <User size={18} /> Profile
                </button>
                <button className="mobile-menu-link" onClick={() => { navigate('/orders'); closeMobileMenu(); }}>
                  <Package size={18} /> My Orders
                </button>
                <button
                  className="mobile-menu-link"
                  style={{ color: 'var(--color-error)' }}
                  onClick={() => { logout(); closeMobileMenu(); navigate('/'); }}
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary w-full"
                style={{ marginTop: 8 }}
                onClick={() => { navigate('/login'); closeMobileMenu(); }}
              >
                <User size={16} /> Login / Register
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
