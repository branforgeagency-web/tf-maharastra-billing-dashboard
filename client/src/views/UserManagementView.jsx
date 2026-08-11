import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Edit3, Trash2, Key, Shield, 
  Search, CheckCircle, AlertCircle, RefreshCw, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  bb_admin: { label: 'MANAGEMENT (BB ADMIN)', bg: '#16213e', color: '#fff' },
  operations_head: { label: 'OPERATIONS HEAD', bg: '#6b21a8', color: '#fff' },
  department_head: { label: 'DEPARTMENT HEAD', bg: '#b45309', color: '#fff' },
  finance_manager: { label: 'FINANCE MANAGER', bg: '#0d9488', color: '#fff' },
  branch_head: { label: 'BRANCH HEAD', bg: '#cff4fc', color: '#087990' },
  admin: { label: 'ADMIN', bg: '#16213e', color: '#fff' },
  management: { label: 'MANAGEMENT', bg: '#0284c7', color: '#fff' },
};

const BRANCH_OPTIONS = [
  'Pune (FC Road) ★',
  'Kolhapur (Tarabai Park) ★',
  'All Branches (Global View)'
];

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'branch_head',
    branch: 'Pune (FC Road) ★',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const { token } = useAuth();

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      role: 'branch_head',
      branch: 'Pune (FC Road) ★',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '', // Blank unless resetting
      role: user.role || 'branch_head',
      branch: user.branch || 'Pune (FC Road) ★',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setStatusMsg({ type: 'error', text: 'Email address is required.' });
      return;
    }
    if (!editingUser && !formData.password) {
      setStatusMsg({ type: 'error', text: 'Password is required for new users.' });
      return;
    }

    setFormSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save user.');
      }

      setStatusMsg({
        type: 'success',
        text: editingUser ? `User ${formData.email} updated successfully.` : `New dashboard user ${formData.email} created!`
      });

      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user "${userEmail}" from database?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: `User ${userEmail} deleted.` });
        fetchUsers();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to delete user.' });
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.branch?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="portal-module-container animate-fade-in">
      
      {/* Header Banner */}
      <div className="module-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Users className="w-6 h-6 text-emerald-500" />
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-slate-100)', margin: 0 }}>
              User Management
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-slate-400)', margin: 0 }}>
            Create and edit dashboard user accounts, reset passwords, and assign role privileges.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary-green"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px' }}
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New Dashboard User</span>
        </button>
      </div>

      {/* Status Message */}
      {statusMsg.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '16px',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: statusMsg.type === 'error' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${statusMsg.type === 'error' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
          color: statusMsg.type === 'error' ? '#fb7185' : '#34d399',
        }}>
          {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div style={{ margin: '20px 0 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, role, or branch..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              background: 'var(--bg-slate-900, #0f172a)',
              border: '1px solid var(--border-slate-800, #1e293b)',
              borderRadius: '10px',
              color: 'var(--text-slate-100, #fff)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        <button
          onClick={fetchUsers}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'var(--bg-slate-900, #0f172a)',
            border: '1px solid var(--border-slate-800, #1e293b)',
            borderRadius: '10px',
            color: 'var(--text-slate-300)',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="table-responsive-wrapper" style={{ background: 'var(--bg-slate-900, #0f172a)', border: '1px solid var(--border-slate-800, #1e293b)', borderRadius: '16px', overflow: 'hidden' }}>
        <table className="portal-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-slate-800, #1e293b)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-slate-400)' }}>USER EMAIL</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-slate-400)' }}>ROLE BADGE</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-slate-400)' }}>ASSIGNED BRANCH</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-slate-400)' }}>CREATED DATE</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-slate-400)' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Loading dashboard users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  No dashboard users found. Click "Create New Dashboard User" to add one.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const roleConf = ROLE_CONFIG[u.role] || { label: u.role?.toUpperCase(), bg: '#334155', color: '#fff' };
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--text-slate-100)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '50px',
                        fontSize: '10px',
                        fontWeight: '800',
                        background: roleConf.bg,
                        color: roleConf.color,
                        letterSpacing: '0.04em'
                      }}>
                        {roleConf.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-slate-300)' }}>
                      {u.branch}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-slate-400)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'System Default'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(u)}
                          title="Edit User / Reset Password"
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            borderRadius: '8px',
                            color: '#60a5fa',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          title="Delete User"
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '8px',
                            color: '#f87171',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Create / Edit Dashboard User */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-slate-900, #0f172a)',
            border: '1px solid var(--border-slate-800, #1e293b)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-slate-100)', marginTop: 0, marginBottom: '6px' }}>
              {editingUser ? 'Edit User / Reset Password' : 'Create New Dashboard User'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', marginTop: 0, marginBottom: '20px' }}>
              Enter email, password, and assign role permissions.
            </p>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-300)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  USER EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. user@thoughtflows.in"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-slate-950, #020617)',
                    border: '1px solid var(--border-slate-800, #1e293b)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-300)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {editingUser ? 'NEW PASSWORD (LEAVE BLANK TO KEEP CURRENT)' : 'PASSWORD'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'Enter new password if resetting...' : 'Set initial password...'}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-slate-950, #020617)',
                    border: '1px solid var(--border-slate-800, #1e293b)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-300)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  ASSIGNED DASHBOARD ROLE
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-slate-950, #020617)',
                    border: '1px solid var(--border-slate-800, #1e293b)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="bb_admin">MANAGEMENT (BB ADMIN)</option>
                  <option value="operations_head">OPERATIONS HEAD</option>
                  <option value="department_head">DEPARTMENT HEAD</option>
                  <option value="finance_manager">FINANCE MANAGER</option>
                  <option value="branch_head">BRANCH HEAD</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-300)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  ASSIGNED BRANCH
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-slate-950, #020617)',
                    border: '1px solid var(--border-slate-800, #1e293b)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {BRANCH_OPTIONS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid var(--border-slate-800, #1e293b)',
                    borderRadius: '10px',
                    color: '#94a3b8',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-primary-green"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {formSubmitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
