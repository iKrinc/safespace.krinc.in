# Troubleshooting Guide

## Preview Issues

### Issue: Iframe Preview Shows Blank/Empty Page

**Why this happens:**

Most modern websites implement **X-Frame-Options** or **Content-Security-Policy frame-ancestors** headers that explicitly prevent their pages from being embedded in iframes. This is a security feature to protect against clickjacking attacks.

**Examples of sites that block iframe embedding:**
- Google.com
- Facebook.com
- Twitter.com
- Most banking websites
- Most government websites
- Many e-commerce sites

**This is NOT a bug** - it's expected behavior and actually a good security practice by those websites.

**What SafeSpace shows:**

SafeSpace will display:
1. The iframe container (which may appear blank if the site blocks embedding)
2. A blue info box explaining that many sites prevent iframe embedding
3. The security analysis results above (which is the primary value)

**Solution:**

The URL analysis results are the main feature - the preview is supplementary. For production use, you should:

1. **Implement Puppeteer screenshots** (recommended):
   - Server-side headless browser
   - Captures actual screenshots
   - No iframe restrictions
   - See implementation notes in `lib/screenshotService.ts`

2. **Use a proxy service**:
   - Services like PagePixels or ScreenshotAPI
   - Render websites server-side
   - Return images instead of iframes

3. **Accept the limitation**:
   - Focus on the URL analysis as the main value
   - Use iframe as supplementary when it works

### Issue: Iframe Appears But Content Doesn't Load

**Possible causes:**

1. **HTTPS/HTTP Mixed Content**: If your site is HTTPS but the target URL is HTTP, browsers may block it
   - **Solution**: The CSP header includes `upgrade-insecure-requests`

2. **CORS Issues**: Some sites have strict CORS policies
   - **Solution**: This is expected; use screenshot service instead

3. **JavaScript Required**: Site requires JavaScript to render
   - **Current**: Iframe has `allow-scripts` in sandbox
   - **Note**: Scripts are allowed but isolated

### Issue: Some Sites Work, Others Don't

**This is normal!** Whether a site loads in an iframe depends on:

1. **X-Frame-Options Header**:
   - `DENY`: Never allows framing (most common)
   - `SAMEORIGIN`: Only allows same-origin framing
   - No header: Allows framing

2. **CSP frame-ancestors**:
   - More modern alternative to X-Frame-Options
   - Can specify allowed parent domains

3. **JavaScript Frame-busting**:
   - Some sites use JavaScript to break out of frames
   - Usually ineffective with modern sandboxing

**Sites that typically allow iframe embedding:**
- Personal blogs
- Some news sites
- Documentation sites
- Static sites without frame protection
- Older websites

## Rate Limiting Issues

### Issue: "Rate limit exceeded" Error

**Why this happens:**

To prevent abuse, SafeSpace limits:
- 10 URL analysis requests per minute per IP
- 5 screenshot requests per minute per IP

**Solution:**

1. **Wait**: The error message tells you how many seconds to wait
2. **Check rate limit headers**:
   ```
   X-RateLimit-Limit: 10
   X-RateLimit-Remaining: 0
   X-RateLimit-Reset: <timestamp>
   ```
3. **For development**: Adjust limits in `.env`:
   ```
   RATE_LIMIT_MAX=100
   ```

### Issue: Rate Limits Reset After Server Restart

**Why this happens:**

Current implementation uses in-memory LRU cache, which is ephemeral.

**Solution for production:**

Implement persistent rate limiting with:
- **Vercel KV** (Redis)
- **Upstash Redis**
- **PostgreSQL-based tracking**

See `lib/rateLimit.ts` for implementation structure.

## API Issues

### Issue: 400 Bad Request - Invalid URL

**Causes:**

1. Missing protocol: `example.com` → Should be `https://example.com`
2. Invalid characters in URL
3. Non-HTTP(S) protocol: `ftp://`, `file://`, etc.
4. URL too long (>2000 characters)

**Solution:**

Ensure URL includes `http://` or `https://` protocol.

### Issue: 429 Too Many Requests

See "Rate Limiting Issues" above.

### Issue: 500 Internal Server Error

**Possible causes:**

1. **Server-side validation error**: Check server logs
2. **Unexpected URL format**: Very unusual URLs may cause parsing errors
3. **Service dependency failure**: LRU cache initialization failure

**Debug steps:**

1. Check browser console for error details
2. Check server logs: `npm run dev` output
3. Test with a simple URL like `https://example.com`
4. File an issue with the problematic URL (if not sensitive)

