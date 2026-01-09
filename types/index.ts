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

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}
