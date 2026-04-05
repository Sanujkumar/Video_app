import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const statusBadge = {
  safe: 'bg-green-500/15 text-green-400 border border-green-500/30',
  flagged: 'bg-red-500/15 text-red-400 border border-red-500/30',
  processing: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  pending: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  error: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

const StatCard = ({ icon, label, value, bg, text }) => (
  <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-2xl flex-shrink-0`}>{icon}</div>
    <div>
      <div className={`text-3xl font-extrabold ${text}`}>{value}</div>
      <div className="text-xs font-semibold text-slate-400 mt-0.5">{label}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { processingVideos } = useSocket();
  const [stats, setStats] = useState({ total: 0, safe: 0, flagged: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [processingVideos]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/videos?limit=5');
      if (data.success) {
        setRecent(data.videos);
        setStats({
          total: data.total,
          safe: data.videos.filter(v => v.sensitivityStatus === 'safe').length,
          flagged: data.videos.filter(v => v.sensitivityStatus === 'flagged').length,
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const processingCount = Object.keys(processingVideos).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1">👋 Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            {user?.organisation} ·
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full
              ${user?.role === 'admin' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : user?.role === 'editor' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'}`}>
              {user?.role}
            </span>
          </p>
        </div>
        {['editor', 'admin'].includes(user?.role) && (
          <Link to="/upload" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm no-underline flex items-center gap-2 transition-colors">
            ⬆️ Upload Video
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon="🎬" label="Total Videos" value={stats.total} bg="bg-indigo-500/10" text="text-indigo-400" />
        <StatCard icon="✅" label="Safe" value={stats.safe} bg="bg-green-500/10" text="text-green-400" />
        <StatCard icon="⚠️" label="Flagged" value={stats.flagged} bg="bg-red-500/10" text="text-red-400" />
        <StatCard icon="⚙️" label="Processing" value={processingCount} bg="bg-amber-500/10" text="text-amber-400" />
      </div>

      {/* Active Processing */}
      {processingCount > 0 && (
        <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 mb-6">
          <h3 className="text-base font-bold text-white mb-4">⚙️ Active Processing</h3>
          {Object.entries(processingVideos).map(([id, info]) => (
            <div key={id} className="mb-4 last:mb-0">
              <div className="flex justify-between mb-1.5 text-sm">
                <span className="text-slate-400">{info.step}</span>
                <span className="font-bold text-white">{info.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${info.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Videos */}
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-bold text-white">🕒 Recent Videos</h3>
          <Link to="/library" className="bg-[#12121a] border border-[#2a2a3a] text-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs no-underline hover:border-[#3a3a4a] transition-colors">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="spinner-lg"></div>
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">🎬</div>
            <p className="text-slate-400 mb-4">No videos yet.</p>
            {['editor', 'admin'].includes(user?.role) && (
              <Link to="/upload" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm no-underline transition-colors">
                Upload your first video
              </Link>
            )}
          </div>
        ) : (
          <div>
            {recent.map(video => (
              <Link to={`/video/${video._id}`} key={video._id}
                className="flex items-center gap-4 py-3.5 border-b border-[#1e1e2e] last:border-b-0 no-underline text-white hover:bg-white/2 rounded-lg transition-colors -mx-2 px-2">
                <div className="w-11 h-11 bg-[#12121a] rounded-xl flex items-center justify-center text-xl flex-shrink-0">🎥</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate m-0">{video.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 m-0">
                    {(video.fileSize / (1024 * 1024)).toFixed(1)} MB · {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusBadge[video.sensitivityStatus] || statusBadge.pending}`}>
                  {video.sensitivityStatus}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
