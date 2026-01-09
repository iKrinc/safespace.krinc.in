import { SafetyLevel, SecurityCheck, URLAnalysisResponse } from '@/types';
import {
  validateURL,
  checkHTTPS,
  checkSuspiciousPatterns,
  checkDomain,
  analyzeDomainAge,
  checkURLLength,
  checkSpecialCharacters,
} from './securityChecks';

export async function analyzeURL(urlString: string): Promise<URLAnalysisResponse> {
  const timestamp = new Date().toISOString();

  // Step 1: Validate URL
  const validation = validateURL(urlString);
  if (!validation.isValid || !validation.url) {
    return {
      url: urlString,
      safetyLevel: SafetyLevel.DANGEROUS,
      score: 0,
      checks: [
        {
          name: 'URL Validation',
          passed: false,
          message: validation.error || 'Invalid URL',
          severity: 'high',
        },
      ],
      explanation: 'The provided URL is invalid and cannot be analyzed.',
      timestamp,
      canPreview: false,
    };
  }

  const url = validation.url;

  // Step 2: Run all security checks
  const checks: SecurityCheck[] = [
    {
      name: 'URL Validation',
      passed: true,
      message: 'URL format is valid',
      severity: 'low',
    },
    checkHTTPS(url),
    checkSuspiciousPatterns(url),
    checkDomain(url),
    analyzeDomainAge(url),
    checkURLLength(url),
    checkSpecialCharacters(url),
  ];

  // Step 3: Calculate safety score
  const { safetyLevel, score } = calculateSafetyScore(checks);

  // Step 4: Generate explanation
  const explanation = generateExplanation(safetyLevel, checks);

  // Step 5: Determine if preview is safe
  const canPreview = safetyLevel !== SafetyLevel.DANGEROUS;

  return {
    url: url.href,
    safetyLevel,
    score,
    checks,
    explanation,
    timestamp,
    canPreview,
  };
}

function calculateSafetyScore(checks: SecurityCheck[]): {
  safetyLevel: SafetyLevel;
  score: number;
} {
  // Calculate weighted score based on severity and pass/fail
  let totalWeight = 0;
  let earnedWeight = 0;

  const severityWeights = {
    low: 1,
    medium: 2,
    high: 3,
  };

  for (const check of checks) {
    const weight = severityWeights[check.severity];
    totalWeight += weight;
    if (check.passed) {
      earnedWeight += weight;
    }
  }

  // Calculate percentage score (0-100)
  const score = Math.round((earnedWeight / totalWeight) * 100);

  // Determine safety level
  let safetyLevel: SafetyLevel;
  if (score >= 80) {
    safetyLevel = SafetyLevel.SAFE;
  } else if (score >= 50) {
    safetyLevel = SafetyLevel.SUSPICIOUS;
  } else {
    safetyLevel = SafetyLevel.DANGEROUS;
  }

  // Additional rule: If any high-severity check fails, mark as DANGEROUS
  const highSeverityFailed = checks.some(
    (check) => check.severity === 'high' && !check.passed
  );
  if (highSeverityFailed && safetyLevel === SafetyLevel.SUSPICIOUS) {
    safetyLevel = SafetyLevel.DANGEROUS;
  }

  return { safetyLevel, score };
}

function generateExplanation(
  safetyLevel: SafetyLevel,
  checks: SecurityCheck[]
): string {
  const failedChecks = checks.filter((check) => !check.passed);

  switch (safetyLevel) {
    case SafetyLevel.SAFE:
      return `This URL appears to be safe. All security checks passed successfully. The website uses standard security practices and shows no obvious signs of malicious intent. However, always exercise caution when clicking links from untrusted sources.`;

    case SafetyLevel.SUSPICIOUS:
      if (failedChecks.length === 0) {
        return `This URL has some minor concerns but may be safe. Review the security checks before proceeding.`;
      }
      return `This URL shows ${failedChecks.length} warning sign${
        failedChecks.length > 1 ? 's' : ''
      }: ${failedChecks
        .map((c) => c.name)
        .join(', ')}. Proceed with caution and verify the source before interacting with this website.`;

    case SafetyLevel.DANGEROUS:
      if (failedChecks.length === 0) {
        return `This URL is potentially dangerous. Multiple security concerns detected.`;
      }
      return `⚠️ This URL is potentially dangerous and should be avoided. ${
        failedChecks.length
      } critical issue${failedChecks.length > 1 ? 's' : ''} detected: ${failedChecks
        .map((c) => c.name)
        .join(', ')}. Do not enter personal information or credentials on this site.`;

    default:
      return 'Unable to determine safety level.';
  }
}
