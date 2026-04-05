import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const roleBadge = {
  admin: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  editor: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
  viewer: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { processingVideos } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const processingCount = Object.keys(processingVideos).length;

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/upload', label: 'Upload', icon: '⬆️', roles: ['editor', 'admin'] },
    { to: '/library', label: 'Library', icon: '🎬' },
    ...(user?.role === 'admin' ? [{ to: '/users', label: 'Users', icon: '👥' }] : [])
  ];

  return (
    <nav className="bg-[#1a1a24]/95 backdrop-blur-sm border-b border-[#2a2a3a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center h-16 justify-between">

        <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-lg">🎥</div>
          <span className="font-extrabold text-lg text-white">Video<span className="text-indigo-400">Sense</span></span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map(link => {
            if (link.roles && !link.roles.includes(user?.role)) return null;
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold no-underline transition-all
                  ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-[#2a2a3a] hover:text-white'}`}>
                {link.icon} {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {processingCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-400">
              <span className="spinner" style={{ borderColor: 'rgba(245,158,11,0.25)', borderTopColor: '#f59e0b' }}></span>
              {processingCount} processing
            </div>
          )}

          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm font-semibold text-white cursor-pointer hover:border-[#3a3a4a] transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span>{user?.name}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${roleBadge[user?.role]}`}>{user?.role}</span>
              <span className="text-slate-400 text-xs">▾</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[110%] bg-[#1a1a24] border border-[#2a2a3a] rounded-xl min-w-[180px] shadow-2xl shadow-black/50 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#2a2a3a]">
                  <p className="text-sm font-semibold text-white m-0">{user?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 m-0">{user?.email}</p>
                </div>
                <button onClick={handleLogout}
                  className="w-full px-4 py-3 bg-transparent border-none text-red-400 text-sm font-semibold cursor-pointer text-left flex items-center gap-2 hover:bg-[#2a2a3a] transition-colors">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
