import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  TrendingUp, Compass, Landmark, ShieldAlert, 
  BarChart3, Users, BookOpenCheck, Sparkles, BookOpen, X, ChevronRight, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/thoughtflows-logo.png';

const ROLE_BADGES = {
  bb_admin: { label: 'MANAGEMENT (BB ADMIN)', bg: '#16213e', color: '#fff' },
  operations_head: { label: 'OPERATIONS HEAD', bg: '#6b21a8', color: '#fff' },
  department_head: { label: 'DEPARTMENT HEAD', bg: '#b45309', color: '#fff' },
  finance_manager: { label: 'FINANCE MANAGER', bg: '#0d9488', color: '#fff' },
  branch_head: { label: 'BRANCH HEAD', bg: '#cff4fc', color: '#087990' },
  admin: { label: 'ADMIN', bg: '#16213e', color: '#fff' },
  management: { label: 'MANAGEMENT', bg: '#0284c7', color: '#fff' },
};

const ALL_ROLES = ['bb_admin', 'operations_head', 'department_head', 'finance_manager', 'branch_head', 'admin', 'management'];

const NAV_ITEMS = [
  { 
    path: '/income-expense', 
    label: 'Income & Expense', 
    subtitle: 'Receipts & vouchers',
    icon: TrendingUp, 
    iconBg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)',
    glowColor: 'rgba(20, 184, 166, 0.45)',
    roles: ALL_ROLES
  },
  { 
    path: '/daily-business', 
    label: 'Daily Business', 
    subtitle: 'Leads & admissions',
    icon: Compass, 
    iconBg: 'linear-gradient(135deg, #ff7e5f 0%, #f97316 50%, #ea580c 100%)',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    roles: ['bb_admin', 'operations_head', 'department_head', 'branch_head', 'admin', 'management']
  },
  { 
    path: '/b2b', 
    label: 'B2B • College & Company', 
    subtitle: 'Institutional revenue',
    icon: Landmark, 
    iconBg: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    roles: ALL_ROLES
  },
  { 
    path: '/pending-fees', 
    label: 'Pending Fees', 
    subtitle: 'Track student dues',
    icon: ShieldAlert, 
    iconBg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    roles: ALL_ROLES
  },
  { 
    path: '/profit-loss', 
    label: 'Profit & Loss', 
    subtitle: 'Monthly · 50-50 share',
    icon: BarChart3, 
    iconBg: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
    glowColor: 'rgba(30, 41, 59, 0.5)',
    roles: ['bb_admin', 'operations_head', 'finance_manager', 'admin']
  },
  { 
    path: '/payroll', 
    label: 'Employee Salaries', 
    subtitle: 'Payroll · PF · ESI',
    icon: Users, 
    iconBg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%)',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    roles: ['bb_admin', 'operations_head', 'admin']
  },
  { 
    path: '/balance-sheet', 
    label: 'Balance Sheet', 
    subtitle: 'Assets & liabilities',
    icon: BookOpenCheck, 
    iconBg: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7e22ce 100%)',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    roles: ['bb_admin', 'operations_head', 'finance_manager', 'admin']
  },
  { 
    path: '/initial-investment', 
    label: 'Initial Investment', 
    subtitle: 'Setup costs & ROI',
    icon: Sparkles, 
    iconBg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    roles: ['bb_admin', 'operations_head', 'admin']
  },
  { 
    path: '/user-management', 
    label: 'User Management', 
    subtitle: 'Create & edit users',
    icon: UserPlus, 
    iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    roles: ['bb_admin', 'operations_head', 'admin']
  },
  { 
    path: '/user-guide', 
    label: 'User Guide', 
    subtitle: 'Portal documentation',
    icon: BookOpen, 
    iconBg: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 50%, #0f766e 100%)',
    glowColor: 'rgba(45, 212, 191, 0.45)',
    roles: ALL_ROLES
  },
];

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const [animKey, setAnimKey] = useState(0);
  const { user } = useAuth();

  const handleNavClick = () => {
    setAnimKey(prev => prev + 1);
    if (onCloseMobile) onCloseMobile();
  };

  const userRole = user?.role || 'bb_admin';
  const visibleNavItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));
  const activeRoleBadge = ROLE_BADGES[userRole] || { label: userRole?.toUpperCase(), bg: '#16213e', color: '#fff' };

  return (
    <div className={`portal-sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}>
      
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-badge-container">
          <img src={logoImg} alt="Thoughtflows Medical Coding Academy" className="sidebar-logo-img" />
        </div>

        <button onClick={onCloseMobile} className="sidebar-mobile-close" title="Close Sidebar">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Access Banner */}
      <div style={{
        margin: '0 12px 12px 12px',
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Active Role</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '50px',
            fontSize: '9px',
            fontWeight: '800',
            background: activeRoleBadge.bg,
            color: activeRoleBadge.color
          }}>
            {activeRoleBadge.label}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: '600', wordBreak: 'break-all' }}>
          {user?.email || 'Logged In User'}
        </span>
      </div>

      {/* Creative Navigation List with 3D Squircle Badges */}
      <div key={animKey} className="sidebar-nav-list">
        {visibleNavItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              style={{ animationDelay: `${idx * 0.035}s` }}
              className={({ isActive }) => `sidebar-card-item animate-sidebar-item ${isActive ? 'active' : ''}`}
            >
              {/* Dynamic Glowing 3D Squircle Icon Box */}
              <div 
                className="sidebar-card-icon" 
                style={{ 
                  background: item.iconBg,
                  boxShadow: `0 6px 18px -2px ${item.glowColor}`
                }}
              >
                <Icon className="w-5 h-5 text-white stroke-[2.2]" />
              </div>

              {/* Text Info */}
              <div className="sidebar-card-text">
                <span className="sidebar-card-title">{item.label}</span>
                <span className="sidebar-card-subtitle">{item.subtitle}</span>
              </div>

              {/* Subtle Animated Chevron */}
              <div className="sidebar-card-arrow">
                <ChevronRight className="w-4 h-4" />
              </div>
            </NavLink>
          );
        })}
      </div>

    </div>
  );
}
