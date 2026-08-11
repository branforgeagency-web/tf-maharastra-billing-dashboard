import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Edit3, Trash2, Key, Shield, 
  Search, CheckCircle, AlertCircle, RefreshCw, X, Eye, EyeOff, Globe, Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  bb_admin: { label: 'MANAGEMENT (BB ADMIN)', bg: '#16213e', color: '#fff', isGlobal: true },
  operations_head: { label: 'OPERATIONS HEAD', bg: '#6b21a8', color: '#fff', isGlobal: true },
  department_head: { label: 'DEPARTMENT HEAD', bg: '#b45309', color: '#fff', isGlobal: true },
  finance_manager: { label: 'FINANCE MANAGER', bg: '#0d9488', color: '#fff', isGlobal: true },
  branch_head: { label: 'BRANCH HEAD', bg: '#cff4fc', color: '#087990', isGlobal: false },
  admin: { label: 'ADMIN', bg: '#16213e', color: '#fff', isGlobal: true },
  management: { label: 'MANAGEMENT', bg: '#0284c7', color: '#fff', isGlobal: true },
};

const GLOBAL_ROLES = ['bb_admin', 'operations_head', 'admin', 'department_head', 'finance_manager', 'management'];

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
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

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
    setShowPasswordInModal(false);
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
    setShowPasswordInModal(false);
    const userRole = user.role || 'branch_head';
    const isGlobal = GLOBAL_ROLES.includes(userRole);

    setFormData({
      email: user.email,
      password: '', // Blank unless resetting
      role: userRole,
      branch: isGlobal ? 'All Branches (Global View)' : (user.branch || 'Pune (FC Road) ★'),
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole) => {
    const isGlobal = GLOBAL_ROLES.includes(newRole);
    setFormData({
      ...formData,
      role: newRole,
      branch: isGlobal ? 'All Branches (Global View)' : (formData.branch === 'All Branches (Global View)' ? 'Pune (FC Road) ★' : formData.branch)
    });
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

    // Final payload sanitization
    const isGlobal = GLOBAL_ROLES.includes(formData.role);
    const payload = {
      ...formData,
      branch: isGlobal ? 'All Branches (Global View)' : formData.branch
    };

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save user.');
      }

      setStatusMsg({
        type: 'success',
        text: editingUser 
          ? `User ${formData.email} updated successfully${formData.password ? ' (password reset)' : ''}.` 
          : `New dashboard user ${formData.email} created!`
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

  const isCurrentFormRoleGlobal = GLOBAL_ROLES.includes(formData.role);

  return (
    <div className="portal-module-container animate-fade-in" style={{ padding: '24px' }}>
      
      {/* Header Banner */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-primary)'
            }}>
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-white)', margin: 0, letterSpacing: '-0.01em' }}>
              User Management
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-slate-400)', margin: 0, fontWeight: '500' }}>
            Create, edit, reset passwords for any dashboard user (including Admin & Sub-Admin accounts).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary-green"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '13.5px' }}
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New Dashboard User</span>
        </button>
      </div>

      {/* Status Alert Message */}
      {statusMsg.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: statusMsg.type === 'error' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${statusMsg.type === 'error' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          color: statusMsg.type === 'error' ? '#e11d48' : '#059669',
        }}>
          {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Search & Refresh Controls Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-slate-400)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, role, or branch..."
            style={{
              width: '100%',
              padding: '11px 14px 11px 40px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-white)',
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
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-slate-200)',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Responsive Data Table */}
      <div className="portal-table-container">
        <table className="portal-data-table">
          <thead>
            <tr>
              <th>USER EMAIL</th>
              <th>ROLE BADGE</th>
              <th>ASSIGNED BRANCH</th>
              <th>CREATED DATE</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-slate-400)' }}>
                  Loading dashboard users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-slate-400)' }}>
                  No dashboard users found. Click "Create New Dashboard User" to add one.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const roleConf = ROLE_CONFIG[u.role] || { label: u.role?.toUpperCase(), bg: '#334155', color: '#fff', isGlobal: true };
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-white)' }}>
                      {u.email}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 12px',
                        borderRadius: '50px',
                        fontSize: '10.5px',
                        fontWeight: '800',
                        background: roleConf.bg,
                        color: roleConf.color,
                        letterSpacing: '0.04em'
                      }}>
                        {roleConf.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-slate-200)' }}>
                      {roleConf.isGlobal ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0284c7', fontWeight: '600' }}>
                          <Globe size={13} />
                          <span>All Branches (Global View)</span>
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Building size={13} className="text-emerald-500" />
                          <span>{u.branch}</span>
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-slate-400)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'System Default'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(u)}
                          title="Edit User / Reset Password"
                          style={{
                            padding: '7px 12px',
                            background: 'rgba(2, 132, 199, 0.1)',
                            border: '1px solid rgba(2, 132, 199, 0.25)',
                            borderRadius: '8px',
                            color: 'var(--blue-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}
                        >
                          <Edit3 size={14} />
                          <span>Edit / Password</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          title="Delete User"
                          style={{
                            padding: '7px 12px',
                            background: 'rgba(225, 29, 72, 0.1)',
                            border: '1px solid rgba(225, 29, 72, 0.25)',
                            borderRadius: '8px',
                            color: 'var(--rose-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}
                        >
                          <Trash2 size={14} />
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
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            padding: '30px',
            boxShadow: 'var(--shadow-hover)',
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
                color: 'var(--text-slate-400)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-white)', marginTop: 0, marginBottom: '6px' }}>
              {editingUser ? `Edit User: ${editingUser.email}` : 'Create New Dashboard User'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-slate-400)', marginTop: 0, marginBottom: '22px' }}>
              Modify account email, role privileges, or set a new password.
            </p>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--text-slate-200)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                    padding: '11px 14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-white)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-slate-200)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {editingUser ? 'NEW PASSWORD (LEAVE BLANK TO KEEP CURRENT)' : 'PASSWORD'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {showPasswordInModal ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPasswordInModal ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showPasswordInModal ? 'text' : 'password'}
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'Type new password to reset...' : 'Set initial account password...'}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-white)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--text-slate-200)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ASSIGNED DASHBOARD ROLE
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-white)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="bb_admin">MANAGEMENT (BB ADMIN) — Full Admin</option>
                  <option value="operations_head">OPERATIONS HEAD — Sub-Admin</option>
                  <option value="department_head">DEPARTMENT HEAD</option>
                  <option value="finance_manager">FINANCE MANAGER</option>
                  <option value="branch_head">BRANCH HEAD</option>
                </select>
              </div>

              {/* Conditionally hide Branch dropdown for Admin / Sub-Admin / Global Roles */}
              {isCurrentFormRoleGlobal ? (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#0284c7',
                  fontSize: '12.5px',
                  fontWeight: '600'
                }}>
                  <Globe size={18} className="shrink-0 text-sky-500" />
                  <span>
                    <strong>All Branches (Global View)</strong>: Admin & Sub-Admin roles automatically have global visibility across all 11 branches. Branch assignment is not applicable.
                  </span>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--text-slate-200)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ASSIGNED BRANCH
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-white)',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {BRANCH_OPTIONS.filter(b => b !== 'All Branches (Global View)').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-slate-200)',
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
                  {formSubmitting ? 'Saving...' : (editingUser ? 'Save & Update User' : 'Create User')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
