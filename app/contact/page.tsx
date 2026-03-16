import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | SafeSpace',
  description: 'Get in touch with the SafeSpace team. Report security issues, suggest features, or ask questions about our free URL security scanner.',
  alternates: { canonical: 'https://safespace.krinc.in/contact' },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="font-mono text-cyber-500 text-sm mb-3">[safespace@krinc ~]$ contact --help</div>
          <h1 className="text-3xl font-mono font-bold text-cyber-500 mb-3">get_in_touch()</h1>
          <p className="text-gray-400 font-mono text-sm">
            {'>'} found a bug? have a question? just want to say hi?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Email */}
          <div className="bg-terminal-300 border border-cyber-700 hover:border-cyber-500 rounded-sm p-5 transition-all">
            <div className="font-mono text-cyber-500 text-xs mb-2">[01] email</div>
            <h2 className="font-mono font-bold text-white mb-2">General Inquiries</h2>
            <p className="text-gray-400 font-mono text-xs mb-3 leading-relaxed">
              For partnerships, feedback, or general questions.
            </p>
            {/* TODO: Replace with a krinc.in email once set up */}
            <a
              href="mailto:hello@krinc.in"
              className="text-cyber-500 font-mono text-xs hover:underline break-all"
            >
              hello@krinc.in
            </a>
          </div>

          {/* Report Bug */}
          <div className="bg-terminal-300 border border-cyber-700 hover:border-danger-500 rounded-sm p-5 transition-all">
            <div className="font-mono text-danger-400 text-xs mb-2">[02] bug_report</div>
            <h2 className="font-mono font-bold text-white mb-2">Report an Issue</h2>
            <p className="text-gray-400 font-mono text-xs mb-3 leading-relaxed">
              Something broken? Open a GitHub issue with details.
            </p>
            <a
              href="https://github.com/iKrinc/safespace.krinc.in/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold text-terminal-400 bg-danger-500 hover:bg-danger-600 px-3 py-1.5 rounded-sm transition-colors"
            >
              [!] open issue on github
            </a>
          </div>

          {/* Feature Request */}
          <div className="bg-terminal-300 border border-cyber-700 hover:border-electric-500 rounded-sm p-5 transition-all">
            <div className="font-mono text-electric-500 text-xs mb-2">[03] feature_request</div>
            <h2 className="font-mono font-bold text-white mb-2">Suggest a Feature</h2>
            <p className="text-gray-400 font-mono text-xs mb-3 leading-relaxed">
              Have an idea to make SafeSpace better?
            </p>
            <a
              href="https://github.com/iKrinc/safespace.krinc.in/issues/new?labels=enhancement"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold text-electric-500 border border-electric-500 hover:bg-electric-500/10 px-3 py-1.5 rounded-sm transition-colors"
            >
              [+] suggest feature
            </a>
          </div>

          {/* GitHub */}
          <div className="bg-terminal-300 border border-cyber-700 hover:border-safe-500 rounded-sm p-5 transition-all">
            <div className="font-mono text-safe-500 text-xs mb-2">[04] github</div>
            <h2 className="font-mono font-bold text-white mb-2">Star on GitHub</h2>
            <p className="text-gray-400 font-mono text-xs mb-3 leading-relaxed">
              Open-source and free. Stars help others discover it.
            </p>
            <a
              href="https://github.com/iKrinc/safespace.krinc.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold text-safe-500 border border-safe-500 hover:bg-safe-500/10 px-3 py-1.5 rounded-sm transition-colors"
            >
              [★] view repository
            </a>
          </div>
        </div>

        {/* Support Banner */}
        <div className="bg-terminal-300 border-2 border-cyber-600 rounded-sm p-6 text-center mb-8">
          <div className="font-mono text-cyber-500 text-sm mb-2">{'// support development'}</div>
          <h2 className="font-mono font-bold text-white text-lg mb-2">[support_us()]</h2>
          <p className="text-gray-400 font-mono text-xs mb-4 max-w-sm mx-auto leading-relaxed">
            SafeSpace is free and always will be. If it helped you stay safe online,
            consider buying a coffee to keep the servers running.
          </p>
          <a
            href="https://github.com/sponsors/iKrinc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-sm font-bold bg-[#FFDD00] text-[#000] hover:opacity-90 px-5 py-2.5 rounded-sm transition-opacity"
          >
            ❤️ sponsor()
          </a>
        </div>

        <div className="text-center">
          <Link href="/" className="text-gray-500 hover:text-cyber-500 font-mono text-xs transition-colors">
            {'<'} back to safespace
          </Link>
        </div>
    </div>
  );
}
