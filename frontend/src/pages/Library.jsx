import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const statusBadge = {
  safe: 'bg-green-500/15 text-green-400 border border-green-500/30',
  flagged: 'bg-red-500/15 text-red-400 border border-red-500/30',
  processing: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  pending: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  error: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

const statusIcon = { safe: '✅', flagged: '⚠️', processing: '⚙️', pending: '⏳', error: '❌' };

const Library = () => {
  const { user } = useAuth();
  const { processingVideos } = useSocket();
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '', page: 1 });
  const [deletingId, setDeletingId] = useState(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', 12);
      const { data } = await axios.get(`/api/videos?${params}`);
      if (data.success) { setVideos(data.videos); setTotal(data.total); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);
  useEffect(() => { fetchVideos(); }, [processingVideos]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    setDeletingId(id);
    try { await axios.delete(`/api/videos/${id}`); fetchVideos(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
    finally { setDeletingId(null); }
  };

  const selectCls = "bg-[#12121a] border border-[#2a2a3a] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-3xl font-extrabold text-white">🎬 Video Library</h1>
        {['editor', 'admin'].includes(user?.role) && (
          <Link to="/upload" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm no-underline flex items-center gap-2 transition-colors">
            ⬆️ Upload
          </Link>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-6">{total} videos total</p>

      {/* Filters */}
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4 mb-6 flex gap-3 flex-wrap items-center">
        <input
          className="bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-indigo-500 transition-colors placeholder-slate-600 max-w-[220px]"
          placeholder="🔍 Search videos..."
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
        />
        <select className={selectCls} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All Statuses</option>
          <option value="safe">✅ Safe</option>
          <option value="flagged">⚠️ Flagged</option>
          <option value="processing">⚙️ Processing</option>
          <option value="pending">⏳ Pending</option>
        </select>
        <select className={selectCls} value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value, page: 1 })}>
          <option value="">All Categories</option>
          {['uncategorized', 'education', 'entertainment', 'news', 'sports', 'marketing', 'training'].map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        {(filters.search || filters.status || filters.category) && (
          <button onClick={() => setFilters({ status: '', category: '', search: '', page: 1 })}
            className="bg-transparent border border-[#2a2a3a] text-slate-300 font-semibold px-3 py-2 rounded-xl text-xs cursor-pointer hover:border-[#3a3a4a] transition-colors">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="spinner-lg"></div>
          <p className="text-slate-400 text-sm">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-slate-400 mb-5">No videos found.</p>
          {['editor', 'admin'].includes(user?.role) && (
            <Link to="/upload" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm no-underline transition-colors">
              Upload your first video
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map(video => {
            const isProcessing = processingVideos[video._id];
            return (
              <div key={video._id} className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl overflow-hidden hover:border-indigo-500/40 transition-colors group">

                {/* Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-[#1a1a3a] to-[#0f0f1f] flex items-center justify-center text-5xl relative">
                  🎥
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusBadge[video.sensitivityStatus] || statusBadge.pending}`}>
                      {statusIcon[video.sensitivityStatus]} {video.sensitivityStatus}
                    </span>
                  </div>
                  {isProcessing && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2">
                      <div className="flex justify-between text-[10px] text-amber-400 mb-1">
                        <span>{isProcessing.step || 'Processing...'}</span>
                        <span>{isProcessing.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#2a2a3a] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all"
                          style={{ width: `${isProcessing.progress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white truncate mb-1.5">{video.title}</h3>
                  <p className="text-xs text-slate-500 mb-3 flex gap-3">
                    <span>📦 {(video.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                    <span>📅 {new Date(video.createdAt).toLocaleDateString()}</span>
                  </p>

                  {(video.sensitivityStatus === 'safe' || video.sensitivityStatus === 'flagged') && (
                    <div className="bg-[#12121a] rounded-lg p-2.5 mb-3 text-xs">
                      <div className="flex justify-between text-slate-400 mb-1.5">
                        <span>Overall Score</span>
                        <span className={`font-bold ${video.sensitivityStatus === 'flagged' ? 'text-red-400' : 'text-green-400'}`}>
                          {video.sensitivityScore}/100
                        </span>
                      </div>
                      {video.sensitivityDetails && (
                        <div className="flex gap-2 flex-wrap text-[10px] text-slate-500">
                          {Object.entries(video.sensitivityDetails).map(([k, v]) => (
                            <span key={k} className={v > 50 ? 'text-red-400' : ''}>
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/video/${video._id}`}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs no-underline text-center transition-colors flex items-center justify-center">
                      {video.sensitivityStatus === 'safe' ? '▶ Play' : '👁 View'}
                    </Link>
                    {['editor', 'admin'].includes(user?.role) && (
                      <button onClick={() => handleDelete(video._id)} disabled={deletingId === video._id}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold px-3 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-50 transition-colors">
                        {deletingId === video._id ? <span className="spinner" style={{ width: 12, height: 12 }}></span> : '🗑'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-3 mt-8">
          <button disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            className="bg-[#12121a] border border-[#2a2a3a] text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs disabled:opacity-40 cursor-pointer hover:border-[#3a3a4a] transition-colors">
            ← Prev
          </button>
          <span className="px-4 py-2 text-slate-400 text-xs flex items-center">
            Page {filters.page} of {Math.ceil(total / 12)}
          </span>
          <button disabled={filters.page >= Math.ceil(total / 12)} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            className="bg-[#12121a] border border-[#2a2a3a] text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs disabled:opacity-40 cursor-pointer hover:border-[#3a3a4a] transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
