'use client';

import { DeepScanState, BehaviorEvent, ScriptFinding } from '@/types';

interface Props {
  state: DeepScanState;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  none:     'text-safe-500',
  low:      'text-safe-500',
  medium:   'text-warning-500',
  high:     'text-danger-400',
  critical: 'text-danger-500',
};

const RISK_LABELS: Record<string, string> = {
  none:     'clean',
  low:      'low risk',
  medium:   'medium risk',
  high:     'high risk',
  critical: 'critical',
};

const SEV_ICON: Record<string, string> = {
  high:   '[!]',
  medium: '[~]',
  low:    '[i]',
};

const SEV_COLOR: Record<string, string> = {
  high:   'text-danger-400',
  medium: 'text-warning-400',
  low:    'text-gray-400',
};

function severityOf(events: BehaviorEvent[]): 'none' | 'low' | 'medium' | 'high' {
  const hasRedirect = events.some((e) => e.t === 'redirect');
  const hasHiddenIframe = events.some((e) => e.t === 'iframe' && e.h);
  const popups = events.filter((e) => e.t === 'popup').length;
  if (hasRedirect || hasHiddenIframe) return 'high';
  if (popups > 0) return 'medium';
  const timers = events.filter((e) => e.t === 'timeout' || e.t === 'interval').length;
  if (timers > 5) return 'medium';
  if (timers > 0) return 'low';
  return 'none';
}

function describeEvent(ev: BehaviorEvent): string {
  switch (ev.t) {
    case 'timeout':
      return `setTimeout scheduled${ev.d ? ` — fires after ${ev.d}ms` : ''}`;
    case 'timeout_fired':
      return `setTimeout executed${ev.d ? ` (was delayed ${ev.d}ms)` : ''} — code ran after delay`;
    case 'interval':
      return `setInterval registered${ev.d ? ` — repeats every ${ev.d}ms` : ''}`;
    case 'redirect':
      return `redirect attempt [${ev.m || 'location'}] → ${ev.u || '(unknown)'}`;
    case 'popup':
      return `window.open() → ${ev.u || '(new window)'} [blocked]`;
    case 'fetch':
      return `fetch() → ${ev.u || '(unknown)'}`;
    case 'xhr':
      return `XHR ${ev.m || 'GET'} → ${ev.u || '(unknown)'}`;
    case 'iframe':
      return `iframe injected${ev.h ? ' [HIDDEN]' : ''} — ${ev.u || '(no src)'}`;
    case 'scriptinject':
      return `external script injected → ${ev.u || '(unknown)'}`;
    case 'inlineScriptInject':
      return `inline script block injected: ${ev.s || '(empty)'}`;
    case 'docwrite':
      return `document.write(): ${ev.s || '(empty)'}`;
    case 'eval':
      return `eval() executed: ${ev.s || '(empty)'}`;
    case 'newFunction':
      return `new Function() constructed: ${ev.s || '(empty)'}`;
    case 'createElement':
      return `createElement('${ev.u || ev.t}') called dynamically`;
    case 'cookieWrite':
      return `cookie written: ${ev.s || '(empty)'}`;
    default:
      return `${ev.t}${ev.u ? ' → ' + ev.u : ''}`;
  }
}

function evSeverity(ev: BehaviorEvent): 'high' | 'medium' | 'low' {
  if (
    ev.t === 'redirect' ||
    (ev.t === 'iframe' && ev.h) ||
    ev.t === 'eval' ||
    ev.t === 'newFunction' ||
    ev.t === 'inlineScriptInject'
  ) return 'high';
  if (
    ev.t === 'popup' ||
    ev.t === 'scriptinject' ||
    ev.t === 'docwrite' ||
    ev.t === 'timeout_fired'
  ) return 'medium';
  return 'low';
}

// ── Stages ────────────────────────────────────────────────────────────────────

interface Stage {
  id: string;
  label: string;
  activeIn: DeepScanState['stage'][];
  doneIn:   DeepScanState['stage'][];
}

const STAGES: Stage[] = [
  {
    id: 'base',
    label: 'base pattern analysis',
    activeIn: [],
    doneIn: ['fetching', 'analyzing', 'behavioral', 'done'],
  },
  {
    id: 'fetch',
    label: 'fetching page & scripts',
    activeIn: ['fetching'],
    doneIn: ['behavioral', 'done'],
  },
  {
    id: 'analyze',
    label: 'static script analysis',
    activeIn: ['fetching'],
    doneIn: ['behavioral', 'done'],
  },
  {
    id: 'behavioral',
    label: 'live behavioral check (7s)',
    activeIn: ['behavioral'],
    doneIn: ['done'],
  },
];

