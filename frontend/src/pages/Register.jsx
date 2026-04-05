import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor', organisation: 'default' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      if (data.success) navigate('/dashboard');
      else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition-colors placeholder-slate-600";
  const labelCls = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: 'radial-gradient(ellipse at top, #1a1a3a 0%, #0f0f13 70%)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-3xl mx-auto mb-4">🎥</div>
          <h1 className="text-3xl font-extrabold text-white mb-1.5">Create Account</h1>
          <p className="text-slate-400 text-sm">Join VideoSense today</p>
        </div>

        <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className={labelCls}>Full Name</label>
              <input className={inputCls} type="text" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="mb-5">
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="mb-5">
              <label className={labelCls}>Password</label>
              <input className={inputCls} type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className={labelCls}>Role</label>
                <select className={inputCls} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Organisation</label>
                <input className={inputCls} type="text" placeholder="my-org"
                  value={form.organisation} onChange={e => setForm({ ...form, organisation: e.target.value })} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {loading ? <><span className="spinner"></span> Creating...</> : '🚀 Create Account'}
            </button>
          </form>

          <p className="text-center mt-5 text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold no-underline hover:text-indigo-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
