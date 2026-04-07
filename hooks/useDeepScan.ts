/**
 * useDeepScan — orchestrates the two-phase deep scan:
 *   Phase 1: server-side static analysis (/api/deepscan)
 *   Phase 2: client-side behavioral monitoring (iframe postMessage after 7s)
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { DeepScanState, BehaviorEvent } from '@/types';

const INITIAL: DeepScanState = {
  stage: 'idle',
  htmlSize: 0,
  scriptCount: 0,
  fetchedJsFiles: 0,
  findings: [],
  overallRisk: 'none',
  behaviorEvents: [],
};

export function useDeepScan() {
  const [state, setState] = useState<DeepScanState>(INITIAL);
  const listenerRef = useRef<((e: MessageEvent) => void) | null>(null);

  const startDeepScan = useCallback(async (url: string) => {
    // Reset
    setState({ ...INITIAL, stage: 'fetching' });

    // ── Phase 1: static analysis ──────────────────────────────────────────
    let staticDone = false;
    const staticPromise = fetch('/api/deepscan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then((r) => r.json())
      .then((data) => {
        staticDone = true;
        setState((prev) => ({
          ...prev,
          stage: prev.stage === 'done' ? 'done' : 'behavioral',
          htmlSize: data.htmlSize ?? 0,
          scriptCount: data.scriptCount ?? 0,
          fetchedJsFiles: data.fetchedJsFiles ?? 0,
          findings: data.findings ?? [],
          overallRisk: data.overallRisk ?? 'none',
          fetchError: data.fetchError,
        }));
      })
      .catch(() => {
        staticDone = true;
        setState((prev) => ({
          ...prev,
          stage: prev.stage === 'done' ? 'done' : 'behavioral',
          fetchError: 'static analysis failed',
        }));
      });

    // ── Phase 2: behavioral (iframe sends postMessage after 7s) ──────────
    // Remove any existing listener
    if (listenerRef.current) {
      window.removeEventListener('message', listenerRef.current);
    }

    const listener = (e: MessageEvent) => {
      if (e.data?.type !== 'SS_BEHAVIOR') return;
      const events: BehaviorEvent[] = e.data.events ?? [];
      window.removeEventListener('message', listener);
      listenerRef.current = null;

      setState((prev) => ({
        ...prev,
        stage: 'done',
        behaviorEvents: events,
      }));
    };

    listenerRef.current = listener;
    window.addEventListener('message', listener);

    // Await static analysis
    await staticPromise;

    // Safety net: if behavioral never fires within 10s, mark done
    setTimeout(() => {
      if (!staticDone) return; // shouldn't happen but guard
      setState((prev) => {
        if (prev.stage !== 'done') {
          window.removeEventListener('message', listener);
          listenerRef.current = null;
          return { ...prev, stage: 'done' };
        }
        return prev;
      });
    }, 10_000);
  }, []);

  const reset = useCallback(() => {
    if (listenerRef.current) {
      window.removeEventListener('message', listenerRef.current);
      listenerRef.current = null;
    }
    setState(INITIAL);
  }, []);

  return { deepScan: state, startDeepScan, reset };
}
