import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Subdued Green - Primary hacker theme (less bright)
        cyber: {
          50: '#e6f5ec',
          100: '#ccebd9',
          200: '#99d7b3',
          300: '#66c38d',
          400: '#33af67',
          500: '#00b347', // Softer green (was #00ff41)
          600: '#009039',
          700: '#006d2b',
          800: '#004a1d',
          900: '#00270e',
        },
        // Dark terminal backgrounds
        terminal: {
          50: '#1a2420',
          100: '#141a17',
          200: '#0f140f',
          300: '#0d1117', // Secondary background (GitHub dark)
          400: '#0a0f0a', // Primary dark background
          500: '#060906', // Deepest background
        },
        // Electric Cyan - Links/accents
        electric: {
          50: '#e6ffff',
          100: '#ccffff',
          200: '#99ffff',
          300: '#66ffff',
          400: '#33ffff',
          500: '#00ffff', // PRIMARY electric cyan
          600: '#00cccc',
          700: '#009999',
          800: '#006666',
          900: '#003333',
        },
        // Danger Red - Warnings/errors
        danger: {
          50: '#ffe6e6',
          100: '#ffcccc',
          200: '#ff9999',
          300: '#ff6666',
          400: '#ff4d4d',
          500: '#ff3333', // PRIMARY danger red
          600: '#cc0000',
          700: '#990000',
          800: '#660000',
          900: '#330000',
        },
        // Safe Green - Success states (less bright)
        safe: {
          50: '#e6f5ef',
          100: '#ccebdf',
          200: '#99d7bf',
          300: '#66c39f',
          400: '#33af7f',
          500: '#00b35f', // Softer safe green (was #00ff80)
          600: '#008f4c',
          700: '#006b39',
          800: '#004826',
          900: '#002413',
        },
        // Warning Amber - Suspicious states (less bright)
        warning: {
          50: '#fff8e6',
          100: '#fff0cc',
          200: '#ffe199',
          300: '#ffd266',
          400: '#ffc333',
          500: '#ffb400', // Softer amber (was #ffe100)
          600: '#cc9000',
          700: '#996c00',
          800: '#664800',
          900: '#332400',
        },
        // Neutral grays
        gray: {
          50: '#f5f5f5',
          100: '#e6e6e6', // Light text on dark
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['var(--font-jetbrains)', 'Courier New', 'monospace'],
        heading: ['var(--font-orbitron)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'Courier New', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',   // 2px - very sharp
        'DEFAULT': '0.25rem', // 4px - sharp
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px - moderate (cards only)
        'xl': '0.75rem',    // 12px - rare use
        '2xl': '1rem',      // 16px - rare use
        'full': '9999px',   // For circular elements only
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 3s infinite',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '1000px' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '41%': { opacity: '1' },
          '42%': { opacity: '0.8' },
          '43%': { opacity: '1' },
          '45%': { opacity: '0.9' },
          '46%': { opacity: '1' },
        },
        'pulse-neon': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(0, 179, 71, 0.4), 0 0 10px rgba(0, 179, 71, 0.25)',
          },
          '50%': {
            boxShadow: '0 0 8px rgba(0, 179, 71, 0.5), 0 0 15px rgba(0, 179, 71, 0.35)',
          },
        },
      },
      boxShadow: {
        'neon-sm': '0 0 3px rgba(0, 179, 71, 0.3), 0 0 6px rgba(0, 179, 71, 0.2)',
        'neon': '0 0 5px rgba(0, 179, 71, 0.4), 0 0 10px rgba(0, 179, 71, 0.25)',
        'neon-lg': '0 0 8px rgba(0, 179, 71, 0.5), 0 0 15px rgba(0, 179, 71, 0.3)',
        'neon-cyan': '0 0 5px rgba(0, 255, 255, 0.35), 0 0 10px rgba(0, 255, 255, 0.2)',
        'neon-red': '0 0 5px rgba(255, 51, 51, 0.4), 0 0 10px rgba(255, 51, 51, 0.25)',
        'inner-neon': 'inset 0 0 5px rgba(0, 179, 71, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
