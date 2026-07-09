import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Query', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Your message has been sent successfully! 🚀');
    }, 1200);
  };

  return (
    <div className="contact-page-wrapper">
      {/* Decorative Blur Spheres */}
      <div className="bg-sphere-1"></div>
      <div className="bg-sphere-2"></div>

      {/* Header Banner */}
      <header className="contact-header">
        <div className="container header-container">
          <div className="badge-wrapper animate-fade-in">
            <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
              <MessageSquare size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Contact Channels
            </span>
          </div>
          <h1 className="contact-title animate-slide-up">Get in Touch</h1>
          <p className="contact-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
            We're here to help! Connect with our customer support teams for order status, tracking, B2B wholesale, or legal escalations.
          </p>
        </div>
      </header>

      {/* Delivery Notice Bar */}
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="delivery-notice-bar animate-scale-in">
          <div className="notice-icon-circle">📦</div>
          <div>
            <strong>Mandatory Open Box & COD Operations</strong>
            <p>Because we operate on a strict Cash on Delivery (COD) model, we encourage you to open and inspect your packages in front of our delivery executive before making your cash payment.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Card details */}
      <div className="container main-content-container">
        <div className="contact-grid">
          
          {/* Support Channels details */}
          <div className="contact-info-column">
            
            {/* Support Desk Card */}
            <div className="info-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="info-card-header">
                <div className="info-icon-wrapper"><Phone size={20} /></div>
                <div>
                  <h3>Customer Support Desk</h3>
                  <p className="info-card-subtitle">Orders, delivery timelines, variants & storefront queries</p>
                </div>
              </div>
              <div className="info-card-body">
                <div className="info-row">
                  <span className="info-label">WhatsApp & Phone Support</span>
                  <a href="tel:+918433893228" className="info-value-link">+91 84338 93228</a>
                  <span style={{ margin: '0 8px', color: 'var(--color-border)' }}>|</span>
                  <a href="tel:+918928762528" className="info-value-link">+91 89287 62528</a>
                </div>
                <div className="info-row">
                  <span className="info-label">Official Support Email</span>
                  <a href="mailto:blushh1019@gmail.com" className="info-value-link">blushh1019@gmail.com</a>
                </div>
                <div className="info-row">
                  <span className="info-label">Operating Hours</span>
                  <span className="info-value-text"><Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Mon to Sat, 10:00 AM – 6:00 PM IST</span>
                </div>
              </div>
            </div>

            {/* Quality Support Card */}
            <div className="info-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="info-card-header">
                <div className="info-icon-wrapper secondary"><ShieldCheck size={20} /></div>
                <div>
                  <h3>Returns & Product Quality</h3>
                  <p className="info-card-subtitle">Hidden manufacturing defects or product expiry</p>
                </div>
              </div>
              <div className="info-card-body">
                <p className="info-notes">
                  If you discover an internal defect within our <strong>24-hour reporting window</strong>:
                </p>
                <div className="info-row">
                  <span className="info-label">Email Quality Support</span>
                  <a href="mailto:blushh1019@gmail.com" className="info-value-link">blushh1019@gmail.com</a>
                </div>
                <div className="instruction-box">
                  <strong>💡 Attach Unboxing Evidence</strong>
                  <p>Please attach clear unboxing photos or a short video showcasing the product batch code and the defect so our backend team can validate your request immediately.</p>
                </div>
              </div>
            </div>

            {/* Head Office Card */}
            <div className="info-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="info-card-header">
                <div className="info-icon-wrapper"><MapPin size={20} /></div>
                <div>
                  <h3>Principal Place of Business</h3>
                  <p className="info-card-subtitle">Official physical correspondence & B2B distributors</p>
                </div>
              </div>
              <div className="info-card-body">
                <div className="info-row">
                  <span className="info-label">Registered Entity</span>
                  <span className="info-value-text">BLUSHH</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Office Address</span>
                  <span className="info-value-text">
                    Shop no 2, Anjanabai Appartment, Malangad Rd, near dinkar bhane nagar, Pisavli Village, Kalyan East, Kalyan, Maharashtra 421306
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Grievance Card */}
            <div className="info-card escalation-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="info-card-body">
                <h4 className="escalation-title">⚖️ Legal Grievance Redressal</h4>
                <p className="escalation-text">
                  In compliance with the Information Technology Act, 2000, unresolved issues can be escalated to our designated Grievance Officer:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
                  <div><strong>Grievance Officer:</strong> Rohit Jaiswar</div>
                  <div><strong>Escalation Email:</strong> <a href="mailto:blushh1019@gmail.com" className="info-value-link">blushh1019@gmail.com</a></div>
                </div>
              </div>
            </div>

          </div>

          {/* Contact Form Column */}
          <div className="contact-form-column animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="form-card">
              {!submitted ? (
                <>
                  <div className="form-header">
                    <h2>Send Us a Message</h2>
                    <p>We aim to respond to all email inquiries within 24 business hours.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="actual-form">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="John Doe" 
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="input" 
                        placeholder="john@example.com" 
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <select 
                        className="select" 
                        value={form.subject}
                        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      >
                        <option>General Query</option>
                        <option>Order Status / Tracking</option>
                        <option>Return / Damaged Product</option>
                        <option>Wholesale / B2B Inquiry</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Your Message</label>
                      <textarea 
                        className="textarea" 
                        rows="5" 
                        placeholder="How can we help you today?" 
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        required
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg" 
                      style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : <><Send size={16} /> Send Inquiry</>}
                    </button>
                  </form>
                </>
              ) : (
                <div className="success-state animate-scale-in">
                  <CheckCircle size={56} className="success-icon animate-pulse" />
                  <h2>Thank You!</h2>
                  <p>Your message has been submitted. Our support team will reach out to you at <strong>{form.email}</strong> within 24 business hours.</p>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: 'General Query', message: '' }); }}
                    style={{ marginTop: 24 }}
                  >
                    Send Another Message
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Styled JSX for scoped premium styles */}
      <style>{`
        .contact-page-wrapper {
          position: relative;
          background-color: var(--color-bg);
          color: var(--color-text-dark);
          font-family: var(--font-primary);
          line-height: 1.7;
          overflow-x: hidden;
          padding-bottom: 80px;
        }

        /* Decorative glowing shapes */
        .bg-sphere-1 {
          position: absolute;
          top: 0;
          left: -10%;
          width: 50vw;
          height: 50vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(244,137,147,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .bg-sphere-2 {
          position: absolute;
          top: 50%;
          right: -10%;
          width: 45vw;
          height: 45vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Header Style */
        .contact-header {
          position: relative;
          padding: 80px 0 30px;
          text-align: center;
          z-index: 1;
        }

        .header-container {
          max-width: 800px;
        }

        .badge-wrapper {
          display: inline-block;
          margin-bottom: 20px;
        }

        .contact-title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 3.8rem);
          font-weight: 700;
          color: var(--color-dark);
          line-height: 1.1;
          margin-bottom: 20px;
        }

        .contact-subtitle {
          font-size: clamp(1rem, 2vw, 1.15rem);
          color: var(--color-text-medium);
          max-width: 680px;
          margin: 0 auto;
        }

        /* Delivery Notice Bar */
        .delivery-notice-bar {
          background: linear-gradient(135deg, #FFF9FA 0%, #FFF0F3 100%);
          border: 1.5px solid var(--color-primary-light);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 48px;
          box-shadow: var(--shadow-sm);
        }

        .notice-icon-circle {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: white;
          border: 1.5px solid var(--color-primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: var(--shadow-xs);
        }

        .delivery-notice-bar strong {
          color: var(--color-primary-dark);
          font-size: 1.05rem;
          display: block;
          margin-bottom: 4px;
        }

        .delivery-notice-bar p {
          font-size: 0.9rem;
          color: var(--color-text-dark);
          margin: 0;
          line-height: 1.5;
        }

        /* Layout Grid */
        .main-content-container {
          position: relative;
          z-index: 1;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: start;
        }

        /* Support Channels Column */
        .contact-info-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 28px;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition);
        }

        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--color-secondary);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .info-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: var(--color-secondary);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-icon-wrapper.secondary {
          background-color: #E8F5E9;
          color: var(--color-success);
        }

        .info-card-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-dark);
          margin: 0;
        }

        .info-card-subtitle {
          font-size: 0.8rem;
          color: var(--color-text-medium);
          margin: 0;
          margin-top: 2px;
        }

        .info-card-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
        }

        .info-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          color: var(--color-text-light);
          margin-bottom: 4px;
        }

        .info-value-link {
          color: var(--color-primary);
          font-weight: 600;
          font-size: 0.95rem;
          transition: color var(--transition);
          display: inline-block;
          width: fit-content;
        }

        .info-value-link:hover {
          color: var(--color-primary-dark);
        }

        .info-value-text {
          color: var(--color-text-dark);
          font-weight: 500;
        }

        .info-notes {
          font-size: 0.9rem;
          color: var(--color-text-dark);
          margin: 0;
        }

        .instruction-box {
          padding: 16px;
          background-color: #FFFDF9;
          border: 1.5px dashed #FFE8C5;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
        }

        .instruction-box strong {
          display: block;
          margin-bottom: 4px;
          color: var(--color-warning);
        }

        .instruction-box p {
          margin: 0;
          color: var(--color-text-medium);
          line-height: 1.5;
        }

        /* Legal Escalation Card */
        .escalation-card {
          border-left: 4px solid var(--color-primary);
          background-color: #FFF5F7;
          border-color: var(--color-border);
        }

        .escalation-title {
          font-weight: 700;
          color: var(--color-primary-dark);
          font-size: 1rem;
          margin-bottom: 10px;
        }

        .escalation-text {
          font-size: 0.875rem;
          color: var(--color-text-dark);
          margin-bottom: 12px;
          line-height: 1.6;
        }

        /* Form Card Styling */
        .contact-form-column {
          position: sticky;
          top: 90px;
        }

        .form-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: var(--shadow-sm);
        }

        .form-header {
          margin-bottom: 30px;
        }

        .form-header h2 {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--color-dark);
          margin-bottom: 8px;
        }

        .form-header p {
          font-size: 0.88rem;
          color: var(--color-text-medium);
          margin: 0;
        }

        /* Success state inside form card */
        .success-state {
          padding: 40px 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .success-icon {
          color: var(--color-success);
          margin-bottom: 24px;
        }

        .success-state h2 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--color-dark);
          margin-bottom: 12px;
        }

        .success-state p {
          font-size: 0.95rem;
          color: var(--color-text-medium);
          max-width: 320px;
          line-height: 1.6;
          margin: 0;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .contact-form-column {
            position: static;
          }

          .form-card {
            padding: 30px;
          }
        }

        @media (max-width: 768px) {
          .contact-header {
            padding: 60px 0 20px;
          }

          .delivery-notice-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 20px;
            margin-bottom: 32px;
          }

          .notice-icon-circle {
            width: 48px;
            height: 48px;
            font-size: 1.5rem;
          }

          .info-card {
            padding: 20px;
          }

          .form-card {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
}
