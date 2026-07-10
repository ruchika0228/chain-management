import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';

/* ── Animated background ─────────────────────────────────── */
function BgCanvas({ theme }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let id, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const orbs = [
      { x: 0.15, y: 0.25, r: 360, color: '16,185,129',  s: 0.0004 },
      { x: 0.8,  y: 0.2,  r: 280, color: '5,150,105',   s: 0.0006 },
      { x: 0.6,  y: 0.8,  r: 320, color: '52,211,153',  s: 0.0003 },
    ];
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const opacity = theme === 'dark' ? 0.15 : 0.04;
      orbs.forEach((o, i) => {
        const cx = (o.x + Math.sin(t * o.s + i) * 0.1) * canvas.width;
        const cy = (o.y + Math.cos(t * o.s + i * 1.5) * 0.08) * canvas.height;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
        g.addColorStop(0, `rgba(${o.color},${opacity})`);
        g.addColorStop(1, `rgba(${o.color},0)`);
        ctx.beginPath(); ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, [theme]);
  return <canvas ref={ref} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />;
}

/* ── Feature chip ────────────────────────────────────────── */
const Chip = ({ icon, label, theme }) => {
  const isDark = theme === 'dark';
  return (
    <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
      <span className="text-emerald-500 font-bold">{icon}</span>
      <span>{label}</span>
    </div>
  );
};

export default function TaskLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  if (user) {
    if (user.role === 'employee') return <Navigate to="/employee" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const u = await login(form.email, form.password, '/auth/employee-login');
      if (u.role === 'employee') navigate('/employee');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <BgCanvas theme={theme} />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`
            : `linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Header Utilities */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <Link to="/" className={`inline-flex items-center gap-2 text-sm mb-6 transition-colors group ${
          isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'
        }`}>
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </Link>

        {/* Card */}
        <div className={`border rounded-3xl p-8 shadow-2xl transition-all duration-300 ${
          isDark ? 'bg-slate-900/60 backdrop-blur-2xl border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex mb-5">
              <div className="absolute inset-0 bg-emerald-600/20 blur-2xl rounded-full scale-150" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 border ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Employee Portal
            </div>

            <h1 className="text-2xl font-bold tracking-tight">Employee Task Portal</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to log and track your work</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="employee@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-455">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className={`w-full border rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                  {showPw
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Signing in…</>
                : 'Sign in to Employee Portal'
              }
            </button>
          </form>

          {/* Info box */}
          <div className={`mt-6 p-4 rounded-2xl border ${
            isDark ? 'bg-emerald-950/20 border-emerald-900 text-slate-400' : 'bg-emerald-50/50 border-emerald-100 text-slate-700'
          }`}>
            <p className="text-xs font-semibold text-emerald-500 mb-3 uppercase tracking-wide">Employee Workspace</p>
            <div className="space-y-2">
              <Chip icon="✓" label="Log and update your daily tasks" theme={theme} />
              <Chip icon="✓" label="Track your attendance status" theme={theme} />
              <Chip icon="✓" label="Quick dashboard for daily updates" theme={theme} />
              <Chip icon="✗" label="Staff operations require Staff Login" theme={theme} />
            </div>
          </div>

          {/* Access badge */}
          <div className={`mt-5 pt-5 border-t flex items-center justify-center gap-2 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isDark ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
            }`}>
              👤 Employee Account Authorization
            </span>
          </div>
        </div>

        {/* Bottom link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Are you a staff member?{' '}
          <Link to="/login" className="text-violet-500 hover:text-violet-600 font-semibold transition-colors">
            Go to Staff Portal →
          </Link>
        </p>
      </div>
    </div>
  );
}
