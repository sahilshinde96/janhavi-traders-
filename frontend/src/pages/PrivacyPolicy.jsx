import { useState, useEffect, useRef } from 'react';
import { Shield, Mail, Phone, MapPin, Calendar, Clock, ChevronRight, FileText } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', title: 'Overview' },
  { id: 'definitions', title: '1. Definitions' },
  { id: 'collection', title: '2. Collection of Information' },
  { id: 'spdi', title: '3. SPDI Information' },
  { id: 'use', title: '4. Use of Information' },
  { id: 'cookies', title: '5. Cookies' },
  { id: 'sharing', title: '6. Sharing of Personal Info' },
  { id: 'links', title: '7. Links to Other Sites' },
  { id: 'security', title: '8. Security Practices' },
  { id: 'optout', title: '9. Choice / Opt-Out' },
  { id: 'consent', title: '10. Consent & Retention' },
  { id: 'territory', title: '11. Territory Restrictions' },
  { id: 'disposal', title: '12. Disposal of Data' },
  { id: 'grievance', title: '13. Grievance Officer' },
  { id: 'severability', title: '14. Severability' },
  { id: 'governing-law', title: '15. Governing Law' },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('overview');
  const sectionRefs = useRef({});

  useEffect(() => {
    window.scrollTo(0, 0);

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px', // Trigger when section is in upper-middle of viewport
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
      const offset = 90; // Adjust for sticky header
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
    <div className="privacy-page-wrapper">
      {/* Dynamic Background Accents */}
      <div className="bg-accent-1"></div>
      <div className="bg-accent-2"></div>

      {/* Header Banner */}
      <header className="privacy-header">
        <div className="container header-container">
          <div className="badge-wrapper animate-fade-in">
            <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
              <Shield size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Legal & Compliance
            </span>
          </div>
          <h1 className="privacy-title animate-slide-up">Privacy Policy</h1>
          <p className="privacy-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
            We value the trust you place in us. Please read this Privacy Policy carefully to understand our information-gathering and data-processing practices.
          </p>
          <div className="metadata-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="metadata-item">
              <Calendar size={14} className="meta-icon" />
              <span><strong>Effective Date:</strong> June 11, 2026</span>
            </div>
            <div className="metadata-divider"></div>
            <div className="metadata-item">
              <Clock size={14} className="meta-icon" />
              <span><strong>Last Updated:</strong> June 11, 2026</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="container main-content-container">
        <div className="privacy-grid">
          
          {/* Sticky Sidebar */}
          <aside className="privacy-sidebar-column">
            <div className="privacy-sidebar-card">
              <div className="sidebar-header">
                <FileText size={18} className="sidebar-header-icon" />
                <h3>Table of Contents</h3>
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

          {/* Policy Text Column */}
          <main className="privacy-content-column">
            
            {/* Overview Section */}
            <section id="overview" className="policy-section">
              <h2 className="section-heading">Overview</h2>
              <div className="section-body">
                <p>
                  The website <a href="https://www.janhavitraders.com" target="_blank" rel="noopener noreferrer" className="inline-link">www.janhavitraders.com</a> (hereinafter referred to as the <strong>"Platform"</strong>) is owned and operated by <strong>BLUSHH</strong>, a partnership firm registered under the Indian Partnership Act, 1932, engaged in the wholesale and retail supply of genuine cosmetic and personal care products, including brands such as Dermalogica, Mamaearth, Nivea, and other premium beauty labels.
                </p>
                <p>
                  Our principal place of business is located at:
                  <span className="address-highlight">
                    <MapPin size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--color-primary)', verticalAlign: 'text-bottom' }} />
                    Shop no 2, Anjanabai Appartment, Malangad Rd, near dinkar bhane nagar, Pisavli Village, Kalyan East, Kalyan, Maharashtra 421306
                  </span>
                  (Hereinafter referred to as the <strong>"Company"</strong>, <strong>"We"</strong>, <strong>"Us"</strong>, or <strong>"Our"</strong>).
                </p>
                <p>
                  This Privacy Policy is formulated in accordance with the Information Technology Act, 2000 (<strong>"IT Act"</strong>) read with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (<strong>"IT Rules"</strong>), and the Digital Personal Data Protection Act, 2023 and rules made thereunder, including any amendments. This Privacy Policy does not require any physical, electronic, or digital signature and is to be read together with the Terms and Conditions and all other policies listed on the Platform.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Definitions Section */}
            <section id="definitions" className="policy-section">
              <h2 className="section-heading">1. Definitions</h2>
              <div className="section-body">
                <ul className="custom-list">
                  <li>
                    <strong>"We", "Our", and "Us":</strong> Refers to BLUSHH, its registered partners, employees, agents, and authorised representatives.
                  </li>
                  <li>
                    <strong>"You", "Your", "Yourself", and "User":</strong> Refers to natural and legal individuals who access, browse, or transact on the Platform and avail Services for purchasing cosmetic, skincare, haircare, and personal care products.
                  </li>
                  <li>
                    <strong>"Personal Data":</strong> Refers to any personally identifiable information that We may collect from You.
                  </li>
                  <li>
                    <strong>"Third Parties":</strong> Refers to any application, web service, code repository, company, or individual apart from the User and the creator of the Platform.
                  </li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Collection Section */}
            <section id="collection" className="policy-section">
              <h2 className="section-heading">2. Collection of Information</h2>
              <div className="section-body">
                <p>
                  We collect a variety of information which reasonably allows you to be identified (including email address, name, phone number, shipping and billing address) from You when you set up an account or engage with checkout operations on the Platform.
                </p>
                <div className="note-card">
                  <strong>💡 Guest Browsing</strong>
                  <p style={{ margin: 0, marginTop: 4 }}>
                    While you can browse major catalog blocks of our site without being a registered member, certain core activities (such as placing an order or completing a checkout) do require registration. We do use Your contact information to send you offers based on Your previous orders and your beauty preferences.
                  </p>
                </div>
                <p>
                  The Platform endeavors to keep its records updated and accurate with your latest information. You shall be responsible to ensure that the information or data you provide from time to time is correct, current, and up-to-date and that you have all the rights, permissions, and consents to provide such data.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* SPDI Section */}
            <section id="spdi" className="policy-section">
              <h2 className="section-heading">3. Personal Information and Sensitive Personal Data or Information (SPDI)</h2>
              <div className="section-body">
                <p>
                  The IT Act and the IT Rules define personal information as any information that relates to a natural person which, either directly or indirectly, in combination with other information available or likely to be available with a body corporate, is capable of identifying such person.
                </p>
                <div className="alert-card info">
                  <div className="alert-title">🔒 COD-Exclusive Operations</div>
                  <p style={{ margin: 0 }}>
                    As our Platform operates exclusively via Cash on Delivery (COD), <strong>We do not collect, process, or store sensitive financial information</strong> such as bank account credentials, credit card numbers, debit card numbers, or UPI transactional PINs.
                  </p>
                </div>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Use of Information Section */}
            <section id="use" className="policy-section">
              <h2 className="section-heading">4. Use of Personal Information and Sensitive Information</h2>
              <div className="section-body">
                <p>
                  We use personal information to provide the services you request. To the extent We use Your personal information to market to you, We will provide you the ability to opt-out of such uses. We use Your personal information to:
                </p>
                <ul className="custom-list checkmarks">
                  <li>Process orders, compile cart statuses, calculate standard retail taxes (CGST/SGST), and coordinate delivery pathways.</li>
                  <li>Resolve technical disputes and troubleshoot system bugs.</li>
                  <li>Help promote a safe e-commerce application layer and protect us against web exploits, fraud, and other criminal activity.</li>
                  <li>Inform you about online and offline offers, trending inventory arrivals, and brand updates.</li>
                  <li>Identify and use Your IP address to help diagnose performance issues with our servers and to administer our backend modules.</li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Cookies Section */}
            <section id="cookies" className="policy-section">
              <h2 className="section-heading">5. Cookies</h2>
              <div className="section-body">
                <p>
                  A "cookie" is a small piece of data stored by a Web server on a Web browser so it can be later read back from that browser. Cookies are useful for enabling the browser to remember stateful choices specific to a given user (such as persisting items added to a shopping cart).
                </p>
                <p>
                  The Platform places both permanent and temporary cookies in Your computer's storage media. The Platform’s cookies do not contain any of Your unencrypted personal information.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Sharing Section */}
            <section id="sharing" className="policy-section">
              <h2 className="section-heading">6. Sharing of Personal Information</h2>
              <div className="section-body">
                <p>
                  We may share personal information with our other corporate components and affiliates to help detect and prevent identity theft, fraud, and other potentially illegal acts; correlate related or multiple accounts to prevent abuse of our services; and to facilitate joint or co-branded services that you request.
                </p>
                <p>
                  We may disclose personal information if required to do so by law or in the good faith belief that such disclosure is reasonably necessary to respond to subpoenas, court orders, or other legal processes. We may disclose personal information to law enforcement offices or third-party rights owners in the good faith belief that such disclosure is necessary to enforce our Terms or Privacy Policy.
                </p>
                <p>
                  We disclose personal data to Third Party service providers with whom We have executed appropriate data-sharing contracts, preventing them from utilizing your information outside the specified scope. The reasons for disclosing data with integrated third-party frameworks on <a href="https://www.janhavitraders.com" className="inline-link">www.janhavitraders.com</a> include:
                </p>
                <ul className="custom-list bullets">
                  <li><strong>Analytics Engines:</strong> To track application stability, route responses, and user flows.</li>
                  <li><strong>Authentication Hooks:</strong> To facilitate seamless user single-sign-on (SSO).</li>
                  <li><strong>Logistics & Courier Vendors:</strong> To fulfill shipping pipelines, pass delivery addresses, and facilitate cash collection upon delivery within our stated window.</li>
                </ul>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Links Section */}
            <section id="links" className="policy-section">
              <h2 className="section-heading">7. Links to Other Sites</h2>
              <div className="section-body">
                <p>
                  Our site links to other websites that may collect personally identifiable information about you. BLUSHH is not responsible for the privacy practices or the content of those linked websites.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Security Section */}
            <section id="security" className="policy-section">
              <h2 className="section-heading">8. Information Security Practices and Procedures</h2>
              <div className="section-body">
                <p>
                  The Company endeavors to maintain rigorous physical, technical, and procedural safeguards appropriate to protect Your personal information against loss, misuse, copying, damage, or unauthorized access.
                </p>
                <div className="alert-card success">
                  <div className="alert-title">🔒 SSL/HTTPS Encryption</div>
                  <p style={{ margin: 0 }}>
                    Our site utilizes secure configurations (SSL/HTTPS encryption layer) for all traffic traversing the client application and API routing points. Once Your information is in our possession, We adhere to strict security guidelines protecting it against unauthorized database intrusions.
                  </p>
                </div>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Opt-Out Section */}
            <section id="optout" className="policy-section">
              <h2 className="section-heading">9. Choice/Opt-Out</h2>
              <div className="section-body">
                <p>
                  The Platform provides all users with the opportunity to opt-out of receiving non-essential (promotional, marketing-related) communications from us.
                </p>
                <p>
                  If you want to remove Your contact information from our active communication files and newsletters, please submit an unsubscribe request through the options provided in our system footer.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Consent Section */}
            <section id="consent" className="policy-section">
              <h2 className="section-heading">10. Consent and Data Retention</h2>
              <div className="section-body">
                <p>
                  By visiting our Platform or by providing Your information, you consent to the collection, use, storage, disclosure, and otherwise processing of Your information on the Platform in accordance with this Privacy Policy.
                </p>
                <p>
                  You have an option to withdraw Your consent that you have already provided by writing to the Grievance Officer at the contact information provided below. Please mention <em>“Withdrawal of consent for processing personal information”</em> in Your subject line.
                </p>
                <div className="note-card warning">
                  <strong>⚠️ Important Notice</strong>
                  <p style={{ margin: 0, marginTop: 4 }}>
                    Please note that withdrawal of consent will not be retrospective and will be in accordance with the terms of this Privacy Policy and applicable laws. In the event you withdraw consent, We reserve the right to restrict or deny the provision of our retail services for which We consider such information to be structurally necessary.
                  </p>
                </div>
                <p>
                  We retain Your personal information on our systems for a period no longer than is required for the purpose for which it was collected or as required under any applicable legal, statutory, or tax audit frameworks.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Territory Section */}
            <section id="territory" className="policy-section">
              <h2 className="section-heading">11. Territory & Jurisdictional Restrictions</h2>
              <div className="section-body">
                <p>
                  Please note We do not offer any product/service under this Platform outside India. By visiting the Platform or providing Your information, you expressly agree to be bound by this Privacy Policy and agree to be governed by the laws of India, including but not limited to the laws applicable to data protection and privacy. If you do not agree, please do not use or access our Platform.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Disposal Section */}
            <section id="disposal" className="policy-section">
              <h2 className="section-heading">12. Disposal of Data</h2>
              <div className="section-body">
                <p>
                  We shall take reasonable steps to delete or permanently de-identify Personal Data that is no longer needed, and stop sharing data to our Third Party systems when you request its deletion, withdraw consent, or close your account.
                </p>
                <p>
                  Even if We clear Your active profile data blocks, information may persist on secure archival backups strictly for sales audits, tax compliance, or regulatory legal purposes. To request a review, correction, portability, or updates to your data, please contact <a href="mailto:janhavitraderss@gmail.com" className="inline-link">janhavitraderss@gmail.com</a>.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Grievance Officer Section */}
            <section id="grievance" className="policy-section">
              <h2 className="section-heading">13. Grievance Officer</h2>
              <div className="section-body">
                <p>
                  In accordance with the Information Technology Act, 2000, and the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Digital Personal Data Protection Act, 2023, BLUSHH has appointed a Grievance Officer to address concerns related to this Privacy Policy and the handling of your Personal Data. All grievances, queries, and complaints shall be directed to:
                </p>
                
                {/* Contact Card Widget */}
                <div className="contact-card">
                  <div className="contact-card-header">
                    <div className="avatar-placeholder">RJ</div>
                    <div>
                      <h4 className="contact-name">Rohit Jaiswar</h4>
                      <p className="contact-title">Grievance Officer, BLUSHH</p>
                    </div>
                  </div>
                  <div className="contact-card-body">
                    <div className="contact-item-row">
                      <Mail size={16} className="contact-icon" />
                      <div>
                        <span className="contact-label">Email</span>
                        <a href="mailto:janhavitraderss@gmail.com" className="contact-value-link">janhavitraderss@gmail.com</a>
                      </div>
                    </div>
                    <div className="contact-item-row">
                      <Phone size={16} className="contact-icon" />
                      <div>
                        <span className="contact-label">Phone</span>
                        <span className="contact-value">+91 84338 93228 / +91 89287 62528</span>
                      </div>
                    </div>
                    <div className="contact-item-row">
                      <MapPin size={16} className="contact-icon" />
                      <div>
                        <span className="contact-label">Address</span>
                        <span className="contact-value">Shop no 2, Anjanabai Appartment, Malangad Rd, near dinkar bhane nagar, Pisavli Village, Kalyan East, Kalyan, Maharashtra 421306</span>
                      </div>
                    </div>
                    <div className="contact-item-row">
                      <Clock size={16} className="contact-icon" />
                      <div>
                        <span className="contact-label">Working Hours</span>
                        <span className="contact-value">Monday to Saturday, 10:00 AM – 6:00 PM IST</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p style={{ marginTop: 20 }}>
                  We shall acknowledge your grievance within 48 hours of receipt and endeavour to resolve it within 30 days from the date of receipt, in accordance with applicable law.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Severability Section */}
            <section id="severability" className="policy-section">
              <h2 className="section-heading">14. Severability</h2>
              <div className="section-body">
                <p>
                  Each paragraph of this privacy policy shall be separate and independent from all other paragraphs herein. The decision or declaration that one or more of the paragraphs are null and void shall have no effect on the remaining paragraphs of this privacy policy.
                </p>
              </div>
            </section>

            <div className="content-divider"></div>

            {/* Governing Law Section */}
            <section id="governing-law" className="policy-section">
              <h2 className="section-heading">15. Governing Law and Dispute Resolution</h2>
              <div className="section-body">
                <p>
                  This Privacy Policy shall be governed by and construed in accordance with the laws of the Republic of India. Any dispute, controversy, or claim arising out of or in connection with this Privacy Policy shall be subject to the exclusive jurisdiction of the courts of competent jurisdiction located in Kalyan or Mumbai, Maharashtra, India.
                </p>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* Styled JSX for scoped premium styles */}
      <style>{`
        .privacy-page-wrapper {
          position: relative;
          background-color: var(--color-bg);
          color: var(--color-text-dark);
          font-family: var(--font-primary);
          line-height: 1.7;
          overflow-x: hidden;
          padding-bottom: 80px;
        }

        /* Ambient glowing circles */
        .bg-accent-1 {
          position: absolute;
          top: 0;
          left: -10%;
          width: 50vw;
          height: 50vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,73,106,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .bg-accent-2 {
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
        .privacy-header {
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

        .privacy-title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 3.8rem);
          font-weight: 700;
          color: var(--color-dark);
          line-height: 1.1;
          margin-bottom: 20px;
        }

        .privacy-subtitle {
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

        .privacy-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
        }

        /* Sidebar Styling */
        .privacy-sidebar-column {
          position: relative;
        }

        .privacy-sidebar-card {
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
        .privacy-sidebar-card::-webkit-scrollbar {
          width: 4px;
        }
        .privacy-sidebar-card::-webkit-scrollbar-thumb {
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
        .privacy-content-column {
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

        .address-highlight {
          display: block;
          margin-top: 12px;
          padding: 16px 20px;
          background-color: var(--color-secondary);
          border-left: 3px solid var(--color-primary);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          font-style: italic;
          font-size: 0.95rem;
          color: var(--color-text-dark);
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

        /* Special Alert Cards */
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

        .alert-card.success {
          background-color: var(--color-success-light);
          border-color: #C8E6C9;
          border-left-color: var(--color-success);
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
          .privacy-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .privacy-sidebar-column {
            display: none; /* Hide sidebar list on tablets and mobiles for a cleaner layout */
          }

          .privacy-content-column {
            padding: 30px;
          }
        }

        @media (max-width: 768px) {
          .privacy-header {
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

          .privacy-content-column {
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
