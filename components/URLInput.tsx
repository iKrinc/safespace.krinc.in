'use client';

import { useState, useEffect } from 'react';

interface URLInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export default function URLInput({ onAnalyze, isLoading, initialValue }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  // Populate URL from initialValue prop (e.g., from session storage)
  useEffect(() => {
    if (initialValue) {
      setUrl(initialValue);
    }
  }, [initialValue]);

  const normalizeURL = (value: string): string => {
    let normalized = value.trim();

    // If it doesn't have a protocol, add https://
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized;
    }

    return normalized;
  };

  const validateURL = (value: string): boolean => {
    if (!value.trim()) {
      setError('Please enter a URL');
      return false;
    }

    try {
      const normalized = normalizeURL(value);
      new URL(normalized);
      setError('');
      return true;
    } catch {
      setError('Please enter a valid URL (e.g., youtube.com or https://youtube.com)');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateURL(url)) {
      const normalized = normalizeURL(url);
      onAnalyze(normalized);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);

    if (error && value.trim()) {
      setError('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative group">
          {/* Terminal prompt symbol */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-600 group-focus-within:text-cyber-500 transition-colors font-mono text-sm">
            {'>'}
          </div>

          <input
            type="text"
            value={url}
            onChange={handleInputChange}
            placeholder="Enter URL (e.g., youtube.com or https://example.com)..."
            disabled={isLoading}
            className={`w-full pl-8 pr-4 py-2.5 text-sm font-mono rounded-sm transition-all duration-200 border
              ${
                error
                  ? 'border-danger-500 focus:border-danger-400 bg-terminal-300 text-danger-400'
                  : 'border-cyber-600 focus:border-cyber-500 bg-terminal-300 text-gray-100 hover:border-cyber-500'
              }
              ${isLoading ? 'bg-terminal-400 cursor-not-allowed opacity-50' : ''}
              focus:outline-none focus:ring-1
              ${error ? 'focus:ring-danger-500' : 'focus:ring-cyber-500'}
              placeholder-gray-600
            `}
            aria-label="URL input"
            aria-invalid={!!error}
            aria-describedby={error ? 'url-error' : undefined}
          />
        </div>

        {error && (
          <div
            id="url-error"
            className="flex items-start space-x-2 text-danger-400 bg-terminal-300 border border-danger-500 rounded-sm p-2 animate-slideDown"
            role="alert"
          >
            <span className="font-mono text-danger-500 flex-shrink-0 text-xs">[!]</span>
            <p className="text-xs font-mono">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className={`w-full px-4 py-2.5 text-sm font-mono font-bold rounded-sm
            transition-all duration-200 border
            ${
              isLoading || !url.trim()
                ? 'bg-terminal-400 text-gray-600 cursor-not-allowed border-gray-700'
                : 'bg-cyber-500 text-terminal-400 hover:bg-cyber-400 border-cyber-500 active:scale-[0.98]'
            }
            focus:outline-none focus:ring-1 focus:ring-cyber-500
          `}
          aria-label={isLoading ? 'Analyzing URL' : 'Analyze URL'}
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2 relative font-mono">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>analyzing...</span>
            </span>
          ) : (
            <span>scan url</span>
          )}
        </button>
      </form>
    </div>
  );
}
