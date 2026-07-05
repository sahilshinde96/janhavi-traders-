import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Calendar, Clock, ChevronRight, HelpCircle, Package, RefreshCw } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', title: 'Overview' },
  { id: 'open-box', title: '1. Open Box Delivery' },
  { id: 'cancellation', title: '2. Order Cancellation' },
  { id: 'eligibility', title: '3. Return Eligibility' },
  { id: 'refunds', title: '4. Refund Architecture' },
  { id: 'wholesale', title: '5. Wholesale & B2B' },
  { id: 'support', title: '6. Support & Contact' },
  { id: 'changes', title: '7. Policy Changes' },
];

export default function ReturnPolicy() {
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
    <div className="returns-page-wrapper">
      {/* Background decoration */}
      <div className="bg-decor-1"></div>
      <div className="bg-decor-2"></div>

      {/* Header Banner */}
      <header className="returns-header">
        <div className="container header-container">
          <div className="badge-wrapper animate-fade-in">
            <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
              <Package size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Order Returns & Cancellations
            </span>
          </div>
          <h1 className="returns-title animate-slide-up">Return & Cancellation Policy</h1>
          <p className="returns-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Exclusive Cash on Delivery (COD) model backed by a mandatory Open Box Delivery framework.
          </p>
          <div className="metadata-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="metadata-item">
              <Calendar size={14} className="meta-icon" />
              <span><strong>Effective Date:</strong> June 11, 2026</span>
            </div>
            <div className="metadata-divider"></div>
            <div className="metadata-item">
              <ShieldCheck size={14} className="meta-icon" />
              <span><strong>Operational Model:</strong> Open Box COD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <div className="container main-content-container">
        <div className="returns-grid">
          
          {/* Table of contents sidebar */}
          <aside className="returns-sidebar-column">
            <div className="returns-sidebar-card">
              <div className="sidebar-header">
                <HelpCircle size={18} className="sidebar-header-icon" />
                <h3>Policy Sections</h3>
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

          {/* Main Text Content */}
          <main className="returns-content-column">
            
            {/* Overview */}
            <section id="overview" className="policy-section">
              <h2 className="section-heading">Overview</h2>
              <div className="section-body">
                <p>
                  This Return & Cancellation Policy (<strong>"Policy"</strong>) governs all purchase transactions made through the website <a href="https://www.janhavitraders.com" target="_blank" rel="noopener noreferrer" className="inline-link">www.janhavitraders.com</a> (the <strong>"Platform"</strong>) operated by <strong>BLUSHH</strong>, a partnership firm registered under the Indian Partnership Act, 1932, based in Maharashtra, India.
                </p>
                <p>
                  To protect our consumers and maintain strict hygiene standards for cosmetic and personal care products, BLUSHH operates on an <strong>Exclusive Cash on Delivery (COD) model</strong> backed by a mandatory <strong>Open Box Delivery framework</strong>. This Policy applies to both retail customers and wholesale / B2B buyers. By completing a purchase on the Platform, you agree to be bound by the terms of this Policy.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 1: Mandatory Open Box Delivery Policy */}
            <section id="open-box" className="policy-section">
              <h2 className="section-heading">1. Mandatory Open Box Delivery Policy</h2>
              <div className="section-body">
                <p>
                  To ensure absolute transparency, all orders shipped via <a href="https://www.janhavitraders.com" className="inline-link">www.janhavitraders.com</a> are fulfilled via Open Box Delivery.
                </p>
                
                <ul className="custom-list checkmarks">
                  <li>
                    <strong>The Inspection Process:</strong> At the time of delivery, the customer must open the outer shipping package and inspect the items inside in the presence of our logistics delivery partner before handing over the cash payment.
                  </li>
                  <li>
                    <strong>Doorstep Rejection:</strong> If you notice that a product is physically damaged, leaking, tampered with, or if a wrong variant/shade or incorrect item has been brought to you, you have the right to reject the shipment at the doorstep immediately.
                  </li>
                  <li>
                    <strong>Financial Settlement:</strong> Since our platform is strictly COD, if you reject the package at the doorstep, no transaction occurs. You are not required to pay any cash, and no refund processing is necessary.
                  </li>
                  <li>
                    <strong>Post-Acceptance Waiver:</strong> Once you inspect the package, accept it, and hand over the cash to the courier partner, you explicitly waive the right to claim returns or refunds based on transit damage, physical breakage, cosmetic leakage, or an incomplete/missing item mismatch later.
                  </li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 2: Order Cancellation Policy */}
            <section id="cancellation" className="policy-section">
              <h2 className="section-heading">2. Order Cancellation Policy</h2>
              <div className="section-body">
                <p>
                  Because BLUSHH operates exclusively on a Cash on Delivery (COD) model, no advance digital payments are collected at checkout. Consequently, customers maintain the flexibility to cancel an order at any stage of the fulfillment process without incurring any cancellation fees or financial penalties.
                </p>
                
                <div className="sub-sections-grid">
                  <div className="sub-section-card">
                    <span className="sub-section-num">2.1</span>
                    <h4>Cancellation Before Dispatch</h4>
                    <p>You can cancel your order at any time before it leaves our warehouse facility. To cancel, navigate to the 'My Orders' section on your user dashboard and click 'Cancel Order', or email us directly at <a href="mailto:janhavitraderss@gmail.com" className="inline-link">janhavitraderss@gmail.com</a> with your Order ID.</p>
                  </div>

                  <div className="sub-section-card">
                    <span className="sub-section-num">2.2</span>
                    <h4>Cancellation In-Transit / After Dispatch</h4>
                    <p>If your order has already been dispatched and is currently in transit with our logistics partner, it cannot be recalled electronically through the system. In this scenario, you may simply wait for the delivery agent to arrive at your address and inform them that you wish to cancel the order.</p>
                  </div>

                  <div className="sub-section-card">
                    <span className="sub-section-num">2.3</span>
                    <h4>Cancellation at the Doorstep</h4>
                    <p>You can cancel the entire order right at your doorstep during the mandatory Open Box Delivery inspection. If you change your mind or no longer require the items, simply refuse to accept the package from the delivery rider.</p>
                  </div>

                  <div className="sub-section-card">
                    <span className="sub-section-num">2.4</span>
                    <h4>Financial Implications</h4>
                    <p>Since no advance payments are taken, doorstep or transit cancellations carry a net-zero transaction volume. You are not required to hand over any cash to the delivery rider, and no refund processing workflows are triggered.</p>
                  </div>
                </div>

                <div className="alert-card info" style={{ marginTop: 24 }}>
                  <div className="alert-title">📢 2.5 Cancellation by BLUSHH</div>
                  <p style={{ margin: 0 }}>
                    We reserve the right to automatically cancel any order if an item is completely out of stock, if the delivery address provided is unreachable by our courier network, or if a critical pricing glitch occurs on the Platform. No liability or refund obligations apply to such cancellations.
                  </p>
                </div>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 3: Post-Delivery Return Eligibility (Hidden Defects Only) */}
            <section id="eligibility" className="policy-section">
              <h2 className="section-heading">3. Post-Delivery Return Eligibility (Hidden Defects Only)</h2>
              <div className="section-body">
                <p>
                  Because open box checks solve issues with visible damage, post-delivery return requests are strictly limited to <strong>hidden anomalies</strong> that could not be caught at the doorstep. To report these issues, the customer must reach out to our official support email (<a href="mailto:janhavitraderss@gmail.com" className="inline-link">janhavitraderss@gmail.com</a>) within 24 hours of delivery.
                </p>

                {/* Eligibility Table */}
                <div className="table-responsive">
                  <table className="eligibility-table">
                    <thead>
                      <tr>
                        <th>Issue Type</th>
                        <th>Eligible Window</th>
                        <th>Product Condition Required</th>
                        <th>Ultimate Resolution</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-semibold">Manufacturing Defect</td>
                        <td>Within 24 hours of delivery</td>
                        <td>Unused, inside original brand box</td>
                        <td><span className="badge badge-purple" style={{ textTransform: 'none', fontSize: '0.72rem' }}>Free Replacement or Full Refund</span></td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Passed Product Expiry</td>
                        <td>Within 24 hours of delivery</td>
                        <td>Unused, batch details unaltered</td>
                        <td><span className="badge badge-purple" style={{ textTransform: 'none', fontSize: '0.72rem' }}>Full Refund or Free Replacement</span></td>
                      </tr>
                      <tr className="non-eligible-row">
                        <td className="font-semibold">Change of Mind / Not Liked</td>
                        <td className="text-red font-semibold">NOT ELIGIBLE</td>
                        <td>—</td>
                        <td className="text-red font-semibold">No returns accepted</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="note-card warning" style={{ marginTop: 28 }}>
                  <strong>⚠️ Strictly Non-Returnable Items:</strong>
                  <ul className="custom-list bullets" style={{ margin: 0, marginTop: 10 }}>
                    <li>Products that have been unsealed, sampled, or had their protective shrink wrap altered.</li>
                    <li>Products returned without an authorized Return Authorisation Number (RAN) issued by our email support channel.</li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 4: Refund Architecture for Approved Hidden Defects */}
            <section id="refunds" className="policy-section">
              <h2 className="section-heading">4. Refund Architecture for Approved Hidden Defects</h2>
              <div className="section-body">
                <p>
                  In the event that an internal manufacturing defect or product expiry is validated after acceptance, refunds are governed by the following rules:
                </p>

                <div className="refund-methods">
                  <div className="refund-method-card">
                    <span className="refund-icon">💵</span>
                    <h4>Cash Refunds</h4>
                    <p>If a cash refund is approved for an accepted order, it will be handed over during a reverse pickup schedule handled by our local logistics network, or settled manually through our central cash management system.</p>
                  </div>
                  <div className="refund-method-card">
                    <span className="refund-icon">🏦</span>
                    <h4>Online / Bank Refunds</h4>
                    <p>Customers seeking an online digital refund must email their exact Bank Account Name, Number, IFSC Code, and Bank Name to <a href="mailto:janhavitraderss@gmail.com" className="inline-link">janhavitraderss@gmail.com</a>. Online refunds will be directly executed via online bank transfer (NEFT/IMPS) into the customer's account within 5–7 business days of inspection clearance.</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 5: Wholesale / B2B Dynamic Policies */}
            <section id="wholesale" className="policy-section">
              <h2 className="section-heading">5. Wholesale / B2B Dynamic Policies</h2>
              <div className="section-body">
                <p>
                  For commercial bulk or wholesale transactions handled through <a href="https://www.janhavitraders.com" className="inline-link">www.janhavitraders.com</a>, Open Box checks remain fully mandatory.
                </p>
                <div className="alert-card info">
                  <div className="alert-title">📦 Commercial Dispatch Protocol</div>
                  <p style={{ margin: 0 }}>
                    Any product discrepancies must be listed on the buyer's official commercial letterhead and validated immediately by the delivery handler at the doorstep. <strong>No post-delivery claims for volume shortages or breakage will be entertained</strong> after the bulk shipment has been accepted and paid for.
                  </p>
                </div>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 6: Contact & Support Escalation */}
            <section id="support" className="policy-section">
              <h2 className="section-heading">6. Contact & Support Escalation</h2>
              <div className="section-body">
                <p>
                  For queries related to order timelines, delivery rejections, or post-delivery defect assistance, contact us exclusively through our support channels:
                </p>

                {/* Contact Card */}
                <div className="contact-card">
                  <div className="contact-card-header">
                    <div className="avatar-placeholder">JT</div>
                    <div>
                      <h4 className="contact-name">BLUSHH Support</h4>
                      <p className="contact-title">Help & Returns Department</p>
                    </div>
                  </div>
                  <div className="contact-card-body">
                    <div className="contact-item-row">
                      <Mail size={16} className="contact-icon" />
                      <div>
                        <span className="contact-label">Primary Support Email</span>
                        <a href="mailto:janhavitraderss@gmail.com" className="contact-value-link">janhavitraderss@gmail.com</a>
                      </div>
                    </div>
                    <div className="contact-item-row">
                      <Phone size={16} className="contact-icon" />
                      <div>
                        <span className="contact-label">Official Phone / WhatsApp</span>
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
                  <strong>Grievance Officer Redressal Escalation:</strong> Complaints that are not resolved at the support level can be escalated directly to our Grievance Officer, <strong>Rohit Jaiswar</strong>, at the contact details published within our official Privacy Policy framework.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Section 7: Changes to This Policy */}
            <section id="changes" className="policy-section">
              <h2 className="section-heading">7. Changes to This Policy</h2>
              <div className="section-body">
                <p>
                  BLUSHH reserves the right to revise, amend, or update this Return & Cancellation Policy at any time. All updates will be published on the Platform with a revised effective date.
                </p>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* Styled JSX Scoped Styles */}
      <style>{`
        .returns-page-wrapper {
          position: relative;
          background-color: var(--color-bg);
          color: var(--color-text-dark);
          font-family: var(--font-primary);
          line-height: 1.7;
          overflow-x: hidden;
          padding-bottom: 80px;
        }

        /* Ambient background glow elements */
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
          top: 40%;
          right: -10%;
          width: 45vw;
          height: 45vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Banner styling */
        .returns-header {
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

        .returns-title {
          font-family: var(--font-display);
          font-size: clamp(2.3rem, 5vw, 3.6rem);
          font-weight: 700;
          color: var(--color-dark);
          line-height: 1.1;
          margin-bottom: 20px;
        }

        .returns-subtitle {
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

        /* Grid Structure */
        .main-content-container {
          position: relative;
          z-index: 1;
          margin-top: 50px;
        }

        .returns-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
        }

        /* Sidebar navigation */
        .returns-sidebar-column {
          position: relative;
        }

        .returns-sidebar-card {
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
        .returns-sidebar-card::-webkit-scrollbar {
          width: 4px;
        }
        .returns-sidebar-card::-webkit-scrollbar-thumb {
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

        /* Main Policy Text Card */
        .returns-content-column {
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

        /* Cancellation layout cards */
        .sub-sections-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 24px;
        }

        .sub-section-card {
          padding: 24px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background-color: #FAF6F8;
          position: relative;
          overflow: hidden;
        }

        .sub-section-num {
          position: absolute;
          top: 12px;
          right: 16px;
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: rgba(244,137,147, 0.08);
          user-select: none;
        }

        .sub-section-card h4 {
          font-weight: 700;
          color: var(--color-dark);
          margin-bottom: 10px;
          font-size: 0.95rem;
        }

        .sub-section-card p {
          font-size: 0.85rem;
          color: var(--color-text-medium);
          margin: 0;
          line-height: 1.6;
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

        /* Tables styling */
        .table-responsive {
          overflow-x: auto;
          margin-top: 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }

        .eligibility-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .eligibility-table th {
          background-color: var(--color-secondary);
          color: var(--color-primary-dark);
          font-weight: 700;
          padding: 14px 18px;
          border-bottom: 1px solid var(--color-border);
        }

        .eligibility-table td {
          padding: 14px 18px;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-dark);
        }

        .eligibility-table tr:last-child td {
          border-bottom: none;
        }

        .eligibility-table tr:nth-child(even) {
          background-color: #FFFDFE;
        }

        .eligibility-table tr.non-eligible-row {
          background-color: #FFF5F5;
        }

        .font-semibold {
          font-weight: 600;
        }

        .text-red {
          color: var(--color-error);
        }

        /* Alerts and Notes */
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

        /* Refund Architecture grid cards */
        .refund-methods {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 24px;
        }

        .refund-method-card {
          padding: 24px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: white;
          box-shadow: var(--shadow-sm);
        }

        .refund-icon {
          font-size: 2.2rem;
          margin-bottom: 12px;
          display: block;
        }

        .refund-method-card h4 {
          font-weight: 700;
          color: var(--color-dark);
          font-size: 1rem;
          margin-bottom: 8px;
        }

        .refund-method-card p {
          font-size: 0.85rem;
          color: var(--color-text-medium);
          margin: 0;
          line-height: 1.6;
        }

        /* Contact Details Widget */
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
          .returns-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .returns-sidebar-column {
            display: none;
          }

          .returns-content-column {
            padding: 30px;
          }
        }

        @media (max-width: 768px) {
          .returns-header {
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

          .returns-content-column {
            padding: 24px 16px;
            border-radius: var(--radius-md);
          }

          .section-heading {
            font-size: 1.35rem;
            margin-bottom: 16px;
          }

          .sub-sections-grid, .refund-methods {
            grid-template-columns: 1fr;
            gap: 16px;
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
