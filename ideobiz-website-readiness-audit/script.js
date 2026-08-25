/**
 * Ideobiz Solutions — Redesigned Interactive Engine
 * Core Logic for dynamic sliders, interactive calculator, live AI/SEO audit simulator,
 * global clocks, modal workflows, and responsive navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeroSlider();
  initHeroCardTilt();
  initAeoAuditSimulator();
  initArchitectureMatrix();
  initServicesTabs();
  initCostCalculator();
  initGlobalClocks();
  initTestimonialsCarousel();
  initProposalModal();
  initQuickContactForm();
  initBackToTop();
  updateCurrentYear();
});

/* ==========================================================================
   1. Navigation & Scroll Spy
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('main-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  // Sticky Navbar on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  });

  // Mobile Drawer Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
    });

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    }

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Active Link Highlighting based on Scroll Section
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // Hero Quick Triggers
  const heroExploreBtn = document.getElementById('hero-explore-btn');
  if (heroExploreBtn) {
    heroExploreBtn.addEventListener('click', () => {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const heroAuditTriggerBtn = document.getElementById('hero-audit-trigger-btn');
  if (heroAuditTriggerBtn) {
    heroAuditTriggerBtn.addEventListener('click', () => {
      document.getElementById('aeo-audit')?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('audit-url-input')?.focus();
    });
  }
}

/* ===========================================================================
   Interactive Solution Architecture Matrix
   =========================================================================== */
function initArchitectureMatrix() {
  const cards = document.querySelectorAll('.arch-card');
  const toggles = document.querySelectorAll('.cap-toggle');
  const title = document.getElementById('arch-display-title');
  const chipBox = document.getElementById('arch-tech-chips');
  const requestButton = document.getElementById('request-blueprint-btn');
  if (!cards.length || !title || !chipBox) return;

  const architectures = {
    web: { title: 'Next.js 15 Enterprise Architecture', stats: ['99/100', '100K+', '< 38ms', '98%'], chips: ['Next.js 15 (App Router)', 'TypeScript', 'Node.js / Express', 'PostgreSQL & Redis', 'Cloudflare Edge / Vercel'] },
    shopify: { title: 'Headless Shopify Plus Commerce Stack', stats: ['98/100', '40K+', '< 55ms', '94%'], chips: ['Shopify Plus', 'Hydrogen / Oxygen', 'Storefront GraphQL', 'Shopify Functions', 'Klaviyo & GA4'] },
    apps: { title: 'Real-Time Mobile Application Ecosystem', stats: ['97/100', '25K+', '< 65ms', '92%'], chips: ['Flutter / React Native', 'Firebase / Supabase', 'REST & GraphQL APIs', 'Push Notifications', 'App Store CI/CD'] },
    aeo: { title: 'AI Search & Answer Engine Blueprint', stats: ['96/100', '75K+', '< 48ms', '99%'], chips: ['Schema.org JSON-LD', 'Entity Knowledge Graph', 'Vector Embeddings', 'Content APIs', 'AI Search Monitoring'] }
  };
  const statIds = ['stat-cwv', 'stat-rps', 'stat-latency', 'stat-ai'];
  let current = 'web';

  function render(architecture) {
    const data = architectures[architecture];
    current = architecture;
    title.textContent = data.title;
    statIds.forEach((id, index) => { const element = document.getElementById(id); if (element) element.textContent = data.stats[index]; });
    chipBox.replaceChildren(...data.chips.map(chip => { const element = document.createElement('span'); element.className = 'chip'; element.textContent = chip; return element; }));
  }
  cards.forEach(card => card.addEventListener('click', () => { cards.forEach(item => item.classList.remove('active')); card.classList.add('active'); render(card.dataset.arch); }));
  toggles.forEach(toggle => toggle.addEventListener('change', () => toggle.closest('.capability-switch-card')?.classList.toggle('active', toggle.checked)));
  requestButton?.addEventListener('click', () => window.IdeobizApp?.openInquiryModal(`Architecture Blueprint: ${architectures[current].title}`));
  render(current);
}

