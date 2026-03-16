export default function Footer() {
  return (
    <footer className="w-full border-t border-cyber-700 bg-terminal-300 mt-8" role="contentinfo">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="font-mono font-bold text-cyber-500 text-sm mb-2">[safespace]</div>
            <p className="font-mono text-xs text-gray-500 leading-relaxed mb-3">
              free url security scanner. no data stored. no tracking. just truth.
            </p>
            <a
              href="https://github.com/sponsors/iKrinc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs font-bold bg-[#FFDD00] text-[#000] hover:opacity-90 px-2.5 py-1.5 rounded-sm transition-opacity"
            >
              ❤️ sponsor()
            </a>
          </div>

          {/* Security Checks */}
          <div>
            <div className="font-mono text-gray-400 text-xs mb-2">security_checks[]</div>
            <ul className="font-mono text-xs text-gray-600 space-y-1">
              <li>[✓] HTTPS validation</li>
              <li>[✓] phishing detection</li>
              <li>[✓] domain analysis</li>
              <li>[✓] suspicious patterns</li>
              <li>[✓] url length check</li>
              <li>[✓] sandboxed preview</li>
            </ul>
          </div>

          {/* Links */}
          <nav aria-label="Site links">
            <div className="font-mono text-gray-400 text-xs mb-2">navigation[]</div>
            <ul className="font-mono text-xs space-y-1.5">
              <li><a href="/" className="text-gray-500 hover:text-cyber-500 transition-colors">~/home</a></li>
              <li><a href="/about" className="text-gray-500 hover:text-cyber-500 transition-colors">~/about</a></li>
              <li><a href="/contact" className="text-gray-500 hover:text-cyber-500 transition-colors">~/contact</a></li>
              <li>
                <a
                  href="https://github.com/iKrinc/safespace.krinc.in/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-danger-400 transition-colors"
                >
                  report_issue() ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/iKrinc/safespace.krinc.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-cyber-500 transition-colors"
                >
                  github() ↗
                </a>
              </li>
            </ul>
          </nav>

          {/* Made by */}
          <div>
            <div className="font-mono text-gray-400 text-xs mb-2">made_by[]</div>
            <p className="font-mono text-xs text-gray-500 mb-2 leading-relaxed">
              built with next.js 14. open-source. free forever.
            </p>
            <a
              href="https://krinc.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-cyber-500 hover:underline"
            >
              krinc.in ↗
            </a>
            <div className="mt-2">
              <a
                href="https://crawlix.krinc.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-gray-600 hover:text-cyber-500 transition-colors border border-cyber-800 hover:border-cyber-700 px-2 py-1 rounded-sm"
              >
                crawlix ↗
              </a>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-cyber-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-xs text-gray-600">
            [safespace {new Date().getFullYear()}] • by <span className="text-cyber-500">krinc</span> • educational tool
          </p>
          <div className="flex items-center gap-3 font-mono text-xs text-gray-600">
            <a href="/contact" className="hover:text-cyber-500 transition-colors">contact</a>
            <span className="text-gray-700">|</span>
            <a
              href="https://github.com/iKrinc/safespace.krinc.in/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-danger-400 transition-colors"
            >
              report issue
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
