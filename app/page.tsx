'use client';

import { useURLAnalysis } from '@/hooks/useURLAnalysis';
import URLInput from '@/components/URLInput';
import AnalysisResults from '@/components/AnalysisResults';
import SafePreview from '@/components/SafePreview';

const safeFaqs = [
  { q: 'is safespace really free?', a: 'yes — completely. no paywalls, no accounts, no credit card. free for everyone, always.' },
  { q: 'does safespace store the urls i scan?', a: 'no. urls are analyzed on our server but never logged or stored. rate limiting uses temporary ip tracking that auto-expires after 60 seconds.' },
  { q: 'why do some websites not show in the preview?', a: 'most modern sites block iframe embedding (X-Frame-Options / CSP). this is expected behavior. the security analysis still works — preview is supplementary.' },
  { q: 'can safespace detect all malicious links?', a: 'no automated tool is 100% accurate. use safespace as one layer of defense alongside caution and common sense. when in doubt, don\'t click.' },
  { q: 'is safespace open source?', a: 'yes. full source code is available on github. audit every line, contribute improvements, or report issues directly.' },
];

export default function Home() {
  const { analysis, isLoading, error, analyzeURL } = useURLAnalysis();

  return (
    <div className="overflow-hidden scanlines">
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="space-y-8">
          {/* URL Input Section */}
          <section>
            <URLInput
              onAnalyze={analyzeURL}
              isLoading={isLoading}
              initialValue={analysis?.url}
            />

            {/* Error Display */}
            {error && (
              <div className="max-w-3xl mx-auto mt-4">
                <div className="bg-terminal-300 border border-danger-500 rounded-sm p-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-danger-500 font-mono text-sm flex-shrink-0">[!]</span>
                    <div>
                      <h3 className="font-mono font-bold text-danger-400 text-sm">Error</h3>
                      <p className="text-gray-100 text-xs mt-1 font-mono">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Analysis Results Section */}
          {analysis && (
            <section className="animate-fadeIn">
              <h2 className="text-base font-mono font-bold text-cyber-500 text-center mb-4">
                {'['} analysis results {']'}
              </h2>
              <AnalysisResults analysis={analysis} />
            </section>
          )}

          {/* Safe Preview Section */}
          {analysis && (
            <section className="animate-fadeIn">
              <h2 className="text-base font-mono font-bold text-cyber-500 text-center mb-4">
                {'['} safe preview {']'}
              </h2>
              <SafePreview
                url={analysis.url}
                canPreview={analysis.canPreview}
              />
            </section>
          )}

          {/* Getting Started Info (shown when no analysis) */}
          {!analysis && !isLoading && !error && (
            <section className="max-w-5xl mx-auto animate-fadeIn space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-mono font-bold text-cyber-500 mb-2">
                  {'['} how it works {']'}
                </h2>
                <p className="text-sm text-gray-400 font-mono">
                  {'>'} comprehensive security analysis in three steps
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="group relative bg-terminal-300 rounded-sm p-4 border border-cyber-600 hover:border-cyber-500 transition-all duration-300">
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyber-500 text-terminal-400 rounded-sm flex items-center justify-center font-mono font-bold text-xs">
                    1
                  </div>
                  <div className="text-center mb-3">
                    <span className="text-2xl font-mono text-cyber-500">{'</>'}</span>
                  </div>
                  <h3 className="font-mono font-bold text-sm text-cyber-500 mb-2 text-center">
                    paste url
                  </h3>
                  <p className="text-gray-400 text-center leading-relaxed font-mono text-xs">
                    copy and paste any suspicious link into the input field above
                  </p>
                </div>

                <div className="group relative bg-terminal-300 rounded-sm p-4 border border-cyber-600 hover:border-safe-500 transition-all duration-300">
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-safe-500 text-terminal-400 rounded-sm flex items-center justify-center font-mono font-bold text-xs">
                    2
                  </div>
                  <div className="text-center mb-3">
                    <span className="text-2xl font-mono text-safe-500">{'[✓]'}</span>
                  </div>
                  <h3 className="font-mono font-bold text-sm text-safe-500 mb-2 text-center">
                    get analysis
                  </h3>
                  <p className="text-gray-400 text-center leading-relaxed font-mono text-xs">
                    system performs 7 security checks to identify threats instantly
                  </p>
                </div>

                <div className="group relative bg-terminal-300 rounded-sm p-4 border border-cyber-600 hover:border-electric-500 transition-all duration-300">
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-electric-500 text-terminal-400 rounded-sm flex items-center justify-center font-mono font-bold text-xs">
                    3
                  </div>
                  <div className="text-center mb-3">
                    <span className="text-2xl font-mono text-electric-500">{'[◉]'}</span>
                  </div>
                  <h3 className="font-mono font-bold text-sm text-electric-500 mb-2 text-center">
                    safe preview
                  </h3>
                  <p className="text-gray-400 text-center leading-relaxed font-mono text-xs">
                    view the site securely in sandboxed browser environment
                  </p>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="bg-terminal-300 rounded-sm p-4 border border-cyber-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-mono font-bold text-cyber-500 mb-1">[100%]</div>
                    <div className="text-xs text-gray-400 font-mono">free to use</div>
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-safe-500 mb-1">[7+]</div>
                    <div className="text-xs text-gray-400 font-mono">security checks</div>
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-electric-500 mb-1">{'[<1s]'}</div>
                    <div className="text-xs text-gray-400 font-mono">analysis time</div>
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-warning-500 mb-1">[0]</div>
                    <div className="text-xs text-gray-400 font-mono">data stored</div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-base font-mono font-bold text-cyber-500 mb-1">
                    {'['} faq {']'}
                  </h2>
                  <p className="text-xs text-gray-500 font-mono">{'>'} frequently asked questions</p>
                </div>
                <div className="space-y-3">
                  {safeFaqs.map((faq, i) => (
                    <div key={i} className="bg-terminal-300 border border-cyber-700 rounded-sm p-4">
                      <p className="font-mono font-bold text-white text-xs mb-1.5">{`> ${faq.q}`}</p>
                      <p className="font-mono text-gray-400 text-xs leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-terminal-300 border-2 border-cyber-600 rounded-sm p-6 text-center">
                <div className="font-mono text-cyber-500 text-xs mb-2">{'// support development'}</div>
                <h2 className="font-mono font-bold text-white text-base mb-2">[safespace is free forever]</h2>
                <p className="text-gray-400 font-mono text-xs mb-4 max-w-sm mx-auto leading-relaxed">
                  no ads, no paywalls, no data harvesting. if safespace helped you stay safe,
                  consider buying a coffee to keep the project running.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href="https://github.com/sponsors/iKrinc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-sm font-bold bg-[#FFDD00] text-[#000] hover:opacity-90 px-5 py-2.5 rounded-sm transition-opacity"
                  >
                    ❤️ sponsor()
                  </a>
                  <a
                    href="https://github.com/iKrinc/safespace.krinc.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-xs font-bold text-safe-500 border border-safe-500 hover:bg-safe-500/10 px-5 py-2.5 rounded-sm transition-colors"
                  >
                    [★] star on github
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