/* ==========================================================================
   2. Hero Section Slider & Dynamic 3D Panes
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const navBtns = document.querySelectorAll('.slide-nav-btn');
  const codePanes = document.querySelectorAll('.code-preview-pane');
  let currentSlide = 0;
  let slideInterval = null;

  function switchSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    navBtns.forEach(btn => btn.classList.remove('active'));
    codePanes.forEach(pane => pane.classList.remove('active'));

    currentSlide = index;
    slides[index]?.classList.add('active');
    navBtns[index]?.classList.add('active');
    codePanes[index]?.classList.add('active');
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetIdx = parseInt(btn.getAttribute('data-target'), 10);
      switchSlide(targetIdx);
      resetAutoPlay();
    });
  });

  function startAutoPlay() {
    slideInterval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      switchSlide(nextSlide);
    }, 6000);
  }

  function resetAutoPlay() {
    clearInterval(slideInterval);
    startAutoPlay();
  }

  startAutoPlay();
}

/* ==========================================================================
   3. Hero 3D Card Tilt Effect
   ========================================================================== */
function initHeroCardTilt() {
  const card = document.getElementById('hero-card-tilt');
  if (!card) return;

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

/* ===========================================================================
   4. Live Website Readiness Audit — API-backed; no client-side scoring
   =========================================================================== */
function initAeoAuditSimulator() {
  const form = document.getElementById('audit-form');
  const input = document.getElementById('audit-url-input');
  const error = document.getElementById('audit-input-error');
  const progress = document.getElementById('audit-progress');
  const fill = document.getElementById('audit-progress-fill');
  const step = document.getElementById('audit-step-label');
  const percent = document.getElementById('audit-percentage');
  const results = document.getElementById('audit-results');
  const gateForm = document.getElementById('audit-gate-form');
  let auditId = null;
  if (!form) return;

  const steps = [
    [12, 'Checking Core Web Vitals with Google PageSpeed Insights...'],
    [38, 'Fetching and scanning page HTML for Google SEO signals...'],
    [68, 'Checking schema, headings and AI/AEO readiness...'],
    [88, 'Checking robots.txt, sitemap.xml and llms.txt...']
  ];
  const cleanDomain = value => {
    try {
      const url = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
      if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(url.hostname) || url.username || url.password) throw new Error();
      return url.hostname.replace(/^www\./i, '');
    } catch { return null; }
  };
  const setProgress = ([value, label]) => { fill.style.width = `${value}%`; percent.textContent = `${value}%`; step.textContent = label; };
  const grade = score => score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';
  const scoreClass = score => score >= 75 ? 'score-good' : score >= 50 ? 'score-warn' : 'score-poor';

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const domain = cleanDomain(input.value);
    error.hidden = true;
    if (!domain) { error.textContent = 'Enter a valid public domain, such as yourcompany.com.'; error.hidden = false; return; }
    form.querySelector('button').disabled = true;
    results.style.display = 'none'; progress.style.display = 'block';
    steps.forEach((item, index) => setTimeout(() => setProgress(item), index * 1050));
    try {
      const response = await fetch('/api/audits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'The audit could not be completed.');
      auditId = payload.id;
      setProgress([100, 'Audit complete — compiling your live findings...']);
      renderAudit(payload);
    } catch (err) {
      error.textContent = err.message; error.hidden = false;
    } finally {
      progress.style.display = 'none'; form.querySelector('button').disabled = false;
    }
  });

  function renderAudit(audit) {
    document.getElementById('result-domain-text').textContent = audit.domain;
    document.getElementById('audit-timestamp').textContent = `Analyzed ${new Date(audit.createdAt).toLocaleString()} • Live audit data`;
    document.getElementById('badge-grade').textContent = grade(audit.scores.overall);
    document.getElementById('overall-score-text').textContent = `${audit.scores.overall}/100 Overall Score`;
    [['seo', 'seo'], ['aeo', 'aeo'], ['performance', 'speed']].forEach(([key, element]) => {
      const score = audit.scores[key];
      document.getElementById(`score-${element}-text`).textContent = `${score}%`;
      const circle = document.getElementById(`circle-${element}`);
      circle.setAttribute('stroke-dasharray', `${score}, 100`);
      circle.closest('.circular-chart').classList.remove('score-good', 'score-warn', 'score-poor');
      circle.closest('.circular-chart').classList.add(scoreClass(score));
    });
    const findings = document.getElementById('free-findings-list');
    findings.replaceChildren(...audit.freeFindings.map(finding => {
      const li = document.createElement('li'); li.textContent = finding; return li;
    }));
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  gateForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.getElementById('audit-gate-message');
    const button = gateForm.querySelector('button');
    if (!auditId) return;
    button.disabled = true; message.textContent = 'Sending your report…';
    try {
      const response = await fetch(`/api/audits/${auditId}/lead`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: document.getElementById('audit-email-input').value, company: document.getElementById('audit-company-field').value }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to send the report.');
      message.textContent = payload.emailSent ? 'Your full report is on its way to your inbox.' : 'Saved. Email delivery is not configured yet; your team can access this lead in Postgres.';
      gateForm.reset();
    } catch (err) { message.textContent = err.message; }
    finally { button.disabled = false; }
  });
}

