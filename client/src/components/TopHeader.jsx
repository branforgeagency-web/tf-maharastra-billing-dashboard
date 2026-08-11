import React from 'react';
import { Building, Menu, Sun, Moon, Plus, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/thoughtflows-logo.png';

const MAHARASHTRA_BRANCHES = [
  'Pune (FC Road) ★',
  'Kolhapur (Tarabai Park) ★',
  'All Branches (Global View)'
];

export default function TopHeader({ 
  selectedBranch, 
  setSelectedBranch, 
  onOpenReceiptModal, 
  onToggleMobileSidebar,
  theme,
  onToggleTheme
}) {
  const { user, logout } = useAuth();

  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'TF';

  return (
    <div className="portal-header-bar">
      
      {/* Left: Mobile Hamburger & Prominent Logo */}
      <div className="header-left-flex">
        <button onClick={onToggleMobileSidebar} className="mobile-hamburger-btn" title="Open Navigation Menu">
          <Menu className="w-5 h-5" />
        </button>

        {/* Prominent Official Brand Navbar Logo Badge */}
        <div className="header-logo-badge">
          <img src={logoImg} alt="Thoughtflows Medical Coding Academy" className="header-logo-img" />
        </div>

        <div className="header-branch-section">
          <span className="header-branch-label">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Branch:</span>
          </span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="header-branch-select"
          >
            {MAHARASHTRA_BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Actions, Theme & Profile */}
      <div className="header-right-actions">
        
        {/* Theme Toggle Button */}
        <button onClick={onToggleTheme} className="theme-toggle-btn" title="Toggle Light / Dark Mode">
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hide-mobile-text">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="hide-mobile-text">Light</span>
            </>
          )}
        </button>

        {/* Live Billing Status Badge */}
        <div className="header-billing-badge" title="Live Maharashtra TF Billing Synchronized">
          <span className="billing-dot-live"></span>
          <span>MH Billing</span>
        </div>

        {/* Action Buttons */}
        {onOpenReceiptModal && (
          <button onClick={onOpenReceiptModal} className="btn-primary-green header-new-receipt-btn">
            <Plus className="w-4 h-4" />
            <span className="hide-mobile-text">New Receipt</span>
          </button>
        )}

        {/* Logged In User Profile Card & Logout */}
        {user && (
          <div className="header-user-profile-flex" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="header-user-profile">
              <div 
                className="user-avatar-circle"
                style={{
                  background: user.role === 'admin' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                }}
              >
                {userInitials}
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {user.role === 'admin' ? <Shield size={10} className="text-emerald-500" /> : <User size={10} className="text-sky-400" />}
                  <span style={{ textTransform: 'uppercase', fontWeight: '700' }}>{user.role}</span>
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout of Dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '10px',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hide-mobile-text">Logout</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
