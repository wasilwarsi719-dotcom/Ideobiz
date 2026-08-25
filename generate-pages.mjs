import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const pages = {
  'services': ['Services', 'Digital growth services designed around performance, clarity and measurable outcomes.', [['web-design-development','Web Design & Development'],['ecommerce-shopify','eCommerce & Shopify'],['seo-aeo','SEO & AEO'],['digital-marketing','Digital Marketing'],['social-media-marketing','Social Media Marketing'],['paid-advertising','Paid Advertising'],['branding-creative','Branding & Creative']]],
  'services/web-design-development': ['Web Design & Development', 'High-performing websites and digital products that make the next customer action feel obvious.'],
  'services/ecommerce-shopify': ['eCommerce & Shopify', 'Conversion-focused storefronts built for ambitious online brands.'],
  'services/seo-aeo': ['SEO & AEO', 'Earn visibility in Google results and the next generation of AI-powered answers.'],
  'services/digital-marketing': ['Digital Marketing', 'Connected digital marketing programmes that turn attention into measurable growth.'],
  'services/social-media-marketing': ['Social Media Marketing', 'A social presence with a distinctive point of view and a clear commercial purpose.'],
  'services/paid-advertising': ['Paid Advertising', 'Campaigns that put budget behind the audiences most likely to become customers.'],
  'services/branding-creative': ['Branding & Creative', 'A memorable identity system and creative platform built to travel across every channel.'],
  'work': ['Our Work', 'Selected partnerships where strategy, design and technology produced tangible results.', [['case-study','Featured Case Study']]],
  'work/case-study': ['Featured Case Study', 'A closer look at the strategy, execution and outcomes behind an Ideobiz engagement.'],
  'about': ['About Ideobiz', 'We blend strategic thinking, creative craft and technical depth to help brands grow.', [['team','Meet the Team'],['partners','Our Partners']]],
  'about/team': ['Meet the Team', 'The specialists who bring strategy, creativity and technology together.'],
  'about/partners': ['Our Partners', 'The platforms and partners that help our clients move with confidence.'],
  'industries': ['Industries', 'Digital growth expertise tailored to the realities of your market.'],
  'testimonials': ['Client Testimonials', 'The outcomes matter most. Hear directly from the people we partner with.'],
  'insights': ['Insights', 'Practical ideas for leaders building stronger digital brands.', [['digital-marketing','Digital Marketing'],['seo-aeo','SEO & AEO'],['web-development','Web Development'],['ecommerce','eCommerce'],['branding','Branding'],['business-growth','Business Growth']]],
  'insights/digital-marketing': ['Digital Marketing Insights', 'Campaign, channel and measurement ideas for sustainable growth.'],
  'insights/seo-aeo': ['SEO & AEO Insights', 'Search visibility guidance for Google and AI answer engines.'],
  'insights/web-development': ['Web Development Insights', 'Technical and design perspectives for better digital experiences.'],
  'insights/ecommerce': ['eCommerce Insights', 'Tactics and ideas for more effective online stores.'],
  'insights/branding': ['Branding Insights', 'How strategically expressive brands build preference.'],
  'insights/business-growth': ['Business Growth Insights', 'Practical thinking for teams pursuing their next stage of growth.'],
  'free-website-audit': ['Free Website Audit', 'See how ready your website is for performance, Google search and AI answers.'],
  'faq': ['Frequently Asked Questions', 'Useful answers about working with Ideobiz Solutions.'],
  'careers': ['Careers', 'Join a team that builds ambitious digital work with care and curiosity.'],
  'contact': ['Contact Ideobiz', 'Tell us what you are building. We will help you find the most effective way forward.'],
  'privacy-policy': ['Privacy Policy', 'How Ideobiz Solutions collects, uses and protects personal information.'],
  'terms-of-service': ['Terms of Service', 'The terms that govern use of the Ideobiz Solutions website and services.'],
  'cookie-policy': ['Cookie Policy', 'How and why cookies are used on the Ideobiz Solutions website.'],
  'disclaimer': ['Disclaimer', 'Important information about use of this website and its content.']
};
for (const [route, [title, intro, children = []]] of Object.entries(pages)) {
  const directory = path.join(root, route); fs.mkdirSync(directory, { recursive: true });
  const depth = route.split('/').length; const relative = '../'.repeat(depth);
  const nav = `<a href="${relative}services/index.html">Services</a><a href="${relative}work/index.html">Work</a><a href="${relative}about/index.html">About</a><a href="${relative}industries/index.html">Industries</a><a href="${relative}insights/index.html">Insights</a><a href="${relative}contact/index.html">Contact</a><a class="nav-audit" href="${relative}free-website-audit/index.html">Free Audit</a>`;
  const cards = children.length ? children.map(([slug, label]) => `<a class="route-card" href="${relative}${route}/${slug}/index.html"><h2>${label}</h2><p>Explore our ${label.toLowerCase()} expertise.</p></a>`).join('') : '<article class="route-card"><h2>Built for momentum</h2><p>More detailed page content can now be added within this dedicated route.</p></article>';
  const auditCta = route === 'free-website-audit' ? `<a class="cta-button" href="${relative}index.html#resources">Run the audit</a>` : `<a class="cta-button" href="${relative}contact/index.html">Talk to our team</a>`;
  fs.writeFileSync(path.join(directory, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Ideobiz Solutions</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="${relative}site-pages.css"></head><body><header class="site-header"><nav class="site-nav"><a href="${relative}index.html"><img class="site-logo" src="${relative}ideobiz-logo.png" alt="Ideobiz Solutions"></a><div class="site-nav-links">${nav}</div></nav></header><main><section class="page-hero"><div class="page-inner"><span class="eyebrow">IDEOBIZ SOLUTIONS</span><h1>${title}</h1><p class="intro">${intro}</p></div></section><section class="page-content"><div class="page-inner"><div class="card-grid">${cards}</div><div class="cta-panel"><div><h2>Ready to move forward?</h2><p>Talk with the Ideobiz team about your next digital opportunity.</p></div>${auditCta}</div></div></section></main><footer class="site-footer"><div class="site-footer-inner"><span>© Ideobiz Solutions</span><span><a href="${relative}privacy-policy/index.html">Privacy</a> · <a href="${relative}terms-of-service/index.html">Terms</a> · <a href="${relative}cookie-policy/index.html">Cookies</a> · <a href="${relative}disclaimer/index.html">Disclaimer</a></span></div></footer></body></html>`);
}
