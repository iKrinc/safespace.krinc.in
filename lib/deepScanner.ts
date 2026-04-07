/**
 * Deep scanner — static analysis of fetched HTML + JavaScript.
 * Runs 18 pattern rules across high / medium / low severity tiers.
 */

export interface ScriptFinding {
  label: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  count: number;
}

export type OverallRisk = 'none' | 'low' | 'medium' | 'high' | 'critical';

interface Rule {
  re: RegExp;
  label: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

const RULES: Rule[] = [
  // ── High severity ─────────────────────────────────────────────────────────
  {
    re: /\beval\s*\(/g,
    label: 'eval()',
    severity: 'high',
    description: 'Dynamic code execution — core technique in JS malware and obfuscation.',
  },
  {
    re: /String\.fromCharCode\s*\(/g,
    label: 'char-code obfuscation',
    severity: 'high',
    description: 'Assembles strings char-by-char to evade static detection.',
  },
  {
    re: /(?:atob|unescape)\s*\([^)]{20,}/g,
    label: 'encoded payload',
    severity: 'high',
    description: 'Decodes base64/URL-encoded payload at runtime — classic obfuscation.',
  },
  {
    re: /(?:\\x[0-9a-fA-F]{2}){20,}/g,
    label: 'hex-encoded string',
    severity: 'high',
    description: 'Long hex-encoded string — strong indicator of obfuscated malicious payload.',
  },
  {
    re: /document\.write\s*\(/g,
    label: 'document.write()',
    severity: 'high',
    description: 'Injects raw HTML at runtime — used to load phishing forms or hidden iframes.',
  },
  {
    re: /CoinHive|coinhive|CryptoNight|cryptonight|minero\.to|coinimp\.com|coin-hive/gi,
    label: 'crypto miner',
    severity: 'high',
    description: 'Cryptocurrency mining signature — steals CPU/battery without consent.',
  },
  {
    re: /<iframe[^>]*(?:display\s*:\s*none|visibility\s*:\s*hidden|width\s*=\s*["']?0|height\s*=\s*["']?0)[^>]*>/gi,
    label: 'hidden iframe',
    severity: 'high',
    description: 'Invisible iframe — used in clickjacking attacks and silent credential theft.',
  },

  // ── Medium severity ────────────────────────────────────────────────────────
  {
    re: /(?:window\.)?location(?:\.href)?\s*=(?!=)\s*['"`]/g,
    label: 'auto-redirect',
    severity: 'medium',
    description: 'Silently redirects the user — may send to a phishing page.',
  },
  {
    re: /location\.(?:replace|assign)\s*\(/g,
    label: 'forced redirect',
    severity: 'medium',
    description: 'Redirect that removes back-button history — prevents users from going back.',
  },
  {
    re: /setTimeout\s*\(\s*(?:function\b|async\s+function|\w+\s*=>|new\s+Function)/g,
    label: 'delayed execution',
    severity: 'medium',
    description: 'Timed function call — may execute malicious code after analysis window.',
  },
  {
    re: /setInterval\s*\(\s*(?:function\b|async\s+function|\w+\s*=>)/g,
    label: 'repeating timer',
    severity: 'medium',
    description: 'Repeating timed execution — used in miners and persistent trackers.',
  },
  {
    re: /window\.open\s*\(/g,
    label: 'popup',
    severity: 'medium',
    description: 'Opens new window/tab programmatically — may spawn phishing pages.',
  },
  {
    re: /document\.cookie\s*=/g,
    label: 'cookie write',
    severity: 'medium',
    description: 'Script modifies cookies — may hijack sessions or set tracking identifiers.',
  },
  {
    re: /\.submit\s*\(\s*\)/g,
    label: 'form auto-submit',
    severity: 'medium',
    description: 'Silently submits a form — may exfiltrate credentials or PII.',
  },
  {
    re: /navigator\.sendBeacon\s*\(/g,
    label: 'background beacon',
    severity: 'medium',
    description: 'Sends data silently in the background even as the page unloads.',
  },
  {
    re: /new\s+(?:Shared)?Worker\s*\(/g,
    label: 'web worker',
    severity: 'medium',
    description: 'Background thread — can run miners or process data invisibly.',
  },
  {
    re: /WebAssembly\.(?:instantiate|compile|instantiateStreaming)\s*\(/g,
    label: 'WebAssembly',
    severity: 'medium',
    description: 'Binary execution — used in high-performance miners and obfuscated malware.',
  },

  // ── Low severity ──────────────────────────────────────────────────────────
  {
    re: /addEventListener\s*\(\s*['"]key(?:down|up|press)['"]/g,
    label: 'keylogger pattern',
    severity: 'low',
    description: 'Captures keyboard input — may harvest passwords or card numbers.',
  },
  {
    re: /new\s+Function\s*\(/g,
    label: 'new Function()',
    severity: 'high',
    description: 'Constructs and executes code from a string at runtime — same risk as eval().',
  },
  {
    re: /\.innerHTML\s*[+]?=\s*(?:.*<script|.*<iframe)/gi,
    label: 'innerHTML injection',
    severity: 'high',
    description: 'Injects a script or iframe element via innerHTML — common in XSS and phishing kits.',
  },
  {
    re: /document\.cookie\s*=/g,
    label: 'cookie manipulation',
    severity: 'medium',
    description: 'Writes to document.cookie — may set session-hijack tokens or tracking identifiers.',
  },
  {
    re: /localStorage\.(?:setItem|clear)|sessionStorage\.(?:setItem|clear)/g,
    label: 'storage write',
    severity: 'low',
    description: 'Writes to browser storage — may persist tracking data across sessions.',
  },
];

export function analyzeScripts(scripts: string[]): ScriptFinding[] {
  if (scripts.length === 0) return [];
  const combined = scripts.join('\n');
  const findings: ScriptFinding[] = [];

  for (const rule of RULES) {
    // Create a fresh regex instance to avoid lastIndex drift
    const re = new RegExp(rule.re.source, rule.re.flags.replace('g', '') + 'g');
    const matches = combined.match(re);
    if (matches && matches.length > 0) {
      findings.push({
        label: rule.label,
        severity: rule.severity,
        description: rule.description,
        count: matches.length,
      });
    }
  }

  // Sort: high first, then medium, then low
  return findings.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function calcOverallRisk(findings: ScriptFinding[]): OverallRisk {
  const high = findings.filter((f) => f.severity === 'high').length;
  const med  = findings.filter((f) => f.severity === 'medium').length;
  if (high >= 3) return 'critical';
  if (high >= 1) return 'high';
  if (med  >= 3) return 'medium';
  if (med  >= 1) return 'low';
  return 'none';
}
