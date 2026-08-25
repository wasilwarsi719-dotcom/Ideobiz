import 'dotenv/config';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';
import express from 'express';
import rateLimit from 'express-rate-limit';
import * as cheerio from 'cheerio';
import nodemailer from 'nodemailer';
import pg from 'pg';

const app = express();
const port = Number(process.env.PORT || 3000);
const audits = new Map(); // Short-lived cache; leads are persisted to Postgres.
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } }) : null;
const publicDir = fileURLToPath(new URL('.', import.meta.url));
app.set('trust proxy', 1);
app.use(express.json({ limit: '16kb' }));
app.use(express.static(publicDir));

const auditRateLimit = rateLimit({ windowMs: 60_000, limit: 1, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Please wait one minute before starting another audit.' } });

/*
  PUBLIC SCORING METHODOLOGY
  Performance (35% overall): PageSpeed mobile performance score 70%, LCP 15%, CLS 10%, INP 5%.
  SEO (40% overall): 11 live HTML/file signals, each weighted equally (9.09%): title quality,
  title/H1 uniqueness proxy, meta description, one H1, image alt coverage, robots.txt, robots indexability,
  sitemap, HTTPS, viewport and canonical. AEO (25% overall): five equal-weight signals: JSON-LD,
  llms.txt, FAQ, heading hierarchy and answer clarity. Together with four PageSpeed metrics, this is 20 checks.
  PageSpeed is a live Google API check. DOM, files and HTTPS are live server-side fetches.
  Answer clarity and heading hierarchy are explicitly labelled heuristics, not search-engine signals.
*/
const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
const normalizedDomain = value => {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(url.hostname) || url.username || url.password) throw Error();
    return url.hostname.replace(/^www\./i, '').toLowerCase();
  } catch { return null; }
};
const isPrivateIp = ip => ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:') || /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(ip);
async function guardDomain(domain) {
  const records = await dns.lookup(domain, { all: true });
  if (!records.length || records.some(record => isPrivateIp(record.address))) throw new Error('That domain cannot be audited.');
}
async function fetchText(url, timeout = 12000) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(timeout), headers: { 'User-Agent': 'IdeobizReadinessAudit/1.0 (+https://ideobiz.co)' } });
  return { ok: response.ok, url: response.url, text: response.ok ? await response.text() : '' };
}
async function firstReachable(domain) {
  for (const url of [`https://${domain}`, `http://${domain}`]) {
    try { const page = await fetchText(url); if (page.ok) return page; } catch { /* try alternate protocol */ }
  }
  throw new Error('We could not reach this public website. Check the domain and try again.');
}
const metric = (value, good, poor) => value == null ? 0 : value <= good ? 100 : value >= poor ? 0 : 100 * (poor - value) / (poor - good);
async function pageSpeed(url) {
  if (!process.env.PAGESPEED_API_KEY) return { score: null, lcp: null, cls: null, inp: null, unavailable: true };
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url); endpoint.searchParams.set('strategy', 'mobile'); endpoint.searchParams.set('key', process.env.PAGESPEED_API_KEY);
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) return { score: null, lcp: null, cls: null, inp: null, unavailable: true };
  const categories = (await response.json()).lighthouseResult;
  const audits = categories.audits;
  return { score: Math.round((categories.categories.performance?.score || 0) * 100), lcp: audits['largest-contentful-paint']?.numericValue, cls: audits['cumulative-layout-shift']?.numericValue, inp: audits['interaction-to-next-paint']?.numericValue, unavailable: false };
}
const yes = (condition, label) => ({ condition, label });
function htmlChecks(html, siteUrl, robots, sitemap, llms) {
  const $ = cheerio.load(html); const title = $('title').first().text().trim(); const description = $('meta[name="description"]').attr('content')?.trim() || '';
  const h1s = $('h1'); const images = $('img'); const withAlt = images.filter((_, el) => $(el).attr('alt') !== undefined).length;
  const scripts = $('script[type="application/ld+json"]'); const schemaTypes = [];
  scripts.each((_, el) => { try { const data = JSON.parse($(el).contents().text()); const values = Array.isArray(data) ? data : [data, ...(data['@graph'] || [])]; values.forEach(value => { const type = value?.['@type']; (Array.isArray(type) ? type : [type]).filter(Boolean).forEach(item => schemaTypes.push(item)); }); } catch { /* invalid JSON-LD is not counted */ } });
  const headings = $('h1,h2,h3').map((_, el) => Number(el.tagName.slice(1))).get(); let hierarchy = headings.length > 0;
  for (let index = 1; index < headings.length; index++) if (headings[index] > headings[index - 1] + 1) hierarchy = false;
  const text = $('body').text().replace(/\s+/g, ' ').trim(); const topText = text.slice(0, 1200); const answerClarity = /\b(is|are|means|helps|includes|offers|provides|can)\b/i.test(topText) && topText.split(/[.!?]/).some(sentence => sentence.trim().split(/\s+/).length >= 10);
  const faq = schemaTypes.includes('FAQPage') || /\b(faq|frequently asked questions|questions? and answers?)\b/i.test(text);
  const robotsMeta = $('meta[name="robots"]').attr('content') || '';
  const seo = [yes(title.length >= 30 && title.length <= 60, 'Title tag is missing or outside the recommended 30–60 characters.'), yes(Boolean(title) && Boolean(h1s.first().text().trim()) && title.toLowerCase() !== h1s.first().text().trim().toLowerCase(), 'Title and H1 are identical; use a differentiated title as a uniqueness proxy.'), yes(description.length >= 120 && description.length <= 160, 'Meta description is missing or outside the recommended 120–160 characters.'), yes(h1s.length === 1, h1s.length ? `Found ${h1s.length} H1 headings; aim for one clear H1.` : 'No H1 heading detected.'), yes(images.length === 0 || withAlt / images.length >= .9, `Only ${images.length ? Math.round(withAlt / images.length * 100) : 100}% of images have alt text.`), yes(robots, 'robots.txt was not found.'), yes(!/\bnoindex\b/i.test(robotsMeta), 'A robots meta tag requests noindex.'), yes(sitemap, 'sitemap.xml was not found.'), yes(siteUrl.startsWith('https:'), 'Site did not resolve over HTTPS.'), yes($('meta[name="viewport"]').length > 0, 'No mobile viewport meta tag detected.'), yes($('link[rel="canonical"]').length > 0, 'No canonical link tag detected.')];
  const aeo = [yes(schemaTypes.length > 0, 'No valid schema.org JSON-LD was detected.'), yes(llms, 'llms.txt was not found.'), yes(faq, 'No FAQ/Q&A content or FAQPage schema detected.'), yes(hierarchy, 'Heading hierarchy skips levels or has no semantic headings.'), yes(answerClarity, 'Top-of-page content lacks a clear direct-answer pattern (heuristic).')];
  return { seo, aeo, schemaTypes: [...new Set(schemaTypes)], imageAltCoverage: images.length ? Math.round(withAlt / images.length * 100) : 100 };
}
function scoreReport(performance, checks) {
  const perfScore = performance.unavailable ? 0 : clamp(performance.score * .70 + metric(performance.lcp, 2500, 4000) * .15 + metric(performance.cls, .1, .25) * .10 + metric(performance.inp, 200, 500) * .05);
  const seoScore = clamp(checks.seo.filter(item => item.condition).length / checks.seo.length * 100);
  const aeoScore = clamp(checks.aeo.filter(item => item.condition).length / checks.aeo.length * 100);
  return { performance: perfScore, seo: seoScore, aeo: aeoScore, overall: clamp(perfScore * .35 + seoScore * .40 + aeoScore * .25) };
}
app.post('/api/audits', auditRateLimit, async (req, res) => {
  const domain = normalizedDomain(String(req.body.domain || ''));
  if (!domain) return res.status(400).json({ error: 'Enter a valid public domain.' });
  try {
    await guardDomain(domain);
    const page = await firstReachable(domain); const origin = new URL(page.url).origin;
    const [performance, robots, sitemap, llms] = await Promise.all([pageSpeed(page.url), fetchText(`${origin}/robots.txt`).catch(() => ({ ok: false })), fetchText(`${origin}/sitemap.xml`).catch(() => ({ ok: false })), fetchText(`${origin}/llms.txt`).catch(() => ({ ok: false }))]);
    const checks = htmlChecks(page.text, page.url, robots.ok, sitemap.ok, llms.ok); const scores = scoreReport(performance, checks);
    const findings = [...checks.seo, ...checks.aeo].filter(item => !item.condition).map(item => item.label);
    if (performance.unavailable) findings.unshift('Google PageSpeed data is unavailable because the API key is not configured or the API could not return data.');
    const id = crypto.randomUUID(); const audit = { id, domain, createdAt: new Date().toISOString(), scores, performance, checks, freeFindings: findings.slice(0, 3) };
    audits.set(id, audit); setTimeout(() => audits.delete(id), 30 * 60_000).unref();
    res.json(audit);
  } catch (error) { res.status(422).json({ error: error.message || 'Audit failed.' }); }
});
async function initializeDb() { if (pool) await pool.query('CREATE TABLE IF NOT EXISTS website_audit_leads (id uuid PRIMARY KEY, domain text NOT NULL, email text NOT NULL, created_at timestamptz NOT NULL, overall_score integer NOT NULL, performance_score integer NOT NULL, seo_score integer NOT NULL, aeo_score integer NOT NULL, report jsonb NOT NULL)'); }
app.post('/api/audits/:id/lead', async (req, res) => {
  const audit = audits.get(req.params.id); const email = String(req.body.email || '').trim().toLowerCase();
  if (!audit) return res.status(410).json({ error: 'This audit has expired. Please run it again.' });
  if (req.body.company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid business email.' });
  if (!pool) return res.status(503).json({ error: 'Lead storage is not configured. Set DATABASE_URL before publishing.' });
  const token = crypto.randomBytes(24).toString('base64url'); audit.reportToken = token;
  await pool.query('INSERT INTO website_audit_leads (id, domain, email, created_at, overall_score, performance_score, seo_score, aeo_score, report) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [audit.id, audit.domain, email, audit.createdAt, audit.scores.overall, audit.scores.performance, audit.scores.seo, audit.scores.aeo, audit]);
  let emailSent = false; const reportUrl = `${process.env.REPORT_BASE_URL || `http://localhost:${port}`}/api/reports/${audit.id}?token=${token}`;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) { const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }); await transport.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to: email, subject: `Your Ideobiz Website Readiness Report: ${audit.domain}`, text: `Your full report is ready: ${reportUrl}` }); emailSent = true; }
  res.json({ ok: true, emailSent });
});
app.get('/api/reports/:id', async (req, res) => { if (!pool) return res.status(503).send('Reports are not configured.'); const result = await pool.query('SELECT report FROM website_audit_leads WHERE id = $1', [req.params.id]); const report = result.rows[0]?.report; if (!report || req.query.token !== report.reportToken) return res.status(404).send('Report not found.'); res.type('html').send(`<main style="font-family:system-ui;max-width:760px;margin:48px auto"><h1>Website Readiness Report</h1><p>${report.domain} · ${report.createdAt}</p><h2>${report.scores.overall}/100 overall</h2><p>Performance ${report.scores.performance} · SEO ${report.scores.seo} · AI/AEO ${report.scores.aeo}</p><h2>All findings</h2><ul>${[...report.checks.seo,...report.checks.aeo].filter(x=>!x.condition).map(x=>`<li>${x.label}</li>`).join('')}</ul><p>Schema types: ${report.checks.schemaTypes.join(', ') || 'none detected'}</p></main>`); });
initializeDb().then(() => app.listen(port, () => console.log(`Audit app running at http://localhost:${port}`))).catch(error => { console.error('Database initialization failed:', error); process.exit(1); });
