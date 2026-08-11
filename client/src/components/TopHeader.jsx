import React from 'react';
import { Building, Menu, Sun, Moon, Plus } from 'lucide-react';
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

        {/* User Profile */}
        <div className="header-user-profile">
          <div className="user-avatar-circle">MH</div>
          <div className="user-details">
            <span className="user-name">Maharashtra Partner</span>
            <span className="user-role">Pune & Kolhapur</span>
          </div>
        </div>

      </div>

    </div>
  );
}
