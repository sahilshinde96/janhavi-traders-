import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Percent,
  Warehouse, LogOut, ChevronRight, Globe,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo.png';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/discounts', icon: Percent, label: 'Discounts' },
  { to: '/admin/inventory', icon: Warehouse, label: 'Inventory' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 260,
      background: 'linear-gradient(180deg, #1C1C2E 0%, #2D1B3D 100%)',
      display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <img src={logo} alt="BLUSHH Logo" style={{ height: 48, width: 48, borderRadius: '50%', objectFit: 'cover' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            BLUSHH
          </h2>
        </div>
        <span style={{
          background: 'rgba(244,137,147,0.2)', color: '#ffb4be',
          border: '1px solid rgba(244,137,147,0.3)', padding: '3px 10px',
          borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px',
        }}>ADMIN PANEL</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 10, textDecoration: 'none',
              background: isActive ? 'rgba(244,137,147,0.2)' : 'transparent',
              border: isActive ? '1px solid rgba(244,137,147,0.3)' : '1px solid transparent',
              color: isActive ? '#ffb4be' : 'rgba(255,255,255,0.65)',
              fontWeight: isActive ? 700 : 400, fontSize: '0.9rem',
              transition: 'all 0.2s',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', marginBottom: 8,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
          }}>
            {(user?.name || user?.email || 'A')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Admin'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/')} style={{
          width: '100%', padding: '10px 14px', background: 'rgba(244,137,147,0.15)',
          border: '1px solid rgba(244,137,147,0.25)', borderRadius: 8, cursor: 'pointer',
          color: '#ffb4be', display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.875rem', transition: 'all 0.2s', marginBottom: 8,
          fontWeight: 600, justifyContent: 'center'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(244,137,147,0.25)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(244,137,147,0.15)';
        }}>
          <Globe size={16} /> View Storefront
        </button>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.875rem', transition: 'all 0.2s', justifyContent: 'center'
        }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
