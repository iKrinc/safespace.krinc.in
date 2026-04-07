/**
 * AI-powered URL threat analysis
 * Uses Groq in production (fast, free tier) and Ollama in local dev as fallback.
 * Gracefully degrades to empty insights if neither is available.
 */

import { SecurityCheck, SafetyLevel, AIInsights } from '@/types';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

function buildPrompt(
  url: string,
  checks: SecurityCheck[],
  score: number,
  safetyLevel: SafetyLevel
): string {
  const failed = checks.filter((c) => !c.passed);
  const passed = checks.filter((c) => c.passed);

  return `You are a cybersecurity analyst reviewing a URL scan result. Use your own knowledge of the internet to give an accurate assessment — do NOT just echo the automated check results.

URL: ${url}
Safety Score: ${score}/100
Classification: ${safetyLevel}
Failed checks: ${failed.length > 0 ? failed.map((c) => `${c.name} [${c.severity}]: ${c.message}`).join('; ') : 'none'}
Passed checks: ${passed.map((c) => c.name).join(', ')}

Respond ONLY with valid JSON in exactly this format:
{"explanation":"2-3 sentence threat assessment for a non-technical user","threats":["specific threat 1","specific threat 2"],"recommendation":"one clear action the user should take"}

Rules:
- Use your own knowledge first: if the domain is clearly a major legitimate platform (YouTube, Google, GitHub, Microsoft, Apple, Reddit, etc.), say so explicitly even if automated checks flagged something
- YouTube handles like youtube.com/@username are completely normal — NOT phishing
- @ in a URL path is normal for social media handles; only @ before the hostname is a phishing trick
- google-analytics.com, googleapis.com, microsoftonline.com, etc. are official brand domains — not impersonation
- If SAFE: explain why it appears trustworthy, highlight passed checks
- If SUSPICIOUS or DANGEROUS: describe the specific realistic risk, not hypothetical worst-case scenarios
- threats array: max 4 items, each under 80 chars; empty array [] if SAFE or no real threat
- Do not repeat check names verbatim — synthesize the meaning for a non-technical person`;
}

function parseAIResponse(content: string, powered: AIInsights['powered']): AIInsights {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in response');

  const parsed = JSON.parse(match[0]);

  return {
    explanation: typeof parsed.explanation === 'string' ? parsed.explanation.trim() : '',
    threats: Array.isArray(parsed.threats)
      ? parsed.threats.filter((t: unknown) => typeof t === 'string').map((t: string) => t.trim())
      : [],
    recommendation:
      typeof parsed.recommendation === 'string' ? parsed.recommendation.trim() : '',
    powered,
  };
}

async function callGroq(prompt: string): Promise<AIInsights> {
  const resp = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 350,
      temperature: 0.2,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`Groq API ${resp.status}: ${body.slice(0, 100)}`);
  }

  const data = await resp.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  return parseAIResponse(content, 'groq');
}

async function callOllama(prompt: string): Promise<AIInsights> {
  const model = process.env.OLLAMA_MODEL ?? 'qwen2.5:7b';
  const resp = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  });

  if (!resp.ok) throw new Error(`Ollama ${resp.status}`);

  const data = await resp.json();
  const content: string = data.message?.content ?? '';
  return parseAIResponse(content, 'ollama');
}

const EMPTY: AIInsights = {
  explanation: '',
  threats: [],
  recommendation: '',
  powered: 'none',
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`AI timeout after ${ms}ms`)), ms)
    ),
  ]);
}

export async function getAIInsights(
  url: string,
  checks: SecurityCheck[],
  score: number,
  safetyLevel: SafetyLevel
): Promise<AIInsights> {
  const prompt = buildPrompt(url, checks, score, safetyLevel);

  // Try Groq first — works in production on Vercel
  if (process.env.GROQ_API_KEY) {
    try {
      return await withTimeout(callGroq(prompt), 7000);
    } catch (err) {
      console.warn('[AI] Groq failed:', err instanceof Error ? err.message : err);
    }
  }

  // Try Ollama as fallback — works in local dev
  if (process.env.NODE_ENV !== 'production') {
    try {
      return await withTimeout(callOllama(prompt), 12000);
    } catch (err) {
      console.warn('[AI] Ollama failed:', err instanceof Error ? err.message : err);
    }
  }

  return EMPTY;
}
