(function () {
  const style = document.createElement('style');
  style.textContent = `
    .legal-modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(2px);
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .legal-modal-backdrop.active {
      display: flex;
    }
    .legal-modal-box {
      background: #fff;
      border-radius: 12px;
      max-width: 680px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      padding: 40px;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .legal-modal-close {
      position: sticky;
      top: 0;
      float: right;
      background: #f1f1f1;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 16px;
    }
    .legal-modal-close:hover { background: #e0e0e0; }
    .legal-modal-box h2 {
      font-size: 1.5rem;
      margin-bottom: 4px;
      color: #1A3C5E;
    }
    .legal-modal-box h3 {
      font-size: 1rem;
      margin: 20px 0 6px;
      color: #1A3C5E;
    }
    .legal-modal-box p, .legal-modal-box li {
      font-size: 0.92rem;
      line-height: 1.7;
      color: #444;
    }
    .legal-modal-box ul {
      padding-left: 20px;
      margin: 8px 0;
    }
    .legal-modal-meta {
      font-size: 0.8rem;
      color: #999;
      margin-bottom: 20px;
      display: block;
    }
    .legal-modal-box table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 0.88rem;
    }
    .legal-modal-box table th,
    .legal-modal-box table td {
      border: 1px solid #e0e0e0;
      padding: 8px 12px;
      text-align: left;
      color: #444;
    }
    .legal-modal-box table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #1A3C5E;
    }
    @media (max-width: 600px) {
      .legal-modal-box { padding: 24px 18px; }
    }
  `;
  document.head.appendChild(style);

  const modals = {
    privacy: {
      title: 'Privacy Policy',
      updated: 'Last updated: 22 May 2026',
      body: `
        <p>AmyServes ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect, use, store, and protect personal information you share with us through our website, WhatsApp, email, or any of our services delivered through our brands Pura-Kle'N and Yourfirm Consults and Integrates Ltd.</p>
        <p>This Policy is designed to align with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and accompanying regulations.</p>
        <h3>1. Information We Collect</h3>
        <ul>
          <li><strong>Contact details</strong> — name, email address, phone number, company name;</li>
          <li><strong>Account details</strong> — login email, hashed password, profile information;</li>
          <li><strong>Service request details</strong> — the service you are enquiring about and any message you send us;</li>
          <li><strong>Technical data</strong> — IP address, browser type, device information, and pages visited;</li>
          <li><strong>Engagement data</strong> — comments, likes, or other interactions on our blog.</li>
        </ul>
        <h3>2. How We Use Your Information</h3>
        <ul>
          <li>Respond to your enquiries and provide quotations;</li>
          <li>Deliver the services you have engaged us for;</li>
          <li>Manage your user account and authenticate you when you log in;</li>
          <li>Send service-related communications;</li>
          <li>Improve our website, content, and service quality;</li>
          <li>Comply with our legal and regulatory obligations.</li>
        </ul>
        <h3>3. Legal Basis for Processing</h3>
        <ul>
          <li><strong>Consent</strong> — when you submit a form or sign up for an account;</li>
          <li><strong>Contractual necessity</strong> — to perform the services you have requested;</li>
          <li><strong>Legitimate interest</strong> — to operate and improve our business;</li>
          <li><strong>Legal obligation</strong> — where required by Nigerian law.</li>
        </ul>
        <h3>4. Sharing Your Information</h3>
        <p>We do not sell your personal data. We may share it with staff and contractors who need it to deliver services; trusted third-party providers (Supabase, Vercel) under appropriate data protection terms; and regulatory authorities where legally required.</p>
        <h3>5. Data Retention</h3>
        <p>Enquiry data is typically retained for 24 months; client service records may be retained for up to 7 years for tax and regulatory purposes.</p>
        <h3>6. Your Rights</h3>
        <ul>
          <li>Access the personal data we hold about you;</li>
          <li>Request correction of inaccurate or incomplete data;</li>
          <li>Request deletion of your data (subject to legal exceptions);</li>
          <li>Withdraw consent at any time;</li>
          <li>Object to or restrict certain types of processing;</li>
          <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC).</li>
        </ul>
        <h3>7. Cookies and Analytics</h3>
        <p>Our website may use cookies to remember your preferences and understand how visitors use the site. You can disable cookies in your browser settings.</p>
        <h3>8. Data Security</h3>
        <p>We use reasonable technical and organisational measures — including HTTPS encryption, secured authentication, and role-based access controls — to protect your data.</p>
        <h3>9. Children's Privacy</h3>
        <p>Our services are not directed at children under 13, and we do not knowingly collect personal data from them.</p>
        <h3>10. Changes to This Policy</h3>
        <p>We may update this Privacy Policy from time to time. The "Last updated" date at the top reflects the latest version.</p>
        <h3>11. Contact Us</h3>
        <ul>
          <li>Email: <a href="mailto:yourfirmci@gmail.com">yourfirmci@gmail.com</a></li>
          <li>WhatsApp: <a href="https://wa.me/2349098104610">+234 909 810 4610</a></li>
          <li>Address: Gwarimpa, Abuja, FCT, Nigeria</li>
        </ul>
      `
    },
    terms: {
      title: 'Terms of Service',
      updated: 'Last updated: 22 May 2026',
      body: `
        <p>Welcome to AmyServes. By accessing or using our website and any related services provided by AmyServes and its brands — Pura-Kle'N and Yourfirm Consults and Integrates Ltd — you agree to be bound by these Terms of Service.</p>
        <h3>1. About Us</h3>
        <p>AmyServes is a business support group based in Abuja, FCT, Nigeria, operating two specialist brands: Pura-Kle'N for professional cleaning and fumigation, and Yourfirm Consults and Integrates Ltd for HR and workforce consulting.</p>
        <h3>2. Use of the Website</h3>
        <p>You may use this website for lawful purposes only. You agree not to:</p>
        <ul>
          <li>Use the website in any way that breaches Nigerian law or any applicable regulation;</li>
          <li>Transmit any material that is defamatory, offensive, or otherwise objectionable;</li>
          <li>Attempt to gain unauthorised access to our systems, accounts, or data;</li>
          <li>Use automated tools to scrape or harvest content without our prior written consent.</li>
        </ul>
        <h3>3. Services and Engagement</h3>
        <p>All services are subject to a separate written service agreement. Information on this website does not constitute a binding service contract or quotation.</p>
        <h3>4. Quotations and Pricing</h3>
        <p>Indicative prices and turnaround times are subject to written confirmation once we have assessed your specific requirements.</p>
        <h3>5. User Accounts</h3>
        <p>You are responsible for keeping your login credentials confidential, providing accurate information, and for all activity under your account. We reserve the right to suspend or terminate accounts that breach these Terms.</p>
        <h3>6. Intellectual Property</h3>
        <p>All content on this website — including text, images, logos, brand names, graphics, and code — is owned by or licensed to AmyServes and is protected under Nigerian and international copyright law.</p>
        <h3>7. Third-Party Links</h3>
        <p>We are not responsible for the content, policies, or practices of any external sites linked from our website.</p>
        <h3>8. Limitation of Liability</h3>
        <p>To the maximum extent permitted by Nigerian law, AmyServes shall not be liable for any indirect, incidental, or consequential losses arising from your use of this website.</p>
        <h3>9. Changes to These Terms</h3>
        <p>We may update these Terms from time to time. Continued use of the website after updates constitutes acceptance of the revised Terms.</p>
        <h3>10. Governing Law</h3>
        <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of the FCT, Abuja.</p>
        <h3>11. Contact</h3>
        <ul>
          <li>Email: <a href="mailto:yourfirmci@gmail.com">yourfirmci@gmail.com</a></li>
          <li>WhatsApp: <a href="https://wa.me/2349098104610">+234 909 810 4610</a></li>
          <li>Address: Gwarimpa, Abuja, FCT, Nigeria</li>
        </ul>
      `
    },
    cookies: {
      title: 'Cookie Policy',
      updated: 'Last updated: 22 May 2026',
      body: `
        <p>This Cookie Policy explains how AmyServes uses cookies and similar technologies on our website. It should be read alongside our Privacy Policy.</p>
        <h3>1. What Are Cookies?</h3>
        <p>Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences, keep you signed in, and understand how you use the site.</p>
        <h3>2. Types of Cookies We Use</h3>
        <table>
          <thead><tr><th>Type</th><th>Purpose</th><th>Examples</th></tr></thead>
          <tbody>
            <tr><td><strong>Essential</strong></td><td>Required for the site to function — e.g., keeping you signed in</td><td>Authentication tokens (Supabase)</td></tr>
            <tr><td><strong>Functional</strong></td><td>Remember your preferences and choices</td><td>Language, theme, dismissed banners</td></tr>
            <tr><td><strong>Analytics</strong></td><td>Help us understand how visitors use the site</td><td>Vercel Analytics, anonymous traffic counters</td></tr>
          </tbody>
        </table>
        <p>We do <strong>not</strong> currently use advertising or third-party tracking cookies.</p>
        <h3>3. Third-Party Cookies</h3>
        <ul>
          <li><strong>Supabase</strong> — for user authentication and account management;</li>
          <li><strong>Vercel</strong> — for hosting and basic usage analytics.</li>
        </ul>
        <h3>4. How to Manage Cookies</h3>
        <p>You can control or delete cookies through your browser settings. Note that disabling essential cookies may prevent parts of the site from working properly.</p>
        <h3>5. Changes to This Policy</h3>
        <p>We may update this Cookie Policy from time to time. The "Last updated" date above reflects the most recent change.</p>
        <h3>6. Contact Us</h3>
        <ul>
          <li>Email: <a href="mailto:yourfirmci@gmail.com">yourfirmci@gmail.com</a></li>
          <li>WhatsApp: <a href="https://wa.me/2349098104610">+234 909 810 4610</a></li>
          <li>Address: Gwarimpa, Abuja, FCT, Nigeria</li>
        </ul>
      `
    }
  };

  const backdrop = document.createElement('div');
  backdrop.className = 'legal-modal-backdrop';
  backdrop.id = 'legalModalBackdrop';
  backdrop.innerHTML = `
    <div class="legal-modal-box" id="legalModalBox">
      <button class="legal-modal-close" id="legalModalClose" aria-label="Close">×</button>
      <h2 id="legalModalTitle"></h2>
      <span class="legal-modal-meta" id="legalModalMeta"></span>
      <div id="legalModalBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);

  function openLegalModal(type) {
    const m = modals[type];
    if (!m) return;
    document.getElementById('legalModalTitle').textContent = m.title;
    document.getElementById('legalModalMeta').textContent = m.updated;
    document.getElementById('legalModalBody').innerHTML = m.body;
    document.getElementById('legalModalBackdrop').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLegalModal() {
    document.getElementById('legalModalBackdrop').classList.remove('active');
    document.body.style.overflow = '';
  }

  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeLegalModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLegalModal();
  });

  document.getElementById('legalModalClose').addEventListener('click', closeLegalModal);

  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '/privacy') { e.preventDefault(); openLegalModal('privacy'); }
    else if (href === '/terms') { e.preventDefault(); openLegalModal('terms'); }
    else if (href === '/cookies') { e.preventDefault(); openLegalModal('cookies'); }
  });

  window.openLegalModal = openLegalModal;
  window.closeLegalModal = closeLegalModal;
})();
