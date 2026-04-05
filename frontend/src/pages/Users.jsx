import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/users');
      if (data.success) setUsers(data.users);
    } catch (err) { setError(err.response?.data?.message || 'Failed to load users'); }
    finally { setLoading(false); }
  };

  const updateRole = async (id, role) => {
    try { await axios.put(`/api/users/${id}/role`, { role }); fetchUsers(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to update role'); }
  };

  const deactivateUser = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try { await axios.delete(`/api/users/${id}`); fetchUsers(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to deactivate'); }
  };

  const selectCls = "bg-[#12121a] border border-[#2a2a3a] rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-extrabold text-white mb-1">👥 User Management</h1>
      <p className="text-slate-400 text-sm mb-8">Manage users and their roles within your organisation</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>
      )}

      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="spinner-lg"></div>
            <p className="text-slate-400 text-sm">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No users found.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                {['User', 'Email', 'Role', 'Organisation', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id} className={`border-b border-[#1e1e2e] last:border-b-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-sm">{u.email}</td>
                  <td className="px-5 py-4">
                    <select className={selectCls} value={u.role} onChange={e => updateRole(u._id, e.target.value)}>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-sm">{u.organisation}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                      ${u.isActive
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                      {u.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {u.isActive && (
                      <button onClick={() => deactivateUser(u._id)}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;
