'use client';

import { useState } from 'react';
import { URLAnalysisResponse, SafetyLevel } from '@/types';

interface AnalysisResultsProps {
  analysis: URLAnalysisResponse;
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getSafetyColor = (level: SafetyLevel) => {
    switch (level) {
      case SafetyLevel.SAFE:
        return {
          bg: 'bg-terminal-300',
          border: 'border-safe-500',
          text: 'text-safe-400',
          badge: 'bg-safe-500',
          shadow: 'shadow-neon',
        };
      case SafetyLevel.SUSPICIOUS:
        return {
          bg: 'bg-terminal-300',
          border: 'border-warning-500',
          text: 'text-warning-400',
          badge: 'bg-warning-500',
          shadow: 'shadow-neon',
        };
      case SafetyLevel.DANGEROUS:
        return {
          bg: 'bg-terminal-300',
          border: 'border-danger-500',
          text: 'text-danger-400',
          badge: 'bg-danger-500',
          shadow: 'shadow-neon-red',
        };
    }
  };

  const colors = getSafetyColor(analysis.safetyLevel);

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn">
      <div
        className={`border rounded-sm overflow-hidden ${colors.border} ${colors.bg}`}
      >
        {/* Header with Badge */}
        <div className="p-4 border-b border-current">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <div
                className={`px-3 py-1 rounded-sm ${colors.badge} text-terminal-400 font-mono font-bold text-xs`}
              >
                {analysis.safetyLevel}
              </div>
              <div className={`text-lg font-mono font-bold ${colors.text}`}>
                {'['}{analysis.score}/100{']'}
              </div>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`px-3 py-1 ${colors.text} font-mono text-xs focus:outline-none border border-current rounded-sm hover:bg-terminal-400 transition-all`}
              aria-expanded={showDetails}
              aria-controls="security-checks"
            >
              {showDetails ? '[-] hide details' : '[+] show details'}
            </button>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-4">
          <p className={`text-sm leading-relaxed font-mono ${colors.text}`}>
            {'>'} {analysis.explanation}
          </p>
        </div>

        {/* Security Checks Details */}
        {showDetails && (
          <div
            id="security-checks"
            className="px-4 pb-4 space-y-2 animate-slideDown"
          >
            <h3 className={`font-mono font-bold text-sm mb-3 ${colors.text}`}>
              security checks:
            </h3>
            {analysis.checks.map((check, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 p-3 rounded-sm border ${
                  check.passed
                    ? 'bg-terminal-400 border-safe-600'
                    : 'bg-terminal-400 border-danger-600'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {check.passed ? (
                    <span className="font-mono text-xs text-safe-500">[✓]</span>
                  ) : (
                    <span className="font-mono text-xs text-danger-500">[X]</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4
                      className={`font-mono font-bold text-xs ${
                        check.passed ? 'text-safe-400' : 'text-danger-400'
                      }`}
                    >
                      {check.name}
                    </h4>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-sm font-mono border ${
                        check.severity === 'high'
                          ? 'border-danger-500 text-danger-400'
                          : check.severity === 'medium'
                          ? 'border-warning-500 text-warning-400'
                          : 'border-gray-600 text-gray-400'
                      }`}
                    >
                      {check.severity}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-100">
                    {check.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-600 font-mono">
            {'>'} analyzed: {new Date(analysis.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
