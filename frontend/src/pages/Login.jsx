import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) navigate('/dashboard');
      else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13] px-6"
      style={{ background: 'radial-gradient(ellipse at top, #1a1a3a 0%, #0f0f13 70%)' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-3xl mx-auto mb-4">
            🎥
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1.5">
            Video<span className="text-indigo-400">Sense</span>
          </h1>
          <p className="text-slate-400 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="spinner"></span> Signing in...</>
              ) : '🔐 Sign In'}
            </button>
          </form>

          <p className="text-center mt-5 text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold no-underline hover:text-indigo-300">
              Register
            </Link>
          </p>
        </div>

        <div className="mt-4 bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-4 py-3 text-xs text-slate-400">
          <span className="text-indigo-400 font-bold">💡 Demo:</span> Register a new account to get started.
          Use role <strong className="text-white">admin</strong> for full access.
        </div>
      </div>
    </div>
  );
};

export default Login;
