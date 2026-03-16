import { SecurityCheck } from '@/types';

export function validateURL(urlString: string): {
  isValid: boolean;
  url?: URL;
  error?: string;
} {
  try {
    // Handle protocol-less URLs (like localhost:3000)
    let normalizedUrl = urlString;
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      // Try HTTPS first, then HTTP as fallback
      normalizedUrl = `https://${urlString}`;
    }

    const url = new URL(normalizedUrl);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS protocols are supported',
      };
    }

    return { isValid: true, url };
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
}

export function checkHTTPS(url: URL): SecurityCheck {
  const isHTTPS = url.protocol === 'https:';

  return {
    name: 'HTTPS Protocol',
    passed: isHTTPS,
    message: isHTTPS
      ? 'Website uses secure HTTPS connection'
      : 'Website uses insecure HTTP connection - data may be intercepted',
    severity: isHTTPS ? 'low' : 'high',
  };
}

export function checkSuspiciousPatterns(url: URL): SecurityCheck {
  const hostname = url.hostname.toLowerCase();
  const parts = hostname.split('.');

  // Extract registered domain (last two labels, e.g. "google.com" from "www.google.com")
  const registeredDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;

  // 1. IP address used as hostname (e.g. http://192.168.1.1/phish)
  const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);

  // 2. Brand impersonation: brand name appears as a standalone word in the URL
  //    but the registered domain does NOT belong to that brand.
  //    e.g. google-login.evil.com → suspicious; accounts.google.com → safe
  const brandKeywords = ['paypal', 'amazon', 'google', 'microsoft', 'apple', 'facebook', 'netflix', 'instagram'];
  const hasBrandImpersonation = brandKeywords.some((brand) => {
    // Word-boundary match: brand must be surrounded by dots, dashes, or string boundaries
    const boundedPattern = new RegExp(`(?:^|[.-])${brand}(?:[.-]|$)`);
    if (!boundedPattern.test(hostname)) return false;
    // Safe if the registered domain itself belongs to this brand (google.com, amazon.co.uk, etc.)
    if (registeredDomain.startsWith(`${brand}.`)) return false;
    return true;
  });

  // 3. Common phishing keywords used as standalone words in the registered domain
  //    Only checked on the registered domain (not subdomains) to avoid flagging login.google.com
  const phishingInDomain = /(?:^|[.-])(?:login|signin|verify|secure|account|update)(?:[.-]|$)/.test(
    registeredDomain
  );

  // 4. @ symbol in URL (redirect obfuscation trick: https://good.com@evil.com)
  const hasAtSymbol = /@/.test(url.href);

  // 5. Multiple consecutive dashes (common in typosquatting domains)
  const hasMultipleDashes = /--/.test(hostname);

  // 6. Excessive subdomain depth (more than 4 labels)
  const hasExcessiveSubdomains = parts.length > 4;

  const isSuspicious =
    isIPAddress ||
    hasBrandImpersonation ||
    phishingInDomain ||
    hasAtSymbol ||
    hasMultipleDashes ||
    hasExcessiveSubdomains;

  return {
    name: 'Suspicious Patterns',
    passed: !isSuspicious,
    message: isSuspicious
      ? 'URL contains patterns commonly used in phishing attacks (IP addresses, brand impersonation, suspicious keywords, or excessive subdomains)'
      : 'No suspicious patterns detected in URL structure',
    severity: isSuspicious ? 'high' : 'low',
  };
}

export function checkDomain(url: URL): SecurityCheck {
  const hostname = url.hostname.toLowerCase();

  // List of suspicious TLDs commonly used in phishing
  const suspiciousTLDs = [
    '.tk',
    '.ml',
    '.ga',
    '.cf',
    '.gq', // Free TLDs
    '.xyz',
    '.top',
    '.work',
    '.click',
    '.link', // Often abused
  ];

  const hasSuspiciousTLD = suspiciousTLDs.some((tld) => hostname.endsWith(tld));

  // Check for numbers in domain (often used in phishing)
  const hasNumbersInDomain = /\d/.test(hostname.split('.')[0]);

  // Check for very long domain names (> 30 chars)
  const isVeryLong = hostname.length > 30;

  const issues: string[] = [];
  if (hasSuspiciousTLD) issues.push('suspicious TLD');
  if (hasNumbersInDomain) issues.push('numbers in domain name');
  if (isVeryLong) issues.push('unusually long domain');

  const passed = issues.length === 0;

  return {
    name: 'Domain Analysis',
    passed,
    message: passed
      ? 'Domain appears legitimate with standard characteristics'
      : `Domain has concerning characteristics: ${issues.join(', ')}`,
    severity: passed ? 'low' : 'medium',
  };
}

export function analyzeDomainAge(url: URL): SecurityCheck {
  // Mock implementation - in production, this would call a WHOIS API
  // For demo purposes, we'll use a simple heuristic based on TLD
  const hostname = url.hostname.toLowerCase();

  // Well-known domains are considered "old" and trustworthy
  const wellKnownDomains = [
    'google.com',
    'microsoft.com',
    'apple.com',
    'amazon.com',
    'facebook.com',
    'twitter.com',
    'github.com',
    'stackoverflow.com',
  ];

  const isWellKnown = wellKnownDomains.some((domain) => hostname.endsWith(domain));

  // For demo: assume .com, .org, .edu are older; newer TLDs are younger
  const establishedTLDs = ['.com', '.org', '.edu', '.gov', '.net'];
  const hasEstablishedTLD = establishedTLDs.some((tld) => hostname.endsWith(tld));

  const passed = isWellKnown || hasEstablishedTLD;

  return {
    name: 'Domain Age',
    passed,
    message: isWellKnown
      ? 'Domain is well-established and widely recognized'
      : hasEstablishedTLD
        ? 'Domain uses an established TLD, likely older than 1 year'
        : 'Domain may be recently registered (higher risk for phishing)',
    severity: passed ? 'low' : 'medium',
  };
}

export function checkURLLength(url: URL): SecurityCheck {
  const urlLength = url.href.length;
  const isSuspiciouslyLong = urlLength > 200;

  return {
    name: 'URL Length',
    passed: !isSuspiciouslyLong,
    message: isSuspiciouslyLong
      ? `URL is suspiciously long (${urlLength} characters) - may hide malicious content`
      : `URL length is normal (${urlLength} characters)`,
    severity: isSuspiciouslyLong ? 'medium' : 'low',
  };
}

export function checkSpecialCharacters(url: URL): SecurityCheck {
  const suspiciousChars = /[<>{}|\^`\[\]]/;
  const hasSuspiciousChars = suspiciousChars.test(url.href);

  return {
    name: 'Special Characters',
    passed: !hasSuspiciousChars,
    message: hasSuspiciousChars
      ? 'URL contains unusual special characters that may indicate obfuscation'
      : 'No unusual special characters detected',
    severity: hasSuspiciousChars ? 'high' : 'low',
  };
}
