'use client';

import { useEffect, useState, useRef } from 'react';
import { PreviewResponse } from '@/types';

interface SafePreviewProps {
  url: string;
  canPreview: boolean;
}

type ViewMode = 'desktop' | 'mobile';

export default function SafePreview({ url, canPreview }: SafePreviewProps) {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useIframe, setUseIframe] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (canPreview) {
      fetchPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, canPreview]);

  // Detect user's device
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setViewMode(isMobile ? 'mobile' : 'desktop');
  }, []);

  const fetchPreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data: PreviewResponse = await response.json();
      setPreview(data);

      if (!data.success) {
        setUseIframe(true);
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error);
      setUseIframe(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  const handleOpenInNewTab = () => {
    setShowWarningModal(true);
  };

  const confirmOpenInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowWarningModal(false);
  };

  const getIframeDimensions = () => {
    if (viewMode === 'mobile') {
      return {
        width: 375,
        height: 667,
      };
    }
    return {
      width: '100%',
      height: 600,
    };
  };

  if (!canPreview) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="border border-danger-500 rounded-sm p-4 bg-terminal-300">
          <div className="flex items-start space-x-2">
            <span className="text-danger-500 font-mono text-sm flex-shrink-0">[X]</span>
            <div>
              <h3 className="font-mono font-bold text-danger-400 mb-1 text-sm">
                preview not available
              </h3>
              <p className="text-gray-100 text-xs font-mono">
                {`>`} this URL has been flagged as potentially dangerous. preview has been disabled
                for your protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dimensions = getIframeDimensions();

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-terminal-300 border border-warning-500 max-w-md w-full relative animate-fadeIn">
            <div className="p-4">
              <button
                onClick={() => setShowWarningModal(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-warning-500 transition-colors z-10"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start space-x-2 mb-3">
                <span className="text-warning-500 font-mono text-sm flex-shrink-0">[!]</span>
                <div>
                  <h3 className="font-mono font-bold text-sm text-warning-500 mb-2">
                    opening external site
                  </h3>
                  <p className="text-gray-100 text-xs font-mono">
                    You are about to open this URL in a new browser tab:
                  </p>
                  <div className="bg-terminal-400 border border-cyber-600 rounded-sm px-2 py-1.5 mb-2">
                    <p className="text-xs text-cyber-500 break-all font-mono">{url}</p>
                  </div>
                  <div className="bg-warning-900/20 border border-warning-600 rounded-sm p-2">
                    <p className="text-xs text-cyber-500 break-all font-mono">
                      This may expose you to security risks.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-cyber-500">
                      <li>{`>`} verify URL carefully before proceeding.</li>
                      <li>{`>`} this link opens outside safespace protection.</li>
                      <li>{`>`} exercise caution and trust your instincts.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="px-3 py-1.5 text-xs font-mono text-gray-300 hover:text-white transition-colors"
                >
                  cancel
                </button>
                <button
                  onClick={confirmOpenInNewTab}
                  className="px-3 py-1.5 text-xs font-mono text-white bg-warning-500 hover:bg-warning-600 transition-colors rounded"
                >
                  open anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border border-cyber-500 rounded-sm overflow-hidden">
        {/* Browser Controls Bar */}
        <div className="bg-terminal-300 text-gray-100">
          {/* Top Bar - Safe Preview Mode Label */}
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-cyber-600">
            <div className="flex items-center space-x-2">
              <span className="text-safe-500 font-mono text-xs">[✓]</span>
              <span className="font-mono font-bold text-xs">safe preview</span>
            </div>
            <span className="text-xs text-cyber-500 hidden sm:inline font-mono">
              {'<sandboxed>'}
            </span>
          </div>

          {/* Controls Bar - Responsive */}
          <div className="px-2 md:px-3 py-1.5 md:py-2">
            {/* Mobile Layout (< 640px) */}
            <div className="flex sm:hidden items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReload}
                  className="p-2 hover:bg-terminal-400 rounded-sm transition-colors"
                  title="Reload"
                  aria-label="Reload preview"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleOpenInNewTab}
                  className="p-2 hover:bg-neutral-800 rounded transition-colors"
                  title="Open in New Tab"
                  aria-label="Open in new tab"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-1 bg-neutral-800 rounded p-0.5">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'desktop' ? 'bg-neutral-700 text-white' : 'text-neutral-400'
                  }`}
                  title="Desktop"
                  aria-label="Desktop view"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'mobile' ? 'bg-neutral-700 text-white' : 'text-neutral-400'
                  }`}
                  title="Mobile"
                  aria-label="Mobile view"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop Layout (>= 640px) */}
            <div className="hidden sm:flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReload}
                  className="p-2 hover:bg-neutral-800 rounded transition-colors"
                  title="Reload (Reset to original URL)"
                  aria-label="Reload preview"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleOpenInNewTab}
                  className="p-2 hover:bg-neutral-800 rounded transition-colors"
                  title="Open in New Tab"
                  aria-label="Open in new tab"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 max-w-md">
                <div className="bg-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-300 truncate">
                  {url}
                </div>
              </div>

              <div className="flex items-center gap-1 bg-neutral-800 rounded p-1">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'desktop'
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Desktop View"
                  aria-label="Desktop view"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'mobile'
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Mobile View"
                  aria-label="Mobile view"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="bg-terminal-400">
          {isLoading ? (
            <div
              className="flex items-center justify-center bg-terminal-400"
              style={{
                height:
                  typeof dimensions.height === 'number'
                    ? `${dimensions.height}px`
                    : dimensions.height,
              }}
            >
              <div className="text-center space-y-3 px-4">
                <div className="font-mono text-cyber-500 text-sm animate-pulse">
                  <div className="mb-2">[███████████{'>'} ]</div>
                  <div>loading preview...</div>
                </div>
              </div>
            </div>
          ) : preview?.success && preview.content ? (
            <div className="p-4">
              <div className={`relative ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'}`}>
                {viewMode === 'mobile' ? (
                  // Mobile View with Device Frame
                  <div
                    className="relative bg-terminal-300 shadow-2xl overflow-hidden mx-auto border border-cyber-600"
                    style={{
                      width: '360px',
                      height: '667px',
                      borderRadius: '32px',
                    }}
                  >
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-terminal-300 rounded-b-3xl z-10"></div>

                    {/* Screen - iframe takes full device dimensions */}
                    <div
                      className="relative bg-terminal-400 rounded-3xl overflow-hidden"
                      style={{
                        width: '375px',
                        height: '667px',
                      }}
                    >
                      {iframeLoading && (
                        <div className="absolute inset-0 bg-terminal-400 flex items-center justify-center z-20">
                          <div className="font-mono text-cyber-500 text-xs animate-pulse">
                            <div className="mb-1">[████{'>'} ]</div>
                            <div>loading...</div>
                          </div>
                        </div>
                      )}
                      <iframe
                        srcDoc={preview.content}
                        className="w-full h-full border-0 bg-white"
                        title="Website preview"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        referrerPolicy="no-referrer"
                        onLoad={handleIframeLoad}
                      />
                    </div>
                  </div>
                ) : (
                  // Desktop View - Full width
                  <iframe
                    srcDoc={preview.content}
                    className="w-full rounded shadow-lg border border-cyber-600 bg-white"
                    style={{ height: '600px' }}
                    title="Website preview"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="mt-2 text-xs text-gray-400 font-mono text-center">
                Content size: {preview.sizeFormatted} | Original CSS & Images | JS sandboxed
              </div>
            </div>
          ) : useIframe ? (
            <div className="p-2 md:p-4 flex justify-center items-start bg-terminal-400 min-h-[400px] relative">
              {viewMode === 'mobile' ? (
                // Mobile View with Device Frame
                <div
                  className="relative bg-terminal-300 shadow-2xl overflow-hidden mx-auto border border-cyber-600"
                  style={{
                    width: '295px',
                    height: '603px',
                    borderRadius: '32px',
                    padding: '12px',
                  }}
                >
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-terminal-300 rounded-b-3xl z-10"></div>

                  {/* Screen - perfectly matches frame with no overflow */}
                  <div
                    className="relative bg-terminal-400 rounded-3xl overflow-hidden"
                    style={{
                      width: '271px', // 295 - 24 (12px padding on each side)
                      height: '579px', // 603 - 24 (12px padding on each side)
                    }}
                  >
                    {iframeLoading && (
                      <div className="absolute inset-0 bg-terminal-400 flex items-center justify-center z-20">
                        <div className="font-mono text-cyber-500 text-xs animate-pulse">
                          <div className="mb-1">[████{'>'} ]</div>
                          <div>loading...</div>
                        </div>
                      </div>
                    )}
                    <iframe
                      key={iframeKey}
                      ref={iframeRef}
                      src={url}
                      sandbox="allow-same-origin allow-scripts allow-forms"
                      className="border-0 bg-white"
                      title="Safe preview"
                      referrerPolicy="no-referrer"
                      onLoad={handleIframeLoad}
                      style={{
                        width: '375px',
                        height: '812px',
                        transform: 'scale(0.7227)', // 271/375 = 0.7227 for perfect fit
                        transformOrigin: '0 0',
                      }}
                    />
                  </div>
                </div>
              ) : (
                // Desktop View
                <div className="w-full bg-terminal-400 rounded-sm border border-cyber-600 overflow-hidden relative">
                  {iframeLoading && (
                    <div
                      className="absolute inset-0 bg-terminal-400 flex items-center justify-center z-20"
                      style={{ height: `${dimensions.height}px` }}
                    >
                      <div className="font-mono text-cyber-500 text-sm animate-pulse">
                        <div className="mb-2">[███████████{'>'} ]</div>
                        <div>loading preview...</div>
                      </div>
                    </div>
                  )}
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={url}
                    sandbox="allow-same-origin allow-scripts allow-forms"
                    className="w-full border-0 bg-white"
                    style={{ height: `${dimensions.height}px` }}
                    title="Safe preview"
                    referrerPolicy="no-referrer"
                    onLoad={handleIframeLoad}
                  />
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-center bg-terminal-400"
              style={{
                height:
                  typeof dimensions.height === 'number'
                    ? `${dimensions.height}px`
                    : dimensions.height,
              }}
            >
              <div className="text-center space-y-2 px-4">
                <div className="text-danger-500 font-mono text-2xl mb-2">[X]</div>
                <p className="text-gray-100 font-mono text-sm font-bold">preview not available</p>
                <p className="text-gray-400 font-mono text-xs">
                  {preview?.error || 'unable to load preview'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Notice */}
        <div className="bg-terminal-400 border-t border-cyber-600 px-3 py-2">
          <div className="flex items-start gap-1.5 text-xs text-gray-100">
            <span className="text-cyber-500 font-mono flex-shrink-0">[i]</span>
            <div className="font-mono">
              <p className="font-bold mb-1 text-cyber-500 text-xs">preview info:</p>
              <ul className="text-xs space-y-0.5 text-gray-400">
                <li>{'>'} reload resets to the original URL</li>
                <li>{'>'} open link opens site in new browser tab with warning</li>
                <li>{'>'} some websites block iframe embedding (blank is normal)</li>
                <li>{'>'} SPAs may not support back navigation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-terminal-300 border-t border-cyber-700 text-gray-100 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-safe-500 flex-shrink-0">[✓]</span>
            <span className="text-xs">
              sandboxed and isolated. always verify URLs before entering personal information.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
