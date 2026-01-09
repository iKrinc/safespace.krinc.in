# SafeSpace Architecture Documentation

## Overview

SafeSpace is a Next.js 14 application built with the App Router, TypeScript, and Tailwind CSS. It follows a layered architecture with clear separation of concerns.

## Architecture Layers

### 1. Presentation Layer (Components)
Location: `/components`

**Responsibilities:**
- User interface rendering
- User interaction handling
- State display

**Components:**
- `Header.tsx`: Application branding and title
- `URLInput.tsx`: URL input with validation
- `AnalysisResults.tsx`: Security analysis display with collapsible details
- `SafePreview.tsx`: Sandboxed iframe preview with fallback handling
- `Footer.tsx`: Disclaimers and legal information

**Design Principles:**
- Single responsibility per component
- Props-based communication
- Client-side components for interactivity
- Accessibility (ARIA labels, semantic HTML)

### 2. Application Layer (Hooks & Pages)
Location: `/hooks`, `/app`

**Responsibilities:**
- Business logic orchestration
- State management
- Component composition

**Key Files:**
- `hooks/useURLAnalysis.ts`: URL analysis state management
- `app/page.tsx`: Main page composition
- `app/layout.tsx`: Root layout with metadata

**Pattern:** Custom hooks for reusable logic

### 3. API Layer (Route Handlers)
Location: `/app/api`

**Responsibilities:**
- HTTP request handling
- Input validation
- Response formatting
- Rate limiting enforcement

**Endpoints:**

#### POST /api/analyze
- **Purpose**: URL security analysis
- **Validation**: Zod schema
- **Rate Limit**: 10 requests/minute per IP
- **Response**: URLAnalysisResponse

#### POST /api/screenshot
- **Purpose**: Screenshot capture (currently fallback to iframe)
- **Validation**: Zod schema
- **Rate Limit**: 5 requests/minute per IP
- **Response**: ScreenshotResponse

**Pattern:** Edge-compatible serverless functions

### 4. Service Layer (Business Logic)
Location: `/lib`

**Responsibilities:**
- Core business logic
- Security checks
- Data processing

**Services:**

#### urlAnalyzer.ts
- Orchestrates all security checks
- Calculates safety scores
- Generates human-readable explanations
- **Key Function**: `analyzeURL(url: string): Promise<URLAnalysisResponse>`

#### securityChecks.ts
- Individual security validation functions
- Pattern matching for threats
- Domain analysis
- **Functions**:
  - `validateURL()`: URL format validation
  - `checkHTTPS()`: Protocol validation
  - `checkSuspiciousPatterns()`: Pattern detection
  - `checkDomain()`: Domain characteristics
  - `analyzeDomainAge()`: Domain age heuristics
  - `checkURLLength()`: Length validation
  - `checkSpecialCharacters()`: Character analysis

#### rateLimit.ts
- LRU cache-based rate limiting
- IP-based tracking
- Configurable limits
- **Key Function**: `withRateLimit(request, options)`

#### screenshotService.ts
- Screenshot capture (placeholder for Puppeteer)
- Browser instance management
- **Current**: Returns fallback to iframe
- **Future**: Puppeteer integration

### 5. Type System
Location: `/types`

**Purpose**: TypeScript type definitions

**Key Types:**
- `SafetyLevel`: Enum (SAFE, SUSPICIOUS, DANGEROUS)
- `SecurityCheck`: Individual check result
- `URLAnalysisRequest`: API request schema
- `URLAnalysisResponse`: API response schema
- `ScreenshotResponse`: Screenshot result
- `RateLimitResult`: Rate limit status

## Data Flow

```
User Input (URL)
    ↓
URLInput Component (validation)
    ↓
useURLAnalysis Hook (state management)
    ↓
POST /api/analyze (HTTP)
    ↓
Rate Limit Check
    ↓
URL Analyzer Service
    ↓
Security Checks (parallel execution)
    ↓
Score Calculation
    ↓
Response to Client
    ↓
AnalysisResults Component (display)
    ↓
SafePreview Component (if safe)
```

## Security Architecture

### Defense Layers

1. **Input Validation**
   - Client-side: Real-time validation
   - Server-side: Zod schema validation
   - WHATWG URL API for parsing

2. **Rate Limiting**
   - LRU cache with TTL
   - IP-based tracking
   - Configurable thresholds

3. **Content Security Policy**
   - Strict CSP headers
   - No inline scripts
   - Limited resource loading

