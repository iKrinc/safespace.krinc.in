# SafeSpace

**AI-powered URL security scanner — check suspicious links before you click.**

No sign-up. No data stored. Paste any URL and get an instant AI-enhanced security analysis with a sandboxed safe preview.

🌐 **Live:** [safespace.krinc.in](https://safespace.krinc.in) &nbsp;|&nbsp; 🧩 **Chrome Extension:** [github.com/iKrinc/safespace.extension](https://github.com/iKrinc/safespace.extension) &nbsp;|&nbsp; ⭐ **Star on GitHub** if it helped you!

---

## What It Does

SafeSpace runs 7 security checks on any URL plus an **AI threat analysis** via Groq, giving it a safety score from 0–100:

| Check | What it detects |
|---|---|
| **URL Validation** | Format check using the WHATWG URL API |
| **HTTPS Protocol** | Flags insecure HTTP connections |
| **Suspicious Patterns** | IP addresses, brand impersonation, phishing keywords, @ tricks |
| **Domain Analysis** | Risky TLDs, long domains, numeric domains |
| **Domain Age** | Heuristic estimation of domain trustworthiness |
| **URL Length** | Flags abnormally long URLs (>200 chars) |
| **Special Characters** | Detects encoding tricks and obfuscation |

**Scores:** `80–100 = SAFE` &nbsp;|&nbsp; `50–79 = SUSPICIOUS` &nbsp;|&nbsp; `<50 = DANGEROUS`

If the URL passes, a **sandboxed live preview** loads — CSS, images, JS animations all render correctly. No need to open it in a new tab.

---

## AI Threat Intelligence

SafeSpace uses a hybrid model — regex checks always run, AI enhances the explanation:

- **Production:** [Groq](https://groq.com) API with `llama-3.1-8b-instant` — ~1s response, free tier (14,400 req/day)
- **Local dev:** [Ollama](https://ollama.com) with `qwen2.5:7b` — fully offline
- **Fallback:** If neither is available, regex analysis still works

AI provides:
- Human-readable threat explanation
- Specific threat list (typosquatting, suspicious TLD, phishing keywords, etc.)
- One clear recommendation

---

## Chrome Extension

Install the [SafeSpace Chrome Extension](https://github.com/iKrinc/safespace.extension) to:

- **See safety badges on every Google result** — colored `[✓]` / `[!]` / `[✗]` badges appear automatically
- **Click any badge** → slide-in panel with full AI analysis + sandboxed preview
- **New tab page** — terminal-themed clock + smart search bar (URLs go to SafeSpace, queries go to Google)

---

## Privacy

- URLs are analyzed **server-side** but **never stored or logged**
- No user accounts, no cookies, no tracking scripts
- Rate limiting is IP-based (30 req/min), auto-expires
- Fully open-source — audit every line

---

## Security

- **SSRF protection** — blocks requests to `localhost`, `127.x`, `10.x`, `192.168.x`, `172.16-31.x`, `169.254.x`, IPv6 local
- **CSP headers** — strict Content-Security-Policy, X-Frame-Options DENY, HSTS
- **Input validation** — all API inputs validated with Zod
- **Sandboxed preview** — `allow-scripts allow-forms` only, no `allow-same-origin`

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS — custom cyberpunk terminal theme |
| AI (prod) | Groq API — `llama-3.1-8b-instant` |
| AI (dev) | Ollama — `qwen2.5:7b` (configurable) |
| Validation | Zod |
| Rate limiting | LRU Cache |
| Deployment | Vercel (free plan) |

---

## Getting Started

```bash
git clone git@github.com:iKrinc/safespace.krinc.in.git
cd safespace.krinc.in
npm install
cp .env.example .env.local
# Add GROQ_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes (prod) | Free key from [console.groq.com](https://console.groq.com) |
| `OLLAMA_MODEL` | No | Local model (default: `qwen2.5:7b`) |

For Vercel: only add `GROQ_API_KEY` in **Settings → Environment Variables**.

---

## API

### `POST /api/analyze`

```json
// Request
{ "url": "https://example.com" }

// Response
{
  "url": "https://example.com",
  "safetyLevel": "SAFE",
  "score": 100,
  "checks": [...],
  "explanation": "This URL appears to be safe...",
  "aiInsights": {
    "explanation": "AI-generated explanation...",
    "threats": [],
    "recommendation": "Safe to visit.",
    "powered": "groq"
  },
  "timestamp": "2026-04-07T00:00:00.000Z",
  "canPreview": true
}
```

### `POST /api/preview`

```json
// Request
{ "url": "https://example.com" }

// Response
{
  "success": true,
  "content": "<html>...</html>",
  "sizeFormatted": "124.5KB",
  "timestamp": "..."
}
```

---

## Project Structure

```
app/
├── api/
│   ├── analyze/route.ts    — URL analysis endpoint (30 req/min)
│   ├── preview/route.ts    — Page fetch + CSS inlining
│   └── proxy/route.ts      — CORS proxy
├── about/page.tsx
├── contact/page.tsx
└── page.tsx                — Homepage
components/
├── URLInput.tsx
├── AnalysisResults.tsx     — Score + AI panel + security checks
└── SafePreview.tsx         — Sandboxed iframe preview
lib/
├── aiAnalyzer.ts           — Groq + Ollama AI layer
├── urlAnalyzer.ts          — Orchestrates all checks
├── securityChecks.ts       — 7 individual check functions
├── proxyFetch.ts           — Fetch with SSRF protection + AbortController
└── rateLimit.ts            — LRU-based rate limiter
```

---

## Deployment

- **Vercel** (recommended) — push to GitHub and connect; zero config needed
- **Any Node host** — `npm run build && npm start`

---

## Limitations

- SafeSpace uses heuristic + AI analysis, not a live threat database. No automated tool is 100% accurate — use it as one layer of defense alongside caution.
- Sandboxed preview shows blank for sites that block iframe embedding (X-Frame-Options / CSP). This is expected.

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit and open a pull request

Bug reports → [GitHub Issues](https://github.com/iKrinc/safespace.krinc.in/issues)

---

## Support

SafeSpace is free and always will be. If it kept you safe:

❤️ [Sponsor on GitHub](https://github.com/sponsors/iKrinc) — keeps the servers running.

---

## License

MIT © [Krinc](https://krinc.in)
