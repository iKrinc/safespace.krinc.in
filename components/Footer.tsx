export default function Footer() {
  return (
    <footer className="w-full border-t border-cyber-700 bg-terminal-300 mt-8">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-gray-400 font-mono">
            safespace is an educational tool. exercise caution with suspicious links.
          </p>
          <div className="text-xs text-gray-600 font-mono mt-1">
            [safespace {new Date().getFullYear()}] • by <span className="text-cyber-500">krinc</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
