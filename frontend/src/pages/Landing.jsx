import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';
import api from '../api/axios';

/* ── Reusable Spotlight Card (Coursera-style hover + click ripple) ── */
function SpotlightCard({
  children,
  onClick,
  accent = '99,102,241',
  theme,
  className = '',
  style = {},
  rippleOnClick = true,
}) {
  const ref = useRef(null);
  const [ripples, setRipples] = useState([]);
  const isDark = theme === 'dark';

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const handleClick = (e) => {
    if (rippleOnClick) {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const id = `${e.clientX}-${e.clientY}-${Date.now?.() ?? ''}-${ripples.length}`;
        const rip = { id, x: e.clientX - r.left, y: e.clientY - r.top };
        setRipples((p) => [...p, rip]);
        setTimeout(() => setRipples((p) => p.filter((x) => x.id !== id)), 700);
      }
    }
    onClick?.(e);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onClick={handleClick}
      style={{ '--lp-accent': accent, ...style }}
      className={`lp-card group relative h-full overflow-hidden rounded-3xl border
        transition-[transform,box-shadow] duration-500 ease-out will-change-transform
        hover:-translate-y-2 active:scale-[0.98] active:duration-150
        ${isDark
          ? 'bg-slate-900/60 backdrop-blur-2xl border-white/10 hover:shadow-2xl hover:shadow-black/40'
          : 'bg-white/80 backdrop-blur-2xl border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-slate-400/25'}
        ${className}`}
    >
      {/* cursor-follow spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(${accent},0.16), transparent 62%)`,
        }}
      />
      {/* click ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="lp-ripple pointer-events-none absolute rounded-full"
          style={{
            left: r.x,
            top: r.y,
            width: 24,
            height: 24,
            marginLeft: -12,
            marginTop: -12,
            background: `rgba(${accent},0.45)`,
          }}
        />
      ))}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}

/* ── Ticket Tracking Card ───────────────────────────────────── */
function TicketTracker({ theme }) {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const isDark = theme === 'dark';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    setLoading(true);
    setError('');
    setFormData(null);
    try {
      const response = await api.get(`/public/track/${ticketId.trim()}`);
      setFormData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ticket not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
      default:         return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800';
    }
  };

  const getStageText = (stage) => {
    switch (stage) {
      case 1:  return 'Admin Review';
      case 2:  return 'Super Admin Review';
      default: return 'Complete';
    }
  };

  return (
    <SpotlightCard theme={theme} accent="245,158,11" rippleOnClick={false} className="p-8">
      {/* top accent line */}
      <div className="absolute -top-px left-8 h-px w-24 bg-gradient-to-r from-amber-500 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      <span className={`self-start mb-5 px-3 py-1 rounded-full text-xs font-medium tracking-wide border ${
        isDark ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}>
        🔎 Live Tracking
      </span>

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ring-1 transition-transform duration-300 group-hover:scale-110 ${
        isDark ? 'bg-amber-500/15 ring-amber-400/20' : 'bg-amber-50 ring-amber-200'
      }`}>
        <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
      </div>

      <h2 className={`text-xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Track Your Request
      </h2>
      <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        Enter your ticket ID to instantly check the live status and approval history of any change request.
      </p>

      <form onSubmit={handleSearch} onClick={(e) => e.stopPropagation()} className="mt-auto space-y-3">
        <input
          type="text"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
          placeholder="e.g. REQ-2024-001"
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
            isDark
              ? 'bg-slate-800/60 border-white/10 text-slate-100 placeholder-slate-500 focus:border-amber-500/50'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-400'
          } focus:outline-none focus:ring-2 focus:ring-amber-500/25`}
        />
        <button
          type="submit"
          disabled={loading || !ticketId.trim()}
          className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300
                     bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40"
        >
          {loading ? 'Searching…' : 'Track Request'}
          {!loading && <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {formData && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`mt-4 p-4 rounded-xl border lp-rise ${isDark ? 'bg-slate-800/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{formData.request_id}</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(formData.status)}`}>
                {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
              </span>
            </div>
            <div className={`text-sm space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <p><strong>Title:</strong> {formData.form_details?.change_title || 'N/A'}</p>
              <p><strong>Requester:</strong> {formData.requester_name}</p>
              <p><strong>Department:</strong> {formData.department}</p>
              <p><strong>Current Stage:</strong> {getStageText(formData.current_stage)}</p>
              <p><strong>Priority:</strong> {formData.form_details?.priority || 'N/A'}</p>
              <p><strong>Submitted:</strong> {new Date(formData.created_at).toLocaleString()}</p>
              <p><strong>Last Updated:</strong> {new Date(formData.updated_at).toLocaleString()}</p>
            </div>
            {formData.approvals && formData.approvals.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Approval History:</p>
                <div className="space-y-1">
                  {formData.approvals.map((approval, idx) => (
                    <div key={idx} className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span className="font-medium">Stage {approval.stage}:</span> {approval.decision} by {approval.approver_name}
                      {approval.comments && <span className="block ml-2 italic">"{approval.comments}"</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </SpotlightCard>
  );
}

/* ── Animated Orb Background (subtle, layered over image) ───── */
function OrbCanvas({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { x: 0.2, y: 0.3, r: 320, color: '99,102,241', speed: 0.0004 },
      { x: 0.75, y: 0.25, r: 280, color: '59,130,246', speed: 0.0006 },
      { x: 0.5, y: 0.75, r: 360, color: '139,92,246', speed: 0.0003 },
      { x: 0.85, y: 0.7, r: 200, color: '16,185,129', speed: 0.0007 },
    ];

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const opacity = theme === 'dark' ? 0.1 : 0.05;
      orbs.forEach((orb, i) => {
        const cx = (orb.x + Math.sin(t * orb.speed + i) * 0.08) * canvas.width;
        const cy = (orb.y + Math.cos(t * orb.speed + i * 1.3) * 0.06) * canvas.height;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
        grad.addColorStop(0, `rgba(${orb.color},${opacity})`);
        grad.addColorStop(1, `rgba(${orb.color},0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', mixBlendMode: 'screen' }}
    />
  );
}

/* ── Navigation Card ─────────────────────────────────────────── */
function NavCard({ icon, badge, title, description, features, btnLabel, btnClass, onClick, accentClass, accent, theme }) {
  const isDark = theme === 'dark';
  return (
    <SpotlightCard theme={theme} accent={accent} onClick={onClick} className="p-8">
      {/* Top accent line */}
      <div className={`absolute -top-px left-8 h-px w-24 ${accentClass} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

      {badge && (
        <span className={`self-start mb-5 px-3 py-1 rounded-full text-xs font-medium tracking-wide border ${
          isDark ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {badge.label}
        </span>
      )}

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ring-1 transition-transform duration-300 group-hover:scale-110 ${
        isDark ? 'bg-slate-800/85 ring-white/10' : 'bg-slate-100 ring-black/5'
      }`}>
        {icon}
      </div>

      <h2 className={`text-xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>

      <ul className="space-y-2 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 group-hover:shadow-lg ${btnClass}`}
      >
        {btnLabel}
        <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
      </button>
    </SpotlightCard>
  );
}

/* ── Stats strip ─────────────────────────────────────────────── */
function Stat({ value, label, theme }) {
  const isDark = theme === 'dark';
  return (
    <div className="flex flex-col items-center gap-1 text-center px-4">
      <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
      <span className={`text-[10px] uppercase tracking-widest font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}

/* ── Main Landing Page ───────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cards = [
    {
      onClick: () => navigate('/form'),
      badge: { label: '● Public Form' },
      accent: '59,130,246',
      icon: (
        <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Create Change Request',
      description: 'Submit an IT change request using our structured guided form wizard. Open to all users.',
      features: [
        'No login required to submit',
        '8-step guided wizard',
        'Define systems, risk, and fallback',
        'Instant request tracking ID',
      ],
      btnLabel: 'Open Request Form',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10',
      accentClass: 'bg-gradient-to-r from-blue-500 to-transparent',
    },
    {
      onClick: () => navigate('/login'),
      badge: { label: '🔒 Staff Portal' },
      accent: '139,92,246',
      icon: (
        <svg className="w-7 h-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Admin / Moderator Login',
      description: 'Sign in to review, approve, reject, or moderate change requests through their respective lifecycles.',
      features: [
        'Role-based approvals (Stage 1 & 2)',
        'Comprehensive change audit logs',
        'Employee productivity tracking',
        'Manage organizational members',
      ],
      btnLabel: 'Go to Staff Portal',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/10',
      accentClass: 'bg-gradient-to-r from-purple-500 to-transparent',
    },
    {
      onClick: () => navigate('/tasks/login'),
      badge: { label: '👤 Employees' },
      accent: '16,185,129',
      icon: (
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Employee Task System',
      description: 'Log in as an employee to record daily work status, view task lists, and track your work attendance.',
      features: [
        'Quick-add daily tasks',
        'Clean, searchable task history',
        'Automated attendance tracking',
        'Employee profile management',
      ],
      btnLabel: 'Employee Login',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10',
      accentClass: 'bg-gradient-to-r from-emerald-500 to-transparent',
    },
  ];

  return (
    <div className={`relative min-h-screen overflow-hidden font-sans transition-colors duration-300 ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* ── Background image layer ─────────────────────────── */}
      <div className="fixed inset-0 z-0">
        <img
          src="/landing-bg.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
        {/* theme-adaptive overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(2,6,23,0.72) 0%, rgba(2,6,23,0.80) 45%, rgba(2,6,23,0.92) 100%)'
              : 'linear-gradient(180deg, rgba(248,250,252,0.90) 0%, rgba(248,250,252,0.93) 50%, rgba(248,250,252,0.97) 100%)',
          }}
        />
        {/* corner vignette + accent glow */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(1200px circle at 15% 15%, rgba(16,185,129,0.10), transparent 45%), radial-gradient(1000px circle at 85% 80%, rgba(139,92,246,0.10), transparent 45%)'
              : 'radial-gradient(1200px circle at 15% 15%, rgba(59,130,246,0.06), transparent 45%)',
          }}
        />
      </div>

      {/* Animated canvas glow layered over image */}
      <OrbCanvas theme={theme} />

      {/* Header Utilities */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20 flex flex-col justify-center min-h-screen">
        {/* ── Hero Info ─────────────────────────────────────── */}
        <div className="text-center mb-14 max-w-3xl mx-auto lp-rise">
          <div className="relative inline-flex items-center justify-center mb-6 lp-float">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-2xl scale-150" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5 border backdrop-blur-md ${
            isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white/70 border-slate-200 text-slate-600'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            IT Operations Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5">
            IT Change Request &amp;
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Employee Task System
            </span>
          </h1>

          <p className={`text-base md:text-lg max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            A clean, modern platform designed for structured IT change request workflows, role-based approvals, and employee task logs.
          </p>
        </div>

        {/* ── Stats Strip ────────────────────────────────────── */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 py-6 rounded-2xl mb-12 max-w-2xl mx-auto w-full border backdrop-blur-xl lp-rise ${
          isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white/70 border-slate-200 shadow-sm'
        }`} style={{ animationDelay: '0.08s' }}>
          <Stat value="8-Steps" label="Guided Form" theme={theme} />
          <div className="hidden md:block h-10 w-px bg-slate-300/40 dark:bg-white/10 self-center justify-self-center" />
          <Stat value="3-Roles" label="Access Control" theme={theme} />
          <div className="hidden md:block h-10 w-px bg-slate-300/40 dark:bg-white/10 self-center justify-self-center" />
          <Stat value="2-Stage" label="Approval Flow" theme={theme} />
          <div className="hidden md:block h-10 w-px bg-slate-300/40 dark:bg-white/10 self-center justify-self-center" />
          <Stat value="Audit" label="Logs Enabled" theme={theme} />
        </div>

        {/* ── 4-Box Grid (3 nav cards + Track) ───────────────── */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-stretch">
          {cards.map((card, i) => (
            <div key={card.title} className="lp-rise" style={{ animationDelay: `${0.12 + i * 0.08}s` }}>
              <div className="h-full">
                <NavCard {...card} theme={theme} />
              </div>
            </div>
          ))}
          <div className="lp-rise" style={{ animationDelay: `${0.12 + cards.length * 0.08}s` }}>
            <div className="h-full">
              <TicketTracker theme={theme} />
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className={`text-center text-xs mt-16 tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          IT Operations Portal &nbsp;·&nbsp; Enterprise Change &amp; Task System &nbsp;·&nbsp; Internal Use Only
        </div>
      </div>
    </div>
  );
}
