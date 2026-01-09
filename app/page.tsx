'use client';

import { useURLAnalysis } from '@/hooks/useURLAnalysis';
import Header from '@/components/Header';
import URLInput from '@/components/URLInput';
import AnalysisResults from '@/components/AnalysisResults';
import SafePreview from '@/components/SafePreview';
import Footer from '@/components/Footer';

export default function Home() {
  const { analysis, isLoading, error, analyzeURL } = useURLAnalysis();

  return (
    <div className="min-h-screen flex flex-col bg-terminal-400 grid-bg relative overflow-hidden scanlines">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
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
            <section className="max-w-5xl mx-auto animate-fadeIn">
              <div className="text-center mb-6">
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
              <div className="mt-6 bg-terminal-300 rounded-sm p-4 border border-cyber-600">
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
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
