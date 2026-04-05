import React from 'react';
import { useSocket } from '../context/SocketContext';

const ProcessingCard = () => {
  const { processingVideos } = useSocket();
  const entries = Object.entries(processingVideos);

  if (entries.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 z-50 flex flex-col gap-2.5">
      {entries.map(([videoId, info]) => (
        <div key={videoId} className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4 shadow-2xl shadow-black/40">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-sm font-bold text-white">🔄 Analyzing Video</span>
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full
              ${info.status === 'safe' ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                : info.status === 'flagged' ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
              {info.status}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-2">{info.step || 'Processing...'}</p>

          <div className="w-full h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${info.progress}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-500 text-right mt-1">{info.progress}%</p>

          {info.progress === 100 && info.scores && (
            <div className={`mt-2.5 px-3 py-2 rounded-lg text-xs font-semibold
              ${info.status === 'safe' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {info.status === 'safe' ? '✅ Content is Safe' : '⚠️ Content Flagged'}
              {' '}— Score: {info.scores.overallScore}/100
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProcessingCard;
