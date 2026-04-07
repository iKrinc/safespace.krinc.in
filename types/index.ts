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

export interface AIInsights {
  explanation: string;
  threats: string[];
  recommendation: string;
  powered: 'groq' | 'ollama' | 'none';
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
  aiInsights?: AIInsights;
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

// ── Deep scan types ──────────────────────────────────────────────────────────

export interface ScriptFinding {
  label: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  count: number;
}

export type OverallRisk = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type DeepScanStage =
  | 'idle'
  | 'fetching'
  | 'analyzing'
  | 'behavioral'
  | 'done';

/** A single event captured by the behavioral monitoring iframe script. */
export interface BehaviorEvent {
  /** Event type */
  t: 'timeout' | 'timeout_fired' | 'interval' | 'popup' | 'redirect' |
     'fetch' | 'xhr' | 'docwrite' | 'iframe' | 'scriptinject' |
     'inlineScriptInject' | 'eval' | 'newFunction' | 'createElement' | 'cookieWrite';
  /** Delay in ms (for timers) */
  d?: number;
  /** URL or destination */
  u?: string;
  /** XHR method */
  m?: string;
  /** Whether iframe was hidden */
  h?: boolean;
  /** Snippet (docwrite) */
  s?: string;
  /** Milliseconds since page load when event fired */
  ms?: number;
}

export interface DeepScanState {
  stage: DeepScanStage;
  htmlSize: number;
  scriptCount: number;
  fetchedJsFiles: number;
  findings: ScriptFinding[];
  overallRisk: OverallRisk;
  behaviorEvents: BehaviorEvent[];
  fetchError?: string;
}

// ── Rate limit ────────────────────────────────────────────────────────────────
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}
