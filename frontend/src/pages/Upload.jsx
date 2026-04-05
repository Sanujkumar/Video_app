import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'uncategorized', tags: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith('video/')) {
      setFile(dropped);
      if (!form.title) setForm(f => ({ ...f, title: dropped.name.replace(/\.[^/.]+$/, '') }));
    } else {
      setError('Please drop a valid video file.');
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (!form.title) setForm(f => ({ ...f, title: selected.name.replace(/\.[^/.]+$/, '') }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a video file.');
    setError(''); setUploading(true); setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', file);
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    try {
      const { data } = await axios.post('/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
      });
      if (data.success) {
        setSuccess('Video uploaded! Processing has started. Watch the live progress indicator.');
        setTimeout(() => navigate('/library'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (b) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const inputCls = "w-full bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition-colors placeholder-slate-600";
  const labelCls = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1">⬆️ Upload Video</h1>
        <p className="text-slate-400 text-sm">Upload a video for sensitivity analysis and streaming</p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Drop zone */}
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all min-h-[280px] flex flex-col items-center justify-center gap-3
              ${dragOver ? 'border-indigo-500 bg-indigo-500/5'
                : file ? 'border-green-500 bg-green-500/5'
                : 'border-[#2a2a3a] bg-[#1a1a24] hover:border-[#3a3a4a]'}`}
          >
            <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
            {file ? (
              <>
                <div className="text-5xl">🎬</div>
                <p className="font-bold text-base text-green-400">{file.name}</p>
                <p className="text-slate-400 text-sm">{formatSize(file.size)} · {file.type}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="bg-[#12121a] border border-[#2a2a3a] text-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs hover:border-[#3a3a4a] transition-colors"
                >
                  ✕ Remove
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl">🎥</div>
                <p className="font-bold text-lg text-white">Drop video here</p>
                <p className="text-slate-400 text-sm">or click to browse</p>
                <p className="text-slate-500 text-xs mt-1">MP4, MOV, AVI, MKV, WebM · Max 500MB</p>
              </>
            )}
          </div>

          {uploading && (
            <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4 mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Uploading...</span>
                <span className="font-bold text-white">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-6">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className={labelCls}>Title *</label>
              <input className={inputCls} type="text" placeholder="Video title"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="mb-4">
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} placeholder="Describe the video..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ resize: 'vertical' }} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['uncategorized', 'education', 'entertainment', 'news', 'sports', 'marketing', 'training'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tags</label>
                <input className={inputCls} type="text" placeholder="tag1, tag2"
                  value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>

            <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-4 mb-5">
              <p className="text-xs font-bold text-indigo-400 mb-1.5">🔍 Sensitivity Analysis</p>
              <p className="text-xs text-slate-400 leading-relaxed m-0">
                After upload, the video goes through AI-powered sensitivity pipeline checking violence,
                adult content, hate speech, and spam. You'll see live progress in real-time.
              </p>
            </div>

            <button type="submit" disabled={uploading || !file}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {uploading ? <><span className="spinner"></span> Uploading {uploadProgress}%</> : '🚀 Upload & Analyze'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