/* ==========================================================================
   5. Holistic Services Tab Switcher
   ========================================================================== */
function initServicesTabs() {
  const tabBtns = document.querySelectorAll('.service-tab-btn');
  const servicePanels = document.querySelectorAll('.service-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      servicePanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const serviceKey = btn.getAttribute('data-service');
      const targetPanel = document.getElementById(`service-panel-${serviceKey}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. Interactive Project Cost & Timeline Calculator
   ========================================================================== */
function initCostCalculator() {
  const typePills = document.querySelectorAll('#type-selector .opt-pill');
  const scaleSlider = document.getElementById('scale-range');
  const scaleDisplay = document.getElementById('scale-display');
  const addonChecks = document.querySelectorAll('.addon-check');

  const totalPriceVal = document.getElementById('total-price-val');
  const deliveryWeeksVal = document.getElementById('delivery-weeks-val');
  const summaryTypeName = document.getElementById('summary-type-name');
  const summaryTypePrice = document.getElementById('summary-type-price');
  const summaryScaleName = document.getElementById('summary-scale-name');
  const summaryScalePrice = document.getElementById('summary-scale-price');
  const summaryAddonsPrice = document.getElementById('summary-addons-price');
  const calcBookBtn = document.getElementById('calc-book-btn');

  let selectedType = {
    name: 'Custom Website / Web App',
    base: 1200,
    weeks: 3
  };

  const scaleTiers = [
    { name: 'Starter Tier (1 - 5 Pages)', mult: 0, weeksAdd: 0, label: '1 - 5 Pages (Starter)' },
    { name: 'Growth Scope (5 - 10 Pages)', mult: 400, weeksAdd: 1, label: '5 - 10 Pages (Growth Standard)' },
    { name: 'Enterprise Scope (10 - 25 Pages)', mult: 950, weeksAdd: 2, label: '10 - 25 Pages (Enterprise)' },
    { name: 'Full Custom Platform (25+ Pages)', mult: 1800, weeksAdd: 3, label: 'Custom Platform Architecture' }
  ];

  function recalculate() {
    const scaleIndex = parseInt(scaleSlider.value, 10) - 1;
    const currentScale = scaleTiers[scaleIndex];

    scaleDisplay.textContent = currentScale.label;

    let addonsTotal = 0;
    addonChecks.forEach(chk => {
      if (chk.checked) {
        addonsTotal += parseInt(chk.value, 10);
      }
    });

    const total = selectedType.base + currentScale.mult + addonsTotal;
    const totalWeeksMin = selectedType.weeks + currentScale.weeksAdd;
    const totalWeeksMax = totalWeeksMin + 1;

    // Update DOM values
    totalPriceVal.textContent = total.toLocaleString();
    deliveryWeeksVal.textContent = `${totalWeeksMin} - ${totalWeeksMax} Weeks`;

    summaryTypeName.textContent = selectedType.name;
    summaryTypePrice.textContent = `$${selectedType.base.toLocaleString()}`;

    summaryScaleName.textContent = currentScale.name;
    summaryScalePrice.textContent = currentScale.mult > 0 ? `+$${currentScale.mult}` : '$0 (Included)';

    summaryAddonsPrice.textContent = `+$${addonsTotal.toLocaleString()}`;
  }

  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      selectedType = {
        name: pill.querySelector('span').textContent,
        base: parseInt(pill.getAttribute('data-base'), 10),
        weeks: parseInt(pill.getAttribute('data-weeks'), 10)
      };

      recalculate();
    });
  });

  scaleSlider.addEventListener('input', recalculate);
  addonChecks.forEach(chk => chk.addEventListener('change', recalculate));

  if (calcBookBtn) {
    calcBookBtn.addEventListener('click', () => {
      const currentTotal = totalPriceVal.textContent;
      window.IdeobizApp.openInquiryModal(`${selectedType.name} (Estimated Quote: $${currentTotal})`);
    });
  }

  // Initial Calculation
  recalculate();
}

/* ==========================================================================
   7. Live International Clocks (India, USA, UAE)
   ========================================================================== */
function initGlobalClocks() {
  const clockIndia = document.getElementById('clock-india');
  const clockUsa = document.getElementById('clock-usa');
  const clockUae = document.getElementById('clock-uae');

  function updateClocks() {
    const now = new Date();

    if (clockIndia) {
      clockIndia.textContent = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }) + ' IST';
    }

    if (clockUsa) {
      clockUsa.textContent = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }) + ' EST';
    }

    if (clockUae) {
      clockUae.textContent = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }) + ' GST';
    }
  }

  updateClocks();
  setInterval(updateClocks, 1000);
}

/* ==========================================================================
   8. Testimonials Carousel
   ========================================================================== */
function initTestimonialsCarousel() {
  const cards = document.querySelectorAll('.testi-card');
  const dots = document.querySelectorAll('.testi-dots .dot');
  const prevBtn = document.getElementById('testi-prev-btn');
  const nextBtn = document.getElementById('testi-next-btn');

  let activeIdx = 0;
  let autoPlay = null;

  function showReview(idx) {
    cards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    activeIdx = idx;
    cards[idx]?.classList.add('active');
    dots[idx]?.classList.add('active');
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeIdx = (activeIdx - 1 + cards.length) % cards.length;
      showReview(activeIdx);
      resetAuto();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeIdx = (activeIdx + 1) % cards.length;
      showReview(activeIdx);
      resetAuto();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-idx'), 10);
      showReview(idx);
      resetAuto();
    });
  });

  function startAuto() {
    autoPlay = setInterval(() => {
      activeIdx = (activeIdx + 1) % cards.length;
      showReview(activeIdx);
    }, 7000);
  }

  function resetAuto() {
    clearInterval(autoPlay);
    startAuto();
  }

  startAuto();
}

/* ==========================================================================
   9. Proposal Modal & Global Window Helper
   ========================================================================== */
function initProposalModal() {
  const modal = document.getElementById('quote-modal');
  const openBtn = document.getElementById('open-quote-modal-btn');
  const closeBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('modal-proposal-form');
  const serviceSelect = document.getElementById('modal-service');

  window.IdeobizApp = {
    openInquiryModal: function(serviceName) {
      if (modal) {
        modal.classList.add('open');
        if (serviceName && serviceSelect) {
          // match or add option
          let found = false;
          for (let i = 0; i < serviceSelect.options.length; i++) {
            if (serviceSelect.options[i].text.includes(serviceName) || serviceSelect.options[i].value.includes(serviceName)) {
              serviceSelect.selectedIndex = i;
              found = true;
              break;
            }
          }
          if (!found) {
            const opt = new Option(serviceName, serviceName, true, true);
            serviceSelect.add(opt);
          }
        }
      }
    }
  };

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('open');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      modal.classList.remove('open');
      form.reset();
      showToast('Thank you! Your proposal request has been received. Our team will contact you shortly.');
    });
  }
}

/* ==========================================================================
   10. Quick Contact Form
   ========================================================================== */
function initQuickContactForm() {
  const form = document.getElementById('quick-contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    form.reset();
    showToast('Inquiry submitted! Our solutions architect will connect within 24 hours.');
  });
}

/* ==========================================================================
   11. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   12. Toast Notification Helper
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text-content');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function updateCurrentYear() {
  const yr = document.getElementById('current-year');
  if (yr) {
    yr.textContent = new Date().getFullYear();
  }
}
