import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { Component } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactUs from './pages/ContactUs';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminInventory from './pages/admin/AdminInventory';

// Error Boundary to prevent white screen crashes (BUG-13 fix).
// This React Class Component catches JavaScript errors anywhere in their child component tree,
// logs those errors to the console, and displays a fallback UI instead of crashing the entire site.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Update state so the next render will show the fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log error details for diagnostics
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }


  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem' }}>😢</div>
          <h2 style={{ fontFamily: 'var(--font-display, Inter, sans-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#666', maxWidth: 400, lineHeight: 1.6 }}>
            We're sorry — an unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              background: 'var(--color-primary, #C8496A)', color: 'white',
              border: 'none', borderRadius: 10, padding: '12px 32px',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.is_staff) return <Navigate to="/" replace />;
  return children;
};

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
    <CartDrawer />
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
          success: { iconTheme: { primary: '#C8496A', secondary: '#fff' } },
        }}
      />
      {/* Wrap all application routes inside the ErrorBoundary so that any page render crash */}
      {/* shows the user-friendly fallback screen instead of failing entirely (BUG-13 fix). */}
      <ErrorBoundary>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminAddProduct />} />
          <Route path="products/edit/:slug" element={<AdminAddProduct />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="discounts" element={<AdminDiscounts />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>

        {/* Customer */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/:slug" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
        <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><Layout><OrderSuccess /></Layout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Layout><MyOrders /></Layout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
        <Route path="/returns-policy" element={<Layout><ReturnPolicy /></Layout>} />
        <Route path="/terms-of-service" element={<Layout><TermsOfService /></Layout>} />
        <Route path="/contact-us" element={<Layout><ContactUs /></Layout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