## Build Issues

### Issue: TypeScript Errors During Build

**Common causes:**

1. **Missing dependencies**: Run `npm install`
2. **Type mismatches**: Check strict mode compliance
3. **Import path errors**: Ensure `@/` paths are correct

**Solution:**

```bash
npm run type-check  # Check TypeScript without building
npm run lint        # Check linting issues
```

### Issue: Tailwind Styles Not Applying

**Causes:**

1. Missing Tailwind directives in `globals.css`
2. Content paths incorrect in `tailwind.config.ts`
3. PostCSS configuration missing

**Solution:**

Ensure these files exist and are correct:
- `app/globals.css` with `@tailwind` directives
- `tailwind.config.ts` with proper content paths
- `postcss.config.js` with Tailwind plugin

## Development Issues

### Issue: Dev Server Won't Start

**Error: "Port 3000 is in use"**

**Solution:**

```bash
# Option 1: Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
PORT=3001 npm run dev
```

### Issue: Changes Not Reflecting

**Causes:**

1. **Caching**: Browser or Next.js cache
2. **Static generation**: Page is statically generated

**Solution:**

1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`

## Security Issues

### Issue: CSP Violations in Console

**Example error:**
```
Refused to load the script because it violates the following
Content Security Policy directive: "script-src 'self'"
```

**If this is from SafeSpace itself:**

This is a bug - please report it with:
- Full error message
- Steps to reproduce
- Browser version

**If this is from the iframe content:**

This is expected - the embedded site's resources are being blocked by SafeSpace's CSP, which is the security working as intended.

### Issue: "This site can't be reached" in Iframe

**Causes:**

1. **DNS failure**: The URL doesn't resolve
2. **Network error**: Connection timeout
3. **X-Frame-Options**: Site blocked embedding (shows as error in some browsers)

**This is expected behavior** - not all sites can be previewed.

## Performance Issues

### Issue: Slow Analysis Response

**Typical response times:**

- URL analysis: 50-200ms (mock checks)
- Screenshot API: 5-10s (with real Puppeteer, currently instant failover)

**If slower than expected:**

1. Check network latency
2. Check server resources (CPU, memory)
3. Reduce rate limit if causing queuing

### Issue: Large Bundle Size

**Current first load JS: ~92 KB**

If you need to reduce:

1. **Dynamic imports**: Lazy load heavy components
2. **Remove unused dependencies**
3. **Optimize Tailwind**: Use PurgeCSS (already enabled)

## Deployment Issues

### Issue: Vercel Deployment Fails

**Common causes:**

1. **Build errors**: Check build logs
2. **Missing environment variables**
3. **Node version mismatch**

**Solution:**

1. Ensure local build works: `npm run build`
2. Set environment variables in Vercel dashboard
3. Set Node.js version in `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

### Issue: 404 on API Routes After Deployment

**Cause**: API routes not deployed correctly

**Solution:**

Ensure file structure:
```
app/
  api/
    analyze/
      route.ts
    screenshot/
      route.ts
```

## Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Issues

1. **IE 11**: Not supported (Next.js 14 requirement)
2. **Older mobile browsers**: May have CSP issues
3. **Safari < 14**: Module issues

## Getting Help

If your issue isn't covered here:

1. **Check browser console** for error messages
2. **Check server logs** for backend errors
3. **Search existing issues** on GitHub
4. **Create new issue** with:
   - Error message
   - Steps to reproduce
   - Browser/Node version
   - Screenshot (if UI issue)

## FAQ

**Q: Why don't all websites show in the preview?**

A: Most modern websites prevent iframe embedding for security. This is normal and expected. The URL analysis is the main feature.

**Q: Is the URL analysis accurate?**

A: The current implementation uses heuristic checks (pattern matching). For production use, integrate real threat intelligence APIs like VirusTotal or Google Safe Browsing.

**Q: Can I use this for my production application?**

A: The code is production-ready in terms of architecture, but you should:
- Add real threat intelligence APIs
- Implement Puppeteer for screenshots
- Add monitoring and logging
- Consider adding authentication
- Review rate limits for your scale

**Q: Why does the security analysis say "SUSPICIOUS" for legitimate sites?**

A: The heuristic checks may flag edge cases. Review the individual check results to understand why. This is why human judgment is always needed.

**Q: Can I self-host this?**

A: Yes! The application works on any Node.js 18+ environment. See README.md for deployment instructions.

---

Last Updated: 2024
