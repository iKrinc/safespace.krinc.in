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
  const tld = parts[parts.length - 1];

  // 1. IP address used as hostname (e.g. http://192.168.1.1/phish)
  const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);

  // 2. Brand impersonation: brand appears as a standalone word in the hostname
  //    but the hostname is NOT an officially owned domain of that brand.
  //    e.g. google-login.evil.com → suspicious; accounts.google.com → safe
  //    google-analytics.com → safe (it's Google's own domain)
  const brandOwned: Record<string, string[]> = {
    paypal:    ['paypal.com', 'paypal.me', 'paypalobjects.com'],
    amazon:    ['amazon.com', 'amazonaws.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr',
                'amazon.co.jp', 'amazon.ca', 'amazon.com.au', 'amazon.in'],
    google:    ['google.com', 'googleapis.com', 'google-analytics.com', 'googletagmanager.com',
                'gstatic.com', 'googlevideo.com', 'ggpht.com', 'googleadservices.com',
                'googleusercontent.com', 'googlesyndication.com', 'google.co.uk',
                'google.com.au', 'google.ca', 'google.de', 'google.fr', 'google.co.in'],
    microsoft: ['microsoft.com', 'microsoftonline.com', 'azure.com', 'live.com',
                'outlook.com', 'office.com', 'office365.com', 'windows.com',
                'xbox.com', 'skype.com', 'bing.com', 'msn.com', 'linkedin.com'],
    apple:     ['apple.com', 'icloud.com', 'mzstatic.com', 'apple-cloudkit.com',
                'cdn-apple.com', 'apple.co'],
    facebook:  ['facebook.com', 'fb.com', 'fbcdn.net', 'fbsbx.com', 'meta.com',
                'instagram.com', 'whatsapp.com', 'messenger.com'],
    netflix:   ['netflix.com', 'nflxvideo.net', 'nflximg.net', 'nflxext.com'],
    instagram: ['instagram.com', 'cdninstagram.com', 'ig.me'],
  };

  const hasBrandImpersonation = Object.entries(brandOwned).some(([brand, ownedDomains]) => {
    // Word-boundary match in hostname
    const boundedPattern = new RegExp(`(?:^|[.-])${brand}(?:[.-]|$)`);
    if (!boundedPattern.test(hostname)) return false;
    // Safe if hostname is or is a subdomain of a brand-owned domain
    if (ownedDomains.some((d) => hostname === d || hostname.endsWith(`.${d}`))) return false;
    // Safe if registered domain starts with brand name + dot (e.g. google.co.uk)
    if (registeredDomain.startsWith(`${brand}.`)) return false;
    return true;
  });

  // 3. Common phishing keywords in the registered domain
  //    Skip check for trusted institutional TLDs (.gov, .edu, .mil) — login.gov is legit
  const isTrustedInstitution = /^(?:gov|edu|mil|ac)$/.test(tld) ||
    /\.(?:gov|edu|mil)$/.test(registeredDomain);
  const phishingInDomain =
    !isTrustedInstitution &&
    /(?:^|[.-])(?:login|signin|verify|secure|account|update)(?:[.-]|$)/.test(registeredDomain);

  // 4. @ symbol in the *authority* section (redirect obfuscation: https://good.com@evil.com)
  //    url.username is set when @ appears before the hostname.
  //    Path-level @ (e.g. youtube.com/@handle) is completely normal.
  const hasAtSymbol = url.username.length > 0;

  // 5. Multiple consecutive dashes (common in typosquatting domains)
  const hasMultipleDashes = /--/.test(hostname);

  // 6. Excessive subdomain depth (more than 6 labels is unusual)
  const hasExcessiveSubdomains = parts.length > 6;

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

  // Free / high-abuse TLDs — statistically overrepresented in phishing campaigns
  // Note: .xyz removed — Alphabet/Google uses abc.xyz; it's now mainstream
  const suspiciousTLDs = [
    '.tk', '.ml', '.ga', '.cf', '.gq',   // Freenom free TLDs, massively abused
    '.top', '.work', '.click',             // Statistically high abuse rates
  ];

  const hasSuspiciousTLD = suspiciousTLDs.some((tld) => hostname.endsWith(tld));

  // Numbers-in-domain: only flag if the entire first label is numeric
  // (e.g. 192.evil.com) — NOT legitimate brands like 1password.com, 3m.com, mp3.com
  const firstLabel = hostname.split('.')[0];
  const hasNumbersInDomain = /^\d+$/.test(firstLabel);

  // Very long hostnames (> 40 chars) — genuinely unusual for real sites
  const isVeryLong = hostname.length > 40;

  const issues: string[] = [];
  if (hasSuspiciousTLD) issues.push('high-risk free TLD');
  if (hasNumbersInDomain) issues.push('all-numeric subdomain label');
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
  const hostname = url.hostname.toLowerCase();

  // Well-known, long-established domains
  const wellKnownDomains = [
    // Search & productivity
    'google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com',
    // Microsoft
    'microsoft.com', 'microsoftonline.com', 'azure.com', 'live.com',
    'outlook.com', 'office.com', 'windows.com', 'xbox.com', 'skype.com',
    // Apple
    'apple.com', 'icloud.com',
    // Amazon / AWS
    'amazon.com', 'amazonaws.com',
    // Social & media
    'facebook.com', 'meta.com', 'instagram.com', 'whatsapp.com',
    'twitter.com', 'x.com', 'threads.net',
    'youtube.com', 'tiktok.com', 'snapchat.com', 'pinterest.com',
    'linkedin.com', 'reddit.com', 'tumblr.com', 'quora.com',
    // Dev & tech
    'github.com', 'gitlab.com', 'bitbucket.org',
    'stackoverflow.com', 'npmjs.com', 'pypi.org',
    'vercel.com', 'netlify.com', 'heroku.com', 'render.com',
    'cloudflare.com', 'fastly.com', 'akamai.com',
    'digitalocean.com', 'linode.com', 'vultr.com',
    // Knowledge & news
    'wikipedia.org', 'wikimedia.org',
    'nytimes.com', 'bbc.com', 'bbc.co.uk', 'theguardian.com', 'reuters.com',
    // Commerce & payments
    'paypal.com', 'stripe.com', 'shopify.com', 'etsy.com', 'ebay.com',
    // Streaming & entertainment
    'netflix.com', 'spotify.com', 'twitch.tv', 'discord.com', 'slack.com',
    // Security / infra
    'letsencrypt.org', 'haveibeenpwned.com',
  ];

  const isWellKnown = wellKnownDomains.some((domain) => hostname.endsWith(domain));

  // Established TLDs correlate with older registrations
  const establishedTLDs = ['.com', '.org', '.edu', '.gov', '.net', '.co.uk', '.ac.uk', '.mil'];
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
  // 250 chars allows for normal query strings, social media paths, etc.
  const isSuspiciouslyLong = urlLength > 250;

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
