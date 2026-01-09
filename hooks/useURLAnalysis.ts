import { useState, useEffect } from 'react';
import { URLAnalysisResponse } from '@/types';

interface UseURLAnalysisReturn {
  analysis: URLAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  analyzeURL: (url: string) => Promise<void>;
  reset: () => void;
}

const STORAGE_KEY = 'safespace_analysis';

export function useURLAnalysis(): UseURLAnalysisReturn {
  const [analysis, setAnalysis] = useState<URLAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setAnalysis(parsed);
        } catch (err) {
          console.error('Failed to parse stored analysis:', err);
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  // Save to session storage whenever analysis changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (analysis) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(analysis));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [analysis]);

  const analyzeURL = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 429) {
          throw new Error(
            errorData.message || 'Rate limit exceeded. Please try again later.'
          );
        }

        throw new Error(
          errorData.message || 'Failed to analyze URL. Please try again.'
        );
      }

      const data: URLAnalysisResponse = await response.json();
      setAnalysis(data);
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out after 30 seconds. Please try again.');
      } else {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      }
      console.error('Error analyzing URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    analysis,
    isLoading,
    error,
    analyzeURL,
    reset,
  };
}
