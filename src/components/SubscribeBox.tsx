'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export default function SubscribeBox() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  // Anti-spam & Bot Protection
  const [honeypot, setHoneypot] = useState('');
  const [mountedAt] = useState(() => Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Invisible Honeypot Trap
    if (honeypot.trim() !== '') {
      setStatus('success');
      setMessage('Thank you for subscribing! You will receive instant notifications.');
      return;
    }

    // 2. Bot Time-trap (submission under 600ms is automated)
    if (Date.now() - mountedAt < 600) {
      setStatus('error');
      setMessage('Please take a moment before submitting.');
      return;
    }

    // 3. Client-side Rate-limiting: Prevent repeated spam clicks
    const lastSubKey = 'rrb_last_sub_ts';
    const lastSubTime = parseInt(sessionStorage.getItem(lastSubKey) || '0', 10);
    if (Date.now() - lastSubTime < 20000) {
      setStatus('error');
      setMessage('Please wait a few seconds before subscribing again.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev';
      const res = await fetch(`${apiBase}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem(lastSubKey, Date.now().toString());
        setStatus('success');
        setMessage('Thank you for subscribing! You will receive instant notifications.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe. Try again.');
      }
    } catch {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-purple-950/40 border border-blue-500/30 rounded-3xl p-8 text-center relative overflow-hidden my-12 shadow-xl">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-extrabold text-white tracking-tight">
          Get Instant RRB Exam & Answer Key Notifications
        </h3>
        <p className="text-sm text-slate-300">
          Subscribe to get direct alerts for Phase Answer Keys, Official Scorecard downloads, Cut-off releases & Objection Windows.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" /> {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
            {/* Anti-spam Honeypot Field */}
            <div style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
              <label htmlFor="user_sub_hp">Leave this blank</label>
              <input
                id="user_sub_hp"
                type="text"
                name="user_sub_hp"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />} Subscribe Now
            </button>
          </form>
        )}
        {status === 'error' && <p className="text-xs text-rose-400 mt-2">{message}</p>}
      </div>
    </div>
  );
}
