'use client';

import { useEffect, useState } from 'react';
import { PreviewResponse } from '@/types';

import { BehaviorEvent } from '@/types';

interface SafePreviewProps {
  url: string;
  canPreview: boolean;
  onBehaviorReport?: (events: BehaviorEvent[]) => void;
}

const RENDER_WAIT = 6000; // ms to let page JS run before revealing iframe
const RENDER_STEPS = [
  'fetching page content...',
  'executing page scripts...',
  'loading dynamic content...',
  'rendering layout & styles...',
  'applying animations...',
  'loading images & fonts...',
  'finalising render...',
  'almost ready...',
];

export default function SafePreview({ url, canPreview, onBehaviorReport }: SafePreviewProps) {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderPct, setRenderPct] = useState(0);
  const [renderStatus, setRenderStatus] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Forward postMessage behavioral events from the iframe to the parent hook
  useEffect(() => {
    if (!onBehaviorReport) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'SS_BEHAVIOR') {
        onBehaviorReport(e.data.events ?? []);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onBehaviorReport]);

  useEffect(() => {
    if (canPreview) fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, canPreview]);

  const fetchPreview = async () => {
    setIsLoading(true);
    setIsRendering(false);
    setRenderPct(0);
    setRenderStatus('');
    setPreview(null);
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data: PreviewResponse = await response.json();

      if (data.success && data.content) {
        // HTML fetched — now let scripts render for RENDER_WAIT ms
        setIsLoading(false);
        setIsRendering(true);
        setRenderPct(0);

        const stepMs = RENDER_WAIT / RENDER_STEPS.length;
        RENDER_STEPS.forEach((label, i) => {
          setTimeout(() => {
            setRenderStatus(label);
            setRenderPct(Math.round(((i + 1) / RENDER_STEPS.length) * 100));
          }, stepMs * i);
        });

        await new Promise((r) => setTimeout(r, RENDER_WAIT));
        setIsRendering(false);
        setPreview(data);
        return;
      }

      setPreview(data);
    } catch {
      setPreview({
        success: false,
        url,
        error: 'network error while loading preview',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = () => {
    setIframeKey((k) => k + 1);
    fetchPreview();
  };

  const openWithWarning = () => setShowWarningModal(true);

  const confirmOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowWarningModal(false);
  };

  if (!canPreview) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="border border-danger-500 rounded-sm p-4 bg-terminal-300">
          <div className="flex items-start space-x-2">
            <span className="text-danger-500 font-mono text-sm flex-shrink-0">[X]</span>
            <div>
              <h3 className="font-mono font-bold text-danger-400 mb-1 text-sm">
                preview disabled
              </h3>
              <p className="text-gray-100 text-xs font-mono">
                {'>'} URL flagged as dangerous. preview has been disabled for your protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-terminal-300 border border-warning-500 max-w-md w-full animate-fadeIn">
            <div className="p-4 border-b border-warning-700">
              <div className="flex items-center gap-2">
                <span className="text-warning-500 font-mono text-sm font-bold">[!]</span>
                <h3 className="font-mono font-bold text-sm text-warning-400">
                  opening external site
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs font-mono text-gray-400">
                {'>'} you are about to leave safespace protection:
              </p>
              <div className="bg-terminal-400 border border-cyber-700 rounded-sm px-3 py-2">
                <p className="text-xs text-cyber-400 break-all font-mono">{url}</p>
              </div>
              <ul className="text-xs font-mono text-gray-400 space-y-1">
                <li>{'>'} verify the URL carefully before proceeding</li>
                <li>{'>'} this link opens outside safespace protection</li>
                <li>{'>'} never enter credentials on suspicious sites</li>
              </ul>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-white transition-colors"
                >
                  cancel
                </button>
                <button
                  onClick={confirmOpen}
                  className="px-4 py-1.5 text-xs font-mono font-bold bg-warning-500 hover:bg-warning-400 text-black transition-colors rounded-sm"
                >
                  open anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border border-cyber-500 rounded-sm overflow-hidden">
        {/* Browser Chrome */}
        <div className="bg-terminal-300 border-b border-cyber-600">
          {/* Top label row */}
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-cyber-700">
            <div className="flex items-center gap-2">
              <span className="text-safe-500 font-mono text-xs font-bold">[✓]</span>
              <span className="font-mono text-xs font-bold text-gray-300">safe preview</span>
            </div>
            <span className="font-mono text-xs text-cyber-600 hidden sm:block">
              {'<sandboxed>'}
            </span>
          </div>

          {/* URL + controls row */}
          <div className="px-3 py-2 flex items-center gap-2">
            {/* Action buttons */}
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="p-1.5 rounded-sm hover:bg-terminal-400 transition-colors text-gray-500 hover:text-cyber-400 disabled:opacity-40 flex-shrink-0"
              title="Reload preview"
              aria-label="Reload preview"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* URL bar */}
            <div className="flex-1 min-w-0 bg-terminal-400 border border-cyber-700 rounded-sm px-2.5 py-1">
              <p className="text-xs font-mono text-gray-400 truncate">{url}</p>
            </div>

            {/* Open in new tab */}
            <button
              onClick={openWithWarning}
              className="p-1.5 rounded-sm hover:bg-terminal-400 transition-colors text-gray-500 hover:text-warning-400 flex-shrink-0"
              title="Open in new tab"
              aria-label="Open in new tab"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="bg-terminal-400">
          {(isLoading || isRendering) ? (
            <div className="flex items-center justify-center flex-col gap-4" style={{ height: '660px' }}>
              <div className="font-mono text-cyber-500 text-sm text-center space-y-3">
                <div className="animate-pulse">[{isLoading ? '▓▓▓░░░░░░░' : '▓▓▓▓▓▓▓▓░░'}]</div>
                <div className="text-xs text-gray-400">{isRendering ? renderStatus : 'fetching page...'}</div>
              </div>
              {isRendering && (
                <div className="w-48 space-y-1.5">
                  <div className="h-1 bg-terminal-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyber-500 rounded-full transition-all duration-500"
                      style={{ width: `${renderPct}%` }}
                    />
                  </div>
                  <p className="text-center font-mono text-xs text-gray-700">{renderPct}% rendered</p>
                </div>
              )}
            </div>
          ) : preview?.success && preview.content ? (
            /*
             * sandbox="allow-scripts allow-forms"
             * - allow-scripts: enables JS loaders, CSS animations, entry animations, GSAP, etc.
             * - allow-forms: enables form elements to render correctly
             * - No allow-same-origin: iframe has opaque origin — cannot access parent cookies/storage
             * - No allow-popups: prevents the previewed page from opening new windows
             * External CSS/JS/fonts load normally via the <base> tag injected by processHTMLContent.
             */
            <iframe
              key={iframeKey}
              srcDoc={preview.content}
              className="w-full border-0 bg-white"
              style={{ height: '660px', display: 'block' }}
              title="Safe website preview"
              sandbox="allow-scripts allow-forms"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center"
              style={{ height: '660px' }}
            >
              <div className="text-center space-y-3 max-w-xs px-4">
                <div className="font-mono text-warning-500 text-xl mb-1">[!]</div>
                <p className="text-gray-200 font-mono text-sm font-bold">preview unavailable</p>
                <p className="text-gray-500 font-mono text-xs leading-relaxed">
                  {preview?.error ||
                    'this site blocked preview loading (X-Frame-Options or network error)'}
                </p>
                <button
                  onClick={openWithWarning}
                  className="mt-1 px-4 py-2 text-xs font-mono border border-warning-700 text-warning-400 hover:bg-terminal-300 hover:border-warning-500 transition-colors rounded-sm"
                >
                  open site carefully [→]
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-terminal-300 border-t border-cyber-700 px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-gray-600">
            <span className="text-safe-700">[✓] sandboxed</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">scripts isolated</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">no parent access</span>
            {preview?.sizeFormatted && (
              <>
                <span className="hidden sm:inline">|</span>
                <span>{preview.sizeFormatted}</span>
              </>
            )}
            <span className="ml-auto text-gray-700">always verify URLs before entering info</span>
          </div>
        </div>
      </div>
    </div>
  );
}
