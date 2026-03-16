import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | SafeSpace',
  description: 'Learn about SafeSpace — a free, open-source URL security scanner built by Krinc. No data stored, no tracking, just honest security analysis.',
  alternates: { canonical: 'https://safespace.krinc.in/about' },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="font-mono text-cyber-500 text-sm mb-3">[safespace@krinc ~]$ about --verbose</div>
          <h1 className="text-3xl font-mono font-bold text-cyber-500 mb-3">about_safespace()</h1>
          <p className="text-gray-400 font-mono text-sm max-w-xl mx-auto">
            {'>'} free url security scanner. no data stored. no tracking. just truth.
          </p>
        </div>

        {/* Why */}
        <section className="mb-8">
          <div className="bg-terminal-300 border border-cyber-700 rounded-sm p-6">
            <div className="font-mono text-cyber-500 text-xs mb-3">{'// origin story'}</div>
            <h2 className="font-mono font-bold text-white text-lg mb-4">why_we_built_this()</h2>
            <div className="space-y-3 text-gray-400 font-mono text-sm leading-relaxed">
              <p>
                {'>'} suspicious links are everywhere — phishing emails, shady DMs, fake login pages.
                most people click without thinking.
              </p>
              <p>
                {'>'} existing tools were either paywalled, required sign-ups, or sent your data
                to third-party servers. that felt wrong.
              </p>
              <p>
                {'>'} safespace was built to give everyone a fast, honest, private way to check
                a url before clicking — no account, no cost, no nonsense.
              </p>
            </div>
          </div>
        </section>

        {/* Security Checks */}
        <section className="mb-8">
          <div className="font-mono text-cyber-500 text-xs mb-3 text-center">{'// what we check'}</div>
          <h2 className="font-mono font-bold text-white text-lg mb-4 text-center">security_checks[]</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {checks.map((check, i) => (
              <div key={i} className="bg-terminal-300 border border-cyber-700 rounded-sm p-4">
                <div className="flex items-start gap-2">
                  <span className="text-safe-500 font-mono text-xs mt-0.5">[✓]</span>
                  <div>
                    <p className="font-mono font-bold text-white text-xs">{check.title}</p>
                    <p className="text-gray-500 font-mono text-xs mt-1 leading-relaxed">{check.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-8">
          <div className="bg-terminal-300 border border-cyber-700 rounded-sm p-6">
            <div className="font-mono text-electric-500 text-xs mb-3">{'// tech stack'}</div>
            <h2 className="font-mono font-bold text-white text-lg mb-4">dependencies[]</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stack.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="text-cyber-500 font-mono text-xs">{'>'}</span>
                  <div>
                    <p className="font-mono text-white text-xs font-bold">{item.name}</p>
                    <p className="font-mono text-gray-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="mb-8">
          <div className="bg-terminal-300 border border-safe-700 rounded-sm p-6">
            <div className="font-mono text-safe-500 text-xs mb-3">{'// privacy policy (tl;dr)'}</div>
            <h2 className="font-mono font-bold text-white text-lg mb-4">privacy_guaranteed()</h2>
            <ul className="space-y-2">
              {privacyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-safe-500 font-mono text-xs mt-0.5">[✓]</span>
                  <span className="text-gray-400 font-mono text-xs leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Creator */}
        <section className="mb-8">
          <div className="bg-terminal-300 border border-cyber-700 rounded-sm p-6 text-center">
            <div className="font-mono text-cyber-500 text-xs mb-3">{'// creator'}</div>
            <div className="text-3xl mb-3">🧑‍💻</div>
            <h2 className="font-mono font-bold text-white text-lg mb-2">built_by_krinc()</h2>
            <p className="text-gray-400 font-mono text-xs mb-4 max-w-md mx-auto leading-relaxed">
              krinc builds free, open-source tools for developers and security-conscious people.
              safespace is part of the krinc.in ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://krinc.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs font-bold text-terminal-400 bg-cyber-500 hover:bg-cyber-600 px-4 py-2 rounded-sm transition-colors"
              >
                [→] visit krinc.in
              </a>
              <a
                href="https://github.com/iKrinc/safespace.krinc.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs font-bold text-cyber-500 border border-cyber-500 hover:bg-cyber-500/10 px-4 py-2 rounded-sm transition-colors"
              >
                [★] view source
              </a>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="mb-8">
          <div className="bg-terminal-300 border-2 border-cyber-600 rounded-sm p-6 text-center">
            <div className="font-mono text-cyber-500 text-xs mb-2">{'// support development'}</div>
            <h2 className="font-mono font-bold text-white text-lg mb-2">[support_us()]</h2>
            <p className="text-gray-400 font-mono text-xs mb-4 max-w-sm mx-auto leading-relaxed">
              safespace is free and always will be. if it kept you safe, consider supporting
              the project — it helps keep the lights on.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {/* TODO: Replace with your actual Buy Me a Coffee link once set up */}
              <a
                href="https://www.buymeacoffee.com/krinc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-sm font-bold bg-[#FFDD00] text-[#000] hover:opacity-90 px-5 py-2.5 rounded-sm transition-opacity"
              >
                ☕ buy_me_a_coffee()
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

        <div className="text-center">
          <Link href="/" className="text-gray-500 hover:text-cyber-500 font-mono text-xs transition-colors">
            {'<'} back to safespace
          </Link>
        </div>
    </div>
  );
}

const checks = [
  { title: 'URL Validation', desc: 'format check using WHATWG URL API' },
  { title: 'HTTPS Protocol', desc: 'detects http-only (insecure) connections' },
  { title: 'Suspicious Patterns', desc: 'ip addresses, phishing keywords, @ obfuscation' },
  { title: 'Domain Analysis', desc: 'risky TLDs, long domains, numeric domains' },
  { title: 'Domain Age', desc: 'heuristic estimation of domain trustworthiness' },
  { title: 'URL Length', desc: 'flags abnormally long urls (>200 chars)' },
  { title: 'Special Characters', desc: 'detects encoding tricks and obfuscation' },
];

const stack = [
  { name: 'Next.js 14', desc: 'react framework' },
  { name: 'TypeScript', desc: 'strict mode' },
  { name: 'Tailwind CSS', desc: 'utility styling' },
  { name: 'Zod', desc: 'input validation' },
  { name: 'LRU Cache', desc: 'rate limiting' },
  { name: 'App Router', desc: 'next.js routing' },
];

const privacyPoints = [
  'no user accounts or login required.',
  'zero analytics or tracking scripts.',
  'urls you scan are analyzed server-side but never stored or logged.',
  'no cookies used for tracking — only session state on your device.',
  'rate limiting is ip-based and auto-expires after 60 seconds.',
  'fully open-source: audit every line at github.com/iKrinc/safespace.krinc.in',
];
