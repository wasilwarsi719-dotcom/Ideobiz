# Ideobiz Website Readiness Audit

Run `npm install`, copy `.env.example` to `.env`, add the required PageSpeed, Postgres and SMTP credentials, then run `npm start`. Open `http://localhost:3000` rather than opening `index.html` directly: the audit calls the bundled API.

The PageSpeed API is live Google data. HTML tags, HTTPS and companion files are live server-side fetches. Heading and answer-clarity checks are explicitly heuristics. Scoring weights are documented in `server.js` beside the scoring functions.

Before production, set `REPORT_BASE_URL` to the public HTTPS origin and put the app behind a reverse proxy with HTTPS. The server rate-limits audits to one IP per minute, rejects private-network targets to reduce SSRF risk, and uses a honeypot on lead capture.
