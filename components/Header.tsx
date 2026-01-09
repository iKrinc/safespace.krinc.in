export default function Header() {
  return (
    <header className="w-full bg-terminal-300 border-b border-cyber-700 relative">
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            {/* Shield icon - smaller */}
            <svg
              className="w-5 h-5 text-cyber-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <h1 className="text-lg font-mono font-bold text-cyber-500 tracking-wide">
              [safespace@krinc ~]$
            </h1>
          </div>
          <p className="text-xs text-gray-400 text-center font-mono">
            URL security scanner & safe preview tool
          </p>
        </div>
      </div>
    </header>
  );
}
