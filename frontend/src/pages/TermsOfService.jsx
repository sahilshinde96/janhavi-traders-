import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Mail, Phone, MapPin, Calendar, Clock, ChevronRight, FileCheck, Landmark, Check } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', title: 'Overview' },
  { id: 'eligibility', title: '1. User Eligibility' },
  { id: 'cod', title: '2. Exclusive COD Model' },
  { id: 'open-box', title: '3. Open Box Delivery' },
  { id: 'cancellations', title: '4. Order Cancellations' },
  { id: 'claims', title: '5. Post-Delivery Claims' },
  { id: 'wholesale', title: '6. Wholesale & B2B' },
  { id: 'intellectual-property', title: '7. Intellectual Property' },
  { id: 'liability', title: '8. Liability Cap' },
  { id: 'governing-law', title: '9. Governing Law' },
  { id: 'contact', title: '10. Contact Info' },
];

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('overview');
  const sectionRefs = useRef({});

  useEffect(() => {
    window.scrollTo(0, 0);

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleSidebarClick = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = 90; // Sticky header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="terms-page-wrapper">
      {/* Dynamic Background Accents */}
      <div className="bg-decor-1"></div>
      <div className="bg-decor-2"></div>

      {/* Header Banner */}
      <header className="terms-header">
        <div className="container header-container">
          <div className="badge-wrapper animate-fade-in">
            <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
              <FileCheck size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Terms & Conditions
            </span>
          </div>
          <h1 className="terms-title animate-slide-up">Terms of Service</h1>
          <p className="terms-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Please read these Terms carefully before accessing or using our Website.
          </p>
          <div className="metadata-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="metadata-item">
              <Calendar size={14} className="meta-icon" />
              <span><strong>Effective Date:</strong> June 11, 2026</span>
            </div>
            <div className="metadata-divider"></div>
            <div className="metadata-item">
              <Landmark size={14} className="meta-icon" />
              <span><strong>Governance:</strong> Indian Partnership Act, 1932</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="container main-content-container">
        <div className="terms-grid">
          
          {/* Sticky Sidebar */}
          <aside className="terms-sidebar-column">
            <div className="terms-sidebar-card">
              <div className="sidebar-header">
                <ShieldAlert size={18} className="sidebar-header-icon" />
                <h3>Agreement Index</h3>
              </div>
              <nav className="sidebar-nav">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => handleSidebarClick(sec.id)}
                    className={`sidebar-nav-btn ${activeSection === sec.id ? 'active' : ''}`}
                  >
                    <ChevronRight size={14} className="nav-arrow" />
                    <span>{sec.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Terms Text Column */}
          <main className="terms-content-column">
            
            {/* Overview Section */}
            <section id="overview" className="policy-section">
              <h2 className="section-heading">Overview & Acceptance of Terms</h2>
              <div className="section-body">
                <p>
                  This website, <a href="https://blushh.online" target="_blank" rel="noopener noreferrer" className="inline-link">blushh.online</a> (hereinafter referred to as the <strong>"Platform"</strong> or <strong>"Website"</strong>), is owned and operated by <strong>BLUSHH</strong>, a partnership firm registered under the Indian Partnership Act, 1932, with its principal place of business at Shop no 2, Anjanabai Appartment, Malangad Rd, near dinkar bhane nagar, Pisavli Village, Kalyan East, Kalyan, Maharashtra 421306 (hereinafter referred to as the <strong>"Company"</strong>, <strong>"We"</strong>, <strong>"Us"</strong>, or <strong>"Our"</strong>).
                </p>
                <p>
                  Throughout the Platform, the terms <strong>"You"</strong>, <strong>"Your"</strong>, <strong>"Yourself"</strong>, and <strong>"User"</strong> refer to any natural or legal person who accesses, browses, or transacts on the Website to purchase cosmetic, skincare, haircare, and personal care products.
                </p>
                <p>
                  By visiting our Platform and/or placing an order, you engage in our <strong>"Services"</strong> and agree to be bound by the following terms and conditions (<strong>"Terms of Service"</strong>, <strong>"Terms"</strong>), including those additional terms, conditions, and policies referenced herein or available by hyperlink. Please read these Terms carefully before accessing or using our Website. If you do not agree to all the terms and conditions of this agreement, you must discontinue use of the Platform immediately.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 1: User Eligibility */}
            <section id="eligibility" className="policy-section">
              <h2 className="section-heading">1. User Eligibility and Registration</h2>
              <div className="section-body">
                <ul className="custom-list checkmarks">
                  <li>
                    <strong>1.1 Open Access Policy:</strong> Our Platform is open to all consumers. Users of all age groups, including minors looking to purchase cosmetics for their skincare and personal grooming routines, are welcome to browse and place orders on the Platform.
                  </li>
                  <li>
                    <strong>1.2 Account Security:</strong> To access specific features, such as placing B2B wholesale orders or saving your checkout preferences, you may register a user account. You are solely responsible for maintaining the confidentiality of your account credentials (username and password) and for all activities that occur under your account.
                  </li>
                  <li>
                    <strong>1.3 Data Accuracy:</strong> You agree to provide true, current, and complete shipping and contact information during registration and checkout. BLUSHH reserves the right to suspend or terminate accounts that provide explicitly false or completely unreachable delivery details.
                  </li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 2: Exclusive COD Model */}
            <section id="cod" className="policy-section">
              <h2 className="section-heading">2. Commercial Model: Exclusive Cash on Delivery (COD)</h2>
              <div className="section-body">
                <p>
                  We operate exclusively on a Cash on Delivery commercial framework.
                </p>
                <div className="alert-card info">
                  <div className="alert-title">💳 COD Only Enforcement</div>
                  <ul className="custom-list bullets" style={{ margin: 0, paddingLeft: 0 }}>
                    <li><strong>2.1 No Advance Digital Payments:</strong> We do not collect, capture, or process advance digital payments (credit/debit cards, net banking, online wallet captures) at the time of checkout on the Platform.</li>
                    <li><strong>2.2 Lawful Cash Collection:</strong> You agree to pay the total invoiced amount in physical cash to our authorized logistics fulfillment partner immediately upon receiving and approving the delivery at your doorstep.</li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 3: Open Box Delivery */}
            <section id="open-box" className="policy-section">
              <h2 className="section-heading">3. Mandatory Open Box Delivery Protocol</h2>
              <div className="section-body">
                <p>
                  All shipments fulfilled by BLUSHH are bound by a strict, non-negotiable Open Box Delivery rule.
                </p>
                <ul className="custom-list checkmarks">
                  <li>
                    <strong>3.1 Open Doorstep Inspection:</strong> At the moment of delivery, you are required to open the outer shipping container and physically inspect the cosmetic goods inside in front of our logistics courier partner prior to handing over the cash payment.
                  </li>
                  <li>
                    <strong>3.2 Right to Reject:</strong> If you detect physical transit damage, bottle leakage, open safety seals, an incorrect product variant, or an incomplete order mismatch, you must reject the entire shipment right at the doorstep. In such cases, no cash is exchanged, and the order is cancelled with net-zero liability.
                  </li>
                  <li>
                    <strong>3.3 Explicit Post-Acceptance Waiver:</strong> Once you complete the open box check, accept the package, and hand over the cash to the courier representative, you explicitly acknowledge that the order was delivered complete and free of transit damage. No post-delivery claims for external breakage, leakage, or shortages will be entertained.
                  </li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 4: Cancellations */}
            <section id="cancellations" className="policy-section">
              <h2 className="section-heading">4. Order Cancellations & System Modifications</h2>
              <div className="section-body">
                <p>
                  Our cancellation guidelines reflect the flexibility of our operational structure:
                </p>
                <ul className="custom-list bullets">
                  <li>
                    <strong>4.1 Absolute Customer Flexibility:</strong> Because we run on an exclusive COD framework, you possess the right to cancel your order at any stage—whether it is before dispatch via your user dashboard, mid-transit by notifying the handler, or at your doorstep during the open-box verification stage—without facing any penalty fees or legal charges.
                  </li>
                  <li>
                    <strong>4.2 Company Cancellation Rights:</strong> BLUSHH reserves the right to unilaterally cancel any order if an item is entirely out of stock, if your delivery location is outside our courier footprint, or if a severe technological glitch misprices a product on the storefront. Since no advance funds are taken, no financial liability rests on the Company for such system cancellations.
                  </li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 5: Claims */}
            <section id="claims" className="policy-section">
              <h2 className="section-heading">5. Post-Delivery Claims (Hidden Manufacturing Defects Only)</h2>
              <div className="section-body">
                <ul className="custom-list checkmarks">
                  <li>
                    <strong>5.1 Limited 24-Hour Reporting Window:</strong> For internal flaws that could not be seen during the doorstep open box check (such as a broken inner applicator pump or a post-delivery discovery of an expired batch date), you must report the issue within 24 hours of delivery by contacting our support desk exclusively at <a href="mailto:blushh1019@gmail.com" className="inline-link">blushh1019@gmail.com</a>.
                  </li>
                  <li>
                    <strong>5.2 Verification Evidence:</strong> All claims must be accompanied by high-resolution photographs or a short video showcasing the manufacturing fault or clear expiry stamp. Unverified or altered goods will be rejected at our inspection warehouse.
                  </li>
                  <li>
                    <strong>5.3 Refund Mode:</strong> Validated hidden defects will be resolved via a free replacement shipment or a refund. Approved monetary refunds will be handed over via our local reverse logistics network or directly executed via electronic bank transfer (NEFT/IMPS) within 5–7 business days of inspection validation.
                  </li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 6: Wholesale */}
            <section id="wholesale" className="policy-section">
              <h2 className="section-heading">6. Wholesale & B2B Client Terms</h2>
              <div className="section-body">
                <p>
                  BLUSHH provides wholesale supply and bulk logistics channels to commercial B2B buyers. Wholesale buyers agree to the following modified parameters:
                </p>
                <ul className="custom-list bullets">
                  <li>
                    <strong>6.1 Shortage and Discrepancy Framework:</strong> Open box inspection rules apply fully to bulk parcels. Any shortages or internal damage must be noted instantly on your business's formal corporate letterhead and countersigned by the delivery agent at the doorstep.
                  </li>
                  <li>
                    <strong>6.2 Commercial Clearance:</strong> Approved bulk refunds are processed purely via commercial bank transfer (NEFT/RTGS) to the registered commercial account of your business entity within 7–10 business days of warehouse verification.
                  </li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 7: IP */}
            <section id="intellectual-property" className="policy-section">
              <h2 className="section-heading">7. Intellectual Property & Brand Authenticity</h2>
              <div className="section-body">
                <p>
                  All components of our web applications are legally protected assets.
                </p>
                <ul className="custom-list checkmarks">
                  <li>
                    <strong>7.1 Trademark Protection:</strong> All content displayed on <a href="https://blushh.online" className="inline-link">blushh.online</a>—including our brand logos, text layouts, graphical design interfaces, custom database filtering scripts, and photographic media assets—is the exclusive intellectual property of BLUSHH. Any unauthorized copying or commercial distribution is strictly prohibited.
                  </li>
                  <li>
                    <strong>7.2 Authenticity Guarantee:</strong> We guarantee that all cosmetics (including items from labels like Dermalogica, Mamaearth, and Nivea) are 100% genuine and sourced directly from verified manufacturing and distribution streams.
                  </li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 8: Liability */}
            <section id="liability" className="policy-section">
              <h2 className="section-heading">8. Limitation of Liability & Indemnification</h2>
              <div className="section-body">
                <p>
                  Understanding commercial limits and warranty scopes:
                </p>
                <ul className="custom-list bullets">
                  <li>
                    <strong>8.1 Disclaimer of Warranties:</strong> BLUSHH does not guarantee that the product descriptions, ingredient listings, or color shade representations on the storefront are entirely error-free due to differing device displays and technical limitations. Your reliance on information listed on the platform is at your own risk.
                  </li>
                  <li>
                    <strong>8.2 Liability Cap:</strong> To the maximum extent permitted by Indian law, BLUSHH, its registered partners, and employees shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the website or allergic reactions to cosmetic formulations purchased from our store. You are advised to review ingredient lists carefully prior to usage.
                  </li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 9: Governing Law */}
            <section id="governing-law" className="policy-section">
              <h2 className="section-heading">9. Governing Law and Dispute Jurisdiction</h2>
              <div className="section-body">
                <p>
                  These Terms of Service, along with your access to the Platform, shall be governed by, interpreted, and construed strictly in accordance with the laws of the Republic of India.
                </p>
                <div className="note-card warning" style={{ borderLeftWidth: 3, borderLeftColor: 'var(--color-primary)' }}>
                  <strong>⚖️ Jurisdictional Limits</strong>
                  <p style={{ margin: 0, marginTop: 4 }}>
                    Any legal dispute, controversy, or claim arising out of or relating to your transaction or interaction with BLUSHH shall be subject to the exclusive jurisdiction of the competent courts located in Kalyan or Mumbai, Maharashtra, India.
                  </p>
                </div>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 10: Contact */}
            <section id="contact" className="policy-section">
              <h2 className="section-heading">10. Contact Information</h2>
              <div className="section-body">
                <p>
                  For any legal queries, clarifications on these Terms, or enforcement support, contact our team directly at:
                </p>
                
                {/* Contact Card Widget */}
                <div className="contact-card">
                  <div className="contact-card-header">
                    <div className="avatar-placeholder">JT</div>
                    <div>
                      <h4 className="contact-name">BLUSHH Help Desk</h4>
                      <p className="contact-title">Operations & Support</p>
                    </div>
                  </div>
                  <div className="contact-card-body">
                    <div className="contact-item-row">
                      <Mail size={16} className="contact-icon" />
                      <div>
                        <span className="contact-label">Official Contact Email</span>
                        <a href="mailto:blushh1019@gmail.com" className="contact-value-link">blushh1019@gmail.com</a>
                      </div>
                    </div>
                    <div className="contact-item-row">
                      <Phone size={16} className="contact-icon" />
                      <div>
                        <span className="contact-label">Corporate Support Desk</span>
                        <span className="contact-value">+91 84338 93228 / +91 89287 62528</span>
                      </div>
                    </div>
                    <div className="contact-item-row">
                      <MapPin size={16} className="contact-icon" />
                      <div>
                        <span className="contact-label">Principal Place of Business</span>
                        <span className="contact-value">Shop no 2, Anjanabai Appartment, Malangad Rd, near dinkar bhane nagar, Pisavli Village, Kalyan East, Kalyan, Maharashtra 421306</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p style={{ marginTop: 24 }}>
                  <strong>Escalation Desk:</strong> Unresolved disputes can be escalated formally to our designated Grievance Officer, <strong>Rohit Jaiswar</strong>, as detailed under our official Privacy Policy page.
                </p>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* Styled JSX for scoped premium styles */}
      <style>{`
        .terms-page-wrapper {
          position: relative;
          background-color: var(--color-bg);
          color: var(--color-text-dark);
          font-family: var(--font-primary);
          line-height: 1.7;
          overflow-x: hidden;
          padding-bottom: 80px;
        }

        /* Ambient glowing circles */
        .bg-decor-1 {
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

        .bg-decor-2 {
          position: absolute;
          top: 30%;
          right: -10%;
          width: 45vw;
          height: 45vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Header Style */
        .terms-header {
          position: relative;
          padding: 80px 0 60px;
          background: linear-gradient(135deg, #FDF8F9 0%, #F5E8EC 100%);
          border-bottom: 1px solid var(--color-border);
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

        .terms-title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 3.8rem);
          font-weight: 700;
          color: var(--color-dark);
          line-height: 1.1;
          margin-bottom: 20px;
        }

        .terms-subtitle {
          font-size: clamp(1rem, 2vw, 1.15rem);
          color: var(--color-text-medium);
          max-width: 680px;
          margin: 0 auto 30px;
        }

        .metadata-row {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: white;
          padding: 10px 24px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--color-text-medium);
        }

        .meta-icon {
          color: var(--color-primary);
        }

        .metadata-divider {
          width: 1px;
          height: 16px;
          background-color: var(--color-border);
        }

        /* Layout Grid */
        .main-content-container {
          position: relative;
          z-index: 1;
          margin-top: 50px;
        }

        .terms-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
        }

        /* Sidebar Styling */
        .terms-sidebar-column {
          position: relative;
        }

        .terms-sidebar-card {
          position: sticky;
          top: 90px;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 24px 16px;
          box-shadow: var(--shadow-sm);
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }

        /* Custom Scrollbar for Sidebar */
        .terms-sidebar-card::-webkit-scrollbar {
          width: 4px;
        }
        .terms-sidebar-card::-webkit-scrollbar-thumb {
          background-color: var(--color-border);
          border-radius: 4px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px 16px;
          border-bottom: 1.5px solid var(--color-secondary);
          margin-bottom: 16px;
        }

        .sidebar-header-icon {
          color: var(--color-primary);
        }

        .sidebar-header h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background: none;
          border: none;
          text-align: left;
          color: var(--color-text-medium);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
        }

        .sidebar-nav-btn .nav-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all var(--transition);
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .sidebar-nav-btn:hover {
          color: var(--color-primary);
          background-color: var(--color-secondary);
        }

        .sidebar-nav-btn.active {
          color: var(--color-primary);
          background-color: var(--color-secondary);
          font-weight: 600;
        }

        .sidebar-nav-btn.active .nav-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* Content Area Styling */
        .terms-content-column {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 48px;
          box-shadow: var(--shadow-sm);
        }

        .policy-section {
          scroll-margin-top: 100px;
        }

        .section-heading {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--color-dark);
          margin-bottom: 24px;
        }

        .section-body p {
          margin-bottom: 20px;
          color: var(--color-text-dark);
        }

        .section-body p:last-child {
          margin-bottom: 0;
        }

        .inline-link {
          color: var(--color-primary);
          font-weight: 600;
          border-bottom: 1px dashed var(--color-primary-light);
          transition: all var(--transition);
        }

        .inline-link:hover {
          color: var(--color-primary-dark);
          border-bottom-style: solid;
        }

        .content-divider {
          height: 1px;
          background: linear-gradient(to right, var(--color-border), rgba(232, 224, 227, 0.2));
          margin: 40px 0;
        }

        /* Custom Lists */
        .custom-list {
          list-style: none;
          padding: 0;
          margin-bottom: 20px;
        }

        .custom-list li {
          position: relative;
          padding-left: 24px;
          margin-bottom: 14px;
          color: var(--color-text-dark);
        }

        .custom-list li:last-child {
          margin-bottom: 0;
        }

        /* Bullet List Style */
        .custom-list.bullets li::before {
          content: "•";
          position: absolute;
          left: 6px;
          color: var(--color-primary);
          font-weight: bold;
          font-size: 1.2rem;
          top: -2px;
        }

        /* Checkmarks Style */
        .custom-list.checkmarks li::before {
          content: "✓";
          position: absolute;
          left: 4px;
          color: var(--color-success);
          font-weight: bold;
          font-size: 0.9rem;
          top: 1px;
        }

        .custom-list li strong {
          color: var(--color-dark);
        }

        /* Special Alert/Note Cards */
        .note-card {
          padding: 20px;
          background-color: #FFFDF9;
          border: 1px solid #FFE8C5;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
          font-size: 0.95rem;
        }

        .note-card.warning {
          background-color: #FFF9F9;
          border-color: #FFD2D2;
        }

        .note-card strong {
          display: block;
          margin-bottom: 6px;
          color: var(--color-warning);
        }

        .note-card.warning strong {
          color: var(--color-error);
        }

        .alert-card {
          padding: 20px;
          border-radius: var(--radius-md);
          margin: 24px 0;
          border-left: 4px solid;
          font-size: 0.95rem;
        }

        .alert-card.info {
          background-color: #F4F8FD;
          border-color: var(--color-info);
          border-left-color: var(--color-info);
        }

        .alert-title {
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--color-dark);
        }

        /* Contact Card Widget */
        .contact-card {
          margin-top: 24px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .contact-card-header {
          background: linear-gradient(135deg, var(--color-secondary) 0%, #FFF5F7 100%);
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--color-border);
        }

        .avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--color-primary);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .contact-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-dark);
          margin: 0;
        }

        .contact-title {
          font-size: 0.8rem;
          color: var(--color-text-medium);
          margin: 0;
          font-weight: 500;
        }

        .contact-card-body {
          padding: 24px;
          background: white;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .contact-item-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .contact-icon {
          color: var(--color-primary);
          margin-top: 3px;
          flex-shrink: 0;
        }

        .contact-label {
          display: block;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          color: var(--color-text-light);
          margin-bottom: 2px;
        }

        .contact-value {
          font-size: 0.9rem;
          color: var(--color-text-dark);
          font-weight: 500;
        }

        .contact-value-link {
          font-size: 0.9rem;
          color: var(--color-primary);
          font-weight: 600;
          transition: color var(--transition);
        }

        .contact-value-link:hover {
          color: var(--color-primary-dark);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .terms-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .terms-sidebar-column {
            display: none;
          }

          .terms-content-column {
            padding: 30px;
          }
        }

        @media (max-width: 768px) {
          .terms-header {
            padding: 60px 0 40px;
          }

          .metadata-row {
            flex-direction: column;
            gap: 10px;
            padding: 14px 20px;
            border-radius: var(--radius-lg);
          }

          .metadata-divider {
            display: none;
          }

          .terms-content-column {
            padding: 24px 16px;
            border-radius: var(--radius-md);
          }

          .section-heading {
            font-size: 1.35rem;
            margin-bottom: 16px;
          }

          .contact-card-header {
            padding: 16px;
          }

          .contact-card-body {
            padding: 16px;
            gap: 14px;
          }
        }
      `}</style>
    </div>
  );
}