4. **Sandboxing**
   - Iframe with minimal sandbox permissions
   - `allow-same-origin` only
   - Pointer events overlay

5. **HTTP Security Headers**
   - HSTS
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy

### Threat Model

**Protected Against:**
- XSS attacks (CSP, sandboxing)
- Clickjacking (X-Frame-Options)
- MIME sniffing (X-Content-Type-Options)
- Phishing URLs (pattern detection)
- Malicious redirects (no direct navigation)
- DoS attacks (rate limiting)

**Not Protected Against:**
- Zero-day exploits in browser sandbox
- Social engineering outside the app
- Determined attackers with custom malware

## Performance Considerations

### Optimization Strategies

1. **Static Generation**: Main page is statically generated
2. **Code Splitting**: Automatic by Next.js App Router
3. **Font Optimization**: Inter font via next/font
4. **Image Optimization**: Next.js Image component ready
5. **Edge Functions**: API routes compatible with edge runtime

### Caching Strategy

- **Current**: In-memory LRU cache for rate limiting
- **Future**: Redis for distributed caching of analysis results

## Scalability

### Current Capacity

- **Architecture**: Serverless (Vercel)
- **Rate Limit**: 10 req/min per IP (configurable)
- **State**: Stateless API routes
- **Caching**: In-memory (ephemeral)

### Scaling Path

1. **Horizontal Scaling**: Serverless auto-scales
2. **Database Layer**: Add PostgreSQL for history
3. **Distributed Cache**: Redis/Vercel KV
4. **Queue System**: BullMQ for screenshot processing
5. **CDN**: Static assets via Vercel Edge Network

## Configuration

### Environment Variables

```bash
NODE_ENV=production|development
RATE_LIMIT_MAX=10
RATE_LIMIT_INTERVAL=60000
SCREENSHOT_TIMEOUT=10000
```

### Next.js Config

- Security headers in `next.config.js`
- Image optimization settings
- Experimental features (package imports)

### TypeScript Config

- Strict mode enabled
- No implicit any
- Comprehensive null checks
- Path aliases (@/*)

## Testing Strategy (Future)

### Recommended Approach

1. **Unit Tests**: Jest + React Testing Library
   - Component rendering
   - Hook behavior
   - Service functions

2. **Integration Tests**: API route testing
   - Request/response validation
   - Rate limiting behavior
   - Error handling

3. **E2E Tests**: Playwright
   - User flows
   - Security checks
   - Responsive design

4. **Security Tests**
   - CSP validation
   - Sandbox escape attempts
   - Rate limit verification

## Deployment

### Vercel (Recommended)

**Advantages:**
- Automatic HTTPS
- Edge network
- Serverless functions
- Zero configuration

**Process:**
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Self-Hosted

**Requirements:**
- Node.js 18+
- Reverse proxy (Nginx)
- SSL certificates
- Process manager (PM2)

**Docker Option:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Monitoring & Observability

### Recommended Tools

1. **Error Tracking**: Sentry
2. **Analytics**: Vercel Analytics
3. **Logging**: Structured JSON logs
4. **APM**: Datadog or New Relic
5. **Uptime**: Pingdom or UptimeRobot

### Metrics to Track

- API response times
- Error rates by endpoint
- Rate limit hits
- Analysis score distribution
- User engagement (time on page, interactions)

## Future Architecture Considerations

### Microservices Approach

If the application grows significantly:

1. **URL Analysis Service**: Dedicated service for checks
2. **Screenshot Service**: Separate service with Puppeteer
3. **API Gateway**: Kong or AWS API Gateway
4. **Event Bus**: For async processing

### Database Schema (Planned)

```sql
-- Users table
users (id, email, created_at)

-- Analysis history
analyses (id, user_id, url, result, created_at)

-- URL reputation cache
url_reputation (url_hash, score, last_checked)
```

## Contributing Guidelines

### Code Organization

- One component per file
- Colocate types with usage
- Group related utilities
- Clear naming conventions

### Naming Conventions

- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase
- **Files**: Match export name

### Pull Request Process

1. Fork repository
2. Create feature branch
3. Implement changes
4. Add tests (if testing exists)
5. Update documentation
6. Submit PR with clear description

## Conclusion

SafeSpace is designed as a modern, secure, and scalable web application. The architecture supports:
- Easy maintenance through clear separation of concerns
- Security-first approach at every layer
- Scalability through serverless infrastructure
- Future enhancements without breaking changes

The codebase follows industry best practices and is production-ready for deployment.
