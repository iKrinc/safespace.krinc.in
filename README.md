# SafeSpace 🛡️

A production-ready web application for analyzing suspicious URLs safely. SafeSpace performs comprehensive security checks and provides sandboxed previews of potentially malicious websites without risking your device.

## Features

- **URL Security Analysis**: Multi-layer security checks including HTTPS validation, suspicious pattern detection, domain analysis, and more
- **Safe Preview**: Sandboxed iframe preview for sites that allow embedding (see limitations below)
- **Rate Limiting**: Built-in protection against abuse
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Modern UI**: Clean, minimal interface built with Tailwind CSS
- **TypeScript**: Fully typed codebase with strict mode enabled
- **Security-First**: CSP headers, XSS protection, and secure coding practices

### Important Note About Previews

**Most modern websites prevent iframe embedding** using X-Frame-Options or CSP headers. This means the preview will appear blank for sites like Google, Facebook, banking sites, etc. This is **expected behavior** and demonstrates good security practices by those sites.

The URL analysis is the main feature - the preview is supplementary. For production use with full preview capability, implement the Puppeteer screenshot service (see `lib/screenshotService.ts`).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3
- **Validation**: Zod
- **Rate Limiting**: LRU Cache
- **Security**: Strict CSP, sandboxed iframes

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd safespace
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Paste a URL**: Enter any suspicious URL into the input field
2. **Analyze**: Click "Analyze URL" to perform security checks
3. **Review Results**: View safety score, detailed checks, and explanations
4. **Safe Preview**: View a sandboxed preview of the website (if deemed safe enough)

### Example URLs to Test

- Safe: `https://google.com`
- Suspicious: `http://192.168.1.1/admin`
- Various patterns to test the security checks

## Project Structure

```
safespace/
├── app/
│   ├── api/              # API routes
│   │   ├── analyze/      # URL analysis endpoint
│   │   └── screenshot/   # Screenshot endpoint
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── Header.tsx
│   ├── URLInput.tsx
│   ├── AnalysisResults.tsx
│   ├── SafePreview.tsx
│   └── Footer.tsx
├── lib/                  # Core services
│   ├── urlAnalyzer.ts    # Analysis orchestration
│   ├── securityChecks.ts # Security validation
│   ├── rateLimit.ts      # Rate limiting
│   └── screenshotService.ts
├── hooks/                # Custom React hooks
│   └── useURLAnalysis.ts
├── types/                # TypeScript definitions
│   └── index.ts
└── public/               # Static assets
```

## Security Features

### Analysis Checks

1. **URL Validation**: WHATWG URL API validation
2. **HTTPS Check**: Enforces secure connections
3. **Suspicious Patterns**: Detects IP addresses, phishing keywords, excessive subdomains
4. **Domain Analysis**: TLD validation, malicious pattern detection
5. **Domain Age**: Heuristic-based age estimation
6. **URL Length**: Flags suspiciously long URLs
7. **Special Characters**: Detects obfuscation attempts

### Security Headers

- **CSP**: Strict Content-Security-Policy
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **HSTS**: Strict-Transport-Security
- **Referrer-Policy**: strict-origin-when-cross-origin

### Sandboxing

- Iframe with `sandbox="allow-same-origin"` only
- No script execution allowed
- Pointer events disabled overlay
- Clear security notices

## API Endpoints

### POST /api/analyze

Analyzes a URL for security threats.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "safetyLevel": "SAFE",
  "score": 100,
  "checks": [...],
  "explanation": "...",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "canPreview": true
}
```

### POST /api/screenshot

Captures a screenshot of a URL (currently returns fallback to iframe).

**Request:**
```json
{
  "url": "https://example.com"
}
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Code Quality

- **ESLint**: Next.js recommended + TypeScript rules
- **Prettier**: Code formatting (2 spaces, single quotes)
- **TypeScript**: Strict mode with comprehensive checks
- **Type Safety**: No implicit any, strict null checks

## Deployment

### Vercel (Recommended)

1. Push to GitHub repository
2. Import project in Vercel
3. Deploy automatically

### Self-Hosted

1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
npm run start
```

## Future Enhancements

### Planned Features

1. **Real Threat Intelligence APIs**:
   - VirusTotal integration
   - Google Safe Browsing API
   - URLScan.io

2. **Screenshot Service**:
   - Puppeteer integration for server-side screenshots
   - Chromium in Docker for production

3. **Database**:
   - PostgreSQL + Prisma
   - Analysis history storage
   - User accounts

4. **Advanced Analysis**:
   - JavaScript behavior analysis
   - Redirect chain following
   - SSL certificate validation

5. **Performance**:
   - Redis caching for repeated URLs
   - Background job queues

6. **Monitoring**:
   - Sentry error tracking
   - Vercel Analytics
   - Logging infrastructure

## Security Considerations

### What SafeSpace Does

- Validates URL structure and patterns
- Performs heuristic analysis on domain characteristics
- Provides sandboxed previews without script execution
- Rate limits requests to prevent abuse

### What SafeSpace Doesn't Do

- Does NOT execute malicious code on your device
- Does NOT store your browsing data
- Does NOT guarantee 100% accuracy (no automated system is perfect)
- Does NOT replace human judgment and caution

### Best Practices

- Never enter personal information on suspicious sites
- Always verify URLs from trusted sources
- Use this tool as one layer of defense, not the only layer
- Report phishing to appropriate authorities

## License

This project is for educational purposes. Use at your own risk.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Write tests for new features
5. Submit a pull request

## Support

For issues or questions:
- Open a GitHub issue
- Review existing documentation
- Check security best practices

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
