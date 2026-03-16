export default function Header() {
  return (
    <header className="w-full bg-terminal-300 border-b border-cyber-700 sticky top-0 z-50 relative">
      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <svg
              className="w-5 h-5 text-cyber-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm font-mono font-bold text-cyber-500 tracking-wide">
              [safespace@krinc]$
            </span>
          </a>

          {/* Navigation */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            <a href="/" className="font-mono text-xs text-gray-400 hover:text-cyber-500 px-2 py-1.5 rounded-sm hover:bg-terminal-400 transition-all">
              ~/home
            </a>
            <a href="/about" className="font-mono text-xs text-gray-400 hover:text-cyber-500 px-2 py-1.5 rounded-sm hover:bg-terminal-400 transition-all">
              ~/about
            </a>
            <a href="/contact" className="font-mono text-xs text-gray-400 hover:text-cyber-500 px-2 py-1.5 rounded-sm hover:bg-terminal-400 transition-all">
              ~/contact
            </a>
            {/* TODO: Replace href with your actual Buy Me a Coffee link once set up */}
            <a
              href="https://www.buymeacoffee.com/krinc"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 font-mono text-xs font-bold text-terminal-400 bg-cyber-500 hover:bg-cyber-600 px-3 py-1.5 rounded-sm transition-colors"
            >
              ☕ support
            </a>
            <a
              href="https://github.com/iKrinc/safespace.krinc.in"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="text-gray-500 hover:text-cyber-500 px-2 py-1.5 rounded-sm hover:bg-terminal-400 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </nav>
        </div>
        <p className="text-xs text-gray-500 text-center font-mono mt-1.5">
          {'>'} url security scanner & safe preview tool
        </p>
      </div>
    </header>
  );
}
