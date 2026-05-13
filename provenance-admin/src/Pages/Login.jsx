import { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Hardcoded credentials check
    setTimeout(() => {
      if (email.trim() === 'admin@admin.com' && password === 'admin') {
        onLogin();
      } else {
        setError('Invalid email or password. Access denied.');
        setLoading(false);
      }
    }, 600); // subtle delay for premium loading feel
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#0b0f19', fontFamily: "'Inter', sans-serif" }}>
      {/* Background ambient glowing blobs */}
      <div className="absolute w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px] top-10 left-10 pointer-events-none animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/20 blur-[120px] bottom-10 right-10 pointer-events-none" />

      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-10">
        {/* Logo/Icon area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 text-white font-bold text-2xl tracking-wider">
            P
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Admin Portal</h2>
          <p className="text-xs text-white/40 mt-1">Provenance Security Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="write admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Secure Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-white/30">
            Authorized Personnel Only • Provenance 6.0
          </p>
        </div>
      </div>
    </div>
  );
}
