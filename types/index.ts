export enum SafetyLevel {
  SAFE = 'SAFE',
  SUSPICIOUS = 'SUSPICIOUS',
  DANGEROUS = 'DANGEROUS',
}

export interface SecurityCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface URLAnalysisRequest {
  url: string;
}

export interface URLAnalysisResponse {
  url: string;
  safetyLevel: SafetyLevel;
  score: number;
  checks: SecurityCheck[];
  explanation: string;
  timestamp: string;
  canPreview: boolean;
  proxyAvailable?: boolean;
  proxyError?: string;
  workingMethod?: string;
  triedVariants?: string[];
}

export interface ScreenshotRequest {
  url: string;
}

export interface ScreenshotResponse {
  success: boolean;
  screenshot?: string;
  error?: string;
  format: 'base64' | 'url';
  timestamp: string;
}

export interface PreviewResponse {
  success: boolean;
  url: string;
  content?: string;
  size?: number;
  sizeFormatted?: string;
  error?: string;
  canProxy?: boolean;
  timestamp: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}
