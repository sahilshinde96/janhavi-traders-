import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/axios';

const FALLBACK_CATEGORIES = [
  { name: 'Makeup', slug: 'makeup' },
  { name: 'Skincare', slug: 'skincare' },
  { name: 'Haircare', slug: 'haircare' },
  { name: 'Fragrances', slug: 'fragrances' },
];

export default function MobileQuickNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  useEffect(() => {
    api.get('/products/categories/')
      .then(r => {
        const cats = r.data.results || r.data;
        if (cats && cats.length > 0) setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Quick Navigation */}
      <div className="mobile-quick-nav">
        <Link to="/" className={`quick-nav-btn ${isActive('/') ? 'active' : ''}`}>
          <span>Home</span>
        </Link>
        <Link to="/products" className={`quick-nav-btn ${isActive('/products') ? 'active' : ''}`}>
          <span>Products</span>
        </Link>
        <button 
          className={`quick-nav-btn ${showMobileCategories ? 'active' : ''}`}
          onClick={() => setShowMobileCategories(!showMobileCategories)}
        >
          <span>Shop by Categories</span>
        </button>
      </div>

      {/* Mobile Categories list dropdown */}
      {showMobileCategories && (
        <div className="mobile-quick-categories">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className="mobile-category-btn"
              onClick={() => {
                navigate(`/products?category_slug=${cat.slug}`);
                setShowMobileCategories(false);
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