function StageRow({ stage, currentStage }: { stage: Stage; currentStage: DeepScanState['stage'] }) {
  const done   = stage.doneIn.includes(currentStage);
  const active = stage.activeIn.includes(currentStage);

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      {done ? (
        <span className="text-safe-500 w-5 flex-shrink-0">[✓]</span>
      ) : active ? (
        <span className="text-cyber-400 w-5 flex-shrink-0 animate-pulse">[⟳]</span>
      ) : (
        <span className="text-gray-700 w-5 flex-shrink-0">[ ]</span>
      )}
      <span className={done ? 'text-gray-400' : active ? 'text-cyber-300' : 'text-gray-700'}>
        {stage.label}
      </span>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function progressPct(stage: DeepScanState['stage']): number {
  return { idle: 5, fetching: 35, analyzing: 60, behavioral: 80, done: 100 }[stage] ?? 0;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DeepScanPanel({ state }: Props) {
  if (state.stage === 'idle') return null;

  const { stage, findings, behaviorEvents, overallRisk, htmlSize, scriptCount, fetchedJsFiles, fetchError } = state;
  const pct    = progressPct(stage);
  const isDone = stage === 'done';

  // Combine risk from both static and behavioral
  const behSeverity = severityOf(behaviorEvents);
  const riskOrder   = ['none', 'low', 'medium', 'high', 'critical'];
  const combinedRisk = riskOrder[
    Math.max(riskOrder.indexOf(overallRisk), riskOrder.indexOf(behSeverity === 'none' ? 'none' : behSeverity))
  ] as DeepScanState['overallRisk'];

  // Deduplicate behavior events for display (group by type)
  const groupedEvents: Map<string, { ev: BehaviorEvent; count: number }> = new Map();
  for (const ev of behaviorEvents) {
    const key = `${ev.t}:${ev.u || ev.s || ''}`;
    const existing = groupedEvents.get(key);
    if (existing) existing.count++;
    else groupedEvents.set(key, { ev, count: 1 });
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="border border-cyber-600 rounded-sm overflow-hidden bg-terminal-300">

        {/* Header */}
        <div className="px-4 py-2.5 border-b border-cyber-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyber-500">[deep scan]</span>
            <span className="font-mono text-xs text-gray-600">runtime threat analysis</span>
          </div>
          {isDone && combinedRisk !== 'none' && (
            <span className={`font-mono text-xs font-bold ${RISK_COLORS[combinedRisk]}`}>
              {RISK_LABELS[combinedRisk].toUpperCase()}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-terminal-400">
          <div
            className="h-full bg-cyber-500 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Stage checklist */}
        <div className="px-4 py-3 border-b border-cyber-700 space-y-1.5">
          {STAGES.map((s) => (
            <StageRow key={s.id} stage={s} currentStage={stage} />
          ))}
        </div>

        {/* Fetch error notice */}
        {fetchError && (
          <div className="px-4 py-2 border-b border-cyber-700 font-mono text-xs text-warning-400">
            [!] content fetch: {fetchError} — static analysis may be incomplete
          </div>
        )}

        {/* Stats row (shown after fetch completes) */}
        {(stage === 'behavioral' || isDone) && !fetchError && (
          <div className="px-4 py-2 border-b border-cyber-700 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-gray-600">
            <span>html: {(htmlSize / 1024).toFixed(0)} KB</span>
            <span>scripts: {scriptCount} blocks</span>
            <span>fetched: {fetchedJsFiles} JS files</span>
          </div>
        )}

        {/* Static findings */}
        {findings.length > 0 && (
          <div className="px-4 py-3 border-b border-cyber-700">
            <p className="font-mono text-xs text-gray-500 mb-2">{'>'} static analysis</p>
            <div className="space-y-2">
              {findings.map((f: ScriptFinding, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`font-mono text-xs flex-shrink-0 ${SEV_COLOR[f.severity]}`}>
                    {SEV_ICON[f.severity]}
                  </span>
                  <div className="min-w-0">
                    <span className={`font-mono text-xs font-bold ${SEV_COLOR[f.severity]}`}>
                      {f.label}
                    </span>
                    {f.count > 1 && (
                      <span className="font-mono text-xs text-gray-600 ml-1">×{f.count}</span>
                    )}
                    <p className="font-mono text-xs text-gray-500 leading-relaxed mt-0.5">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {findings.length === 0 && (stage === 'behavioral' || isDone) && (
          <div className="px-4 py-3 border-b border-cyber-700">
            <div className="flex items-center gap-2 font-mono text-xs text-safe-500">
              <span>[✓]</span>
              <span>no suspicious patterns found in page scripts</span>
            </div>
          </div>
        )}

        {/* Behavioral findings */}
        {isDone && (
          <div className="px-4 py-3">
            <p className="font-mono text-xs text-gray-500 mb-2">{'>'} behavioral (7s live observation)</p>
            {groupedEvents.size === 0 ? (
              <div className="flex items-center gap-2 font-mono text-xs text-safe-500">
                <span>[✓]</span>
                <span>no suspicious runtime behavior detected</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {Array.from(groupedEvents.values()).map(({ ev, count }, i) => {
                  const sev = evSeverity(ev);
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`font-mono text-xs flex-shrink-0 ${SEV_COLOR[sev]}`}>
                        {SEV_ICON[sev]}
                      </span>
                      <span className="font-mono text-xs text-gray-400 leading-relaxed">
                        {describeEvent(ev)}
                        {count > 1 && <span className="text-gray-600 ml-1">×{count}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Waiting on behavioral */}
        {stage === 'behavioral' && (
          <div className="px-4 py-3">
            <p className="font-mono text-xs text-gray-500 mb-2">{'>'} behavioral (7s live observation)</p>
            <div className="flex items-center gap-2 font-mono text-xs text-cyber-500 animate-pulse">
              <span>[⟳]</span>
              <span>monitoring page activity in preview...</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
