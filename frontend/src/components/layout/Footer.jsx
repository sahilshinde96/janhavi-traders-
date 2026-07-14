import { useNavigate } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <div className="footer-logo flex align-center gap-10 mb-16">
                <img src={logo} alt="BLUSHH Logo" style={{ height: 52, width: 52, borderRadius: '50%', objectFit: 'cover' }} />
                <span>BLUSHH</span>
              </div>
              <p className="footer-tagline">
                Your trusted destination for premium, authentic cosmetics and beauty products.
                Beauty that defines you. 💄
              </p>
              <div className="flex gap-12">
                {[
                  { Icon: Instagram, url: 'https://www.instagram.com/letz.blushh?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' },
                  { Icon: Facebook, url: '#' },
                  { Icon: Youtube, url: '#' }
                ].map(({ Icon, url }, i) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-btn"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <div className="footer-section-title">Shop</div>
              {['Makeup', 'Skincare', 'Haircare', 'Fragrances', 'New Arrivals', 'Sale'].map((item) => (
                <button
                  key={item}
                  className="footer-link"
                  onClick={() => navigate(`/products?category=${item.toLowerCase().replace(' ', '-')}`)}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Help */}
            <div>
              <div className="footer-section-title">Help</div>
              {['Returns & Exchange', 'Shipping Policy', 'Track Order', 'Contact Us', 'Privacy Policy'].map((item) => (
                <button
                  key={item}
                  className="footer-link"
                  onClick={() => {
                    if (item === 'Privacy Policy') navigate('/privacy-policy');
                    else if (item === 'Returns & Exchange') navigate('/returns-policy');
                    else if (item === 'Contact Us') navigate('/contact-us');
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Contact */}
            <div>
              <div className="footer-section-title">Contact Us</div>
              <div className="flex-col gap-12">
                {[
                  { Icon: Mail,    text: 'blushh1019@gmail.com' },
                  { Icon: Phone,   text: '9867284216/ 8928762528' },
                  { Icon: MapPin,  text: 'Kalyan, Maharashtra, India' },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex gap-10 align-center fs-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <Icon size={16} style={{ marginTop: 2, flexShrink: 0, color: 'var(--color-primary-light)' }} />
                    {text}
                  </div>
                ))}
              </div>
              <div className="mt-20">
                <div className="footer-section-title mb-10">We Accept</div>
                <div className="flex gap-8 flex-wrap">
                  {['Cash On Delivery'].map((m) => (
                    <span
                      key={m}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.8)',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {year} BLUSHH. All rights reserved.</span>
            <div className="flex gap-20">
              <button className="footer-link" style={{ margin: 0 }} onClick={() => navigate('/terms-of-service')}>Terms of Service</button>
              <button className="footer-link" style={{ margin: 0 }} onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
