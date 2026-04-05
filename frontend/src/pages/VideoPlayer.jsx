import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ScoreBar = ({ label, value }) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1 text-xs">
      <span className="text-slate-400 capitalize">{label}</span>
      <span className={`font-bold ${value > 50 ? 'text-red-400' : 'text-green-400'}`}>{value}/100</span>
    </div>
    <div className="w-full h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${value > 50 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}
        style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const VideoPlayer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { processingVideos } = useSocket();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { fetchVideo(); }, [id]);
  useEffect(() => {
    if (!processingVideos[id] && video?.sensitivityStatus === 'processing') fetchVideo();
  }, [processingVideos]);

  const fetchVideo = async () => {
    try {
      const { data } = await axios.get(`/api/videos/${id}`);
      if (data.success) setVideo(data.video);
    } catch (err) { setError(err.response?.data?.message || 'Video not found'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="spinner-lg"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-center">
      <div className="text-6xl mb-4">❌</div>
      <h2 className="text-xl font-bold mb-2 text-white">Error</h2>
      <p className="text-slate-400 mb-6">{error}</p>
      <Link to="/library" className="bg-[#1a1a24] border border-[#2a2a3a] text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-sm no-underline hover:border-[#3a3a4a] transition-colors">
        ← Back to Library
      </Link>
    </div>
  );

  const processing = processingVideos[id];
  const canStream = video.sensitivityStatus === 'safe' ||
    (video.sensitivityStatus === 'flagged' && user?.role === 'admin');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button onClick={() => navigate(-1)}
        className="bg-[#1a1a24] border border-[#2a2a3a] text-slate-300 font-semibold px-4 py-2 rounded-xl text-sm cursor-pointer hover:border-[#3a3a4a] transition-colors mb-6">
        ← Back
      </button>

      <div className="grid grid-cols-[1fr_320px] gap-6">

        {/* Player */}
        <div>
          <div className="bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative border border-[#2a2a3a]">
            {processing ? (
              <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                <div className="text-6xl">⚙️</div>
                <h3 className="font-bold text-lg text-white">Processing Video</h3>
                <p className="text-slate-400 text-sm">{processing.step}</p>
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Analyzing sensitivity...</span>
                    <span className="font-bold text-amber-400">{processing.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all"
                      style={{ width: `${processing.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ) : canStream ? (
              <video controls className="w-full h-full"
                src={`/api/videos/${id}/stream?auth=${token}`}>
                Your browser does not support HTML5 video.
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                <div className="text-6xl">{video.sensitivityStatus === 'flagged' ? '⚠️' : '⏳'}</div>
                <h3 className="font-bold text-lg text-white">
                  {video.sensitivityStatus === 'flagged' ? 'Content Flagged' : 'Awaiting Processing'}
                </h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  {video.sensitivityStatus === 'flagged'
                    ? 'This video was flagged for sensitive content. Admins can still view it.'
                    : 'This video is pending analysis. Please wait.'}
                </p>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="mt-5">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-2xl font-extrabold text-white">{video.title}</h1>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0
                ${{ safe: 'bg-green-500/15 text-green-400 border border-green-500/30',
                     flagged: 'bg-red-500/15 text-red-400 border border-red-500/30',
                     processing: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
                     pending: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
                   }[video.sensitivityStatus] || 'bg-slate-500/15 text-slate-400 border border-slate-500/30'}`}>
                {video.sensitivityStatus}
              </span>
            </div>
            {video.description && <p className="text-slate-400 mt-2 text-sm leading-relaxed">{video.description}</p>}
            <div className="flex gap-4 mt-3 text-xs text-slate-500 flex-wrap">
              <span>📦 {(video.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
              <span>📅 {new Date(video.createdAt).toLocaleString()}</span>
              <span>👤 {video.uploadedBy?.name}</span>
              {video.category && <span>🏷 {video.category}</span>}
            </div>
            {video.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {video.tags.map(tag => (
                  <span key={tag} className="bg-[#12121a] border border-[#2a2a3a] text-slate-400 px-2.5 py-0.5 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Sensitivity Report */}
          <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">🔍 Sensitivity Report</h3>

            {(video.sensitivityStatus === 'safe' || video.sensitivityStatus === 'flagged') ? (
              <>
                <div className={`rounded-xl p-4 text-center mb-5 ${video.sensitivityStatus === 'safe'
                  ? 'bg-green-500/10 border border-green-500/25'
                  : 'bg-red-500/10 border border-red-500/25'}`}>
                  <div className="text-3xl mb-1.5">{video.sensitivityStatus === 'safe' ? '✅' : '⚠️'}</div>
                  <p className={`font-extrabold text-lg m-0 ${video.sensitivityStatus === 'safe' ? 'text-green-400' : 'text-red-400'}`}>
                    {video.sensitivityStatus.toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 m-0">Overall Score: {video.sensitivityScore}/100</p>
                </div>
                {video.sensitivityDetails && (
                  <>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Breakdown</p>
                    <ScoreBar label="Violence" value={video.sensitivityDetails.violence || 0} />
                    <ScoreBar label="Adult Content" value={video.sensitivityDetails.adult || 0} />
                    <ScoreBar label="Hate Speech" value={video.sensitivityDetails.hate || 0} />
                    <ScoreBar label="Spam" value={video.sensitivityDetails.spam || 0} />
                  </>
                )}
              </>
            ) : video.sensitivityStatus === 'processing' ? (
              <div className="text-center py-6">
                <div className="spinner-lg mx-auto mb-3"></div>
                <p className="text-amber-400 font-semibold text-sm m-0">Analysis in progress</p>
                <p className="text-slate-400 text-xs mt-1 m-0">{processing?.step || 'Please wait...'}</p>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm">⏳ Not yet analyzed</div>
            )}
          </div>

          {/* File Info */}
          <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">📋 File Info</h3>
            {[
              ['Format', video.mimeType],
              ['Size', `${(video.fileSize / (1024 * 1024)).toFixed(2)} MB`],
              ['Original', video.originalName],
              ['Org', video.organisation],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-[#1e1e2e] last:border-b-0 text-xs">
                <span className="text-slate-400">{label}</span>
                <span className="font-semibold text-white text-right max-w-[160px] truncate">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
