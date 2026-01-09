import { SecurityCheck } from '@/types';

export function validateURL(urlString: string): {
  isValid: boolean;
  url?: URL;
  error?: string;
} {
  try {
    const url = new URL(urlString);

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
  const suspiciousPatterns = [
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address
    /paypal|amazon|google|microsoft|apple|bank|login|verify|secure|account|update/i, // Phishing keywords
    /@/, // @ symbol (used in phishing)
    /\-{2,}/, // Multiple consecutive dashes
  ];

  const hostname = url.hostname.toLowerCase();
  const fullUrl = url.href.toLowerCase();

  const hasSuspiciousPattern = suspiciousPatterns.some((pattern) =>
    pattern.test(hostname) || pattern.test(fullUrl)
  );

  // Check for excessive subdomains (more than 3)
  const subdomains = hostname.split('.');
  const hasExcessiveSubdomains = subdomains.length > 4;

  const isSuspicious = hasSuspiciousPattern || hasExcessiveSubdomains;

  return {
    name: 'Suspicious Patterns',
    passed: !isSuspicious,
    message: isSuspicious
      ? 'URL contains patterns commonly used in phishing attacks (IP addresses, suspicious keywords, or excessive subdomains)'
      : 'No suspicious patterns detected in URL structure',
    severity: isSuspicious ? 'high' : 'low',
  };
}

export function checkDomain(url: URL): SecurityCheck {
  const hostname = url.hostname.toLowerCase();

  // List of suspicious TLDs commonly used in phishing
  const suspiciousTLDs = [
    '.tk', '.ml', '.ga', '.cf', '.gq', // Free TLDs
    '.xyz', '.top', '.work', '.click', '.link', // Often abused
  ];

  const hasSuspiciousTLD = suspiciousTLDs.some((tld) =>
    hostname.endsWith(tld)
  );

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
    'google.com', 'microsoft.com', 'apple.com', 'amazon.com',
    'facebook.com', 'twitter.com', 'github.com', 'stackoverflow.com',
  ];

  const isWellKnown = wellKnownDomains.some((domain) =>
    hostname.endsWith(domain)
  );

  // For demo: assume .com, .org, .edu are older; newer TLDs are younger
  const establishedTLDs = ['.com', '.org', '.edu', '.gov', '.net'];
  const hasEstablishedTLD = establishedTLDs.some((tld) =>
    hostname.endsWith(tld)
  );

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
