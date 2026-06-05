import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', marginLeft: 260 }}>
        <Outlet />
      </main>
    </div>
  );
}
