import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  TrendingUp, Compass, Landmark, ShieldAlert, 
  BarChart3, Users, BookOpenCheck, Sparkles, BookOpen, X, ChevronRight
} from 'lucide-react';
import logoImg from '../assets/thoughtflows-logo.png';

const NAV_ITEMS = [
  { 
    path: '/income-expense', 
    label: 'Income & Expense', 
    subtitle: 'Receipts & vouchers',
    icon: TrendingUp, 
    iconBg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)',
    glowColor: 'rgba(20, 184, 166, 0.45)'
  },
  { 
    path: '/daily-business', 
    label: 'Daily Business', 
    subtitle: 'Leads & admissions',
    icon: Compass, 
    iconBg: 'linear-gradient(135deg, #ff7e5f 0%, #f97316 50%, #ea580c 100%)',
    glowColor: 'rgba(249, 115, 22, 0.45)'
  },
  { 
    path: '/b2b', 
    label: 'B2B • College & Company', 
    subtitle: 'Institutional revenue',
    icon: Landmark, 
    iconBg: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
    glowColor: 'rgba(59, 130, 246, 0.45)'
  },
  { 
    path: '/pending-fees', 
    label: 'Pending Fees', 
    subtitle: 'Track student dues',
    icon: ShieldAlert, 
    iconBg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    glowColor: 'rgba(245, 158, 11, 0.45)'
  },
  { 
    path: '/profit-loss', 
    label: 'Profit & Loss', 
    subtitle: 'Monthly · 50-50 share',
    icon: BarChart3, 
    iconBg: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
    glowColor: 'rgba(30, 41, 59, 0.5)'
  },
  { 
    path: '/payroll', 
    label: 'Employee Salaries', 
    subtitle: 'Payroll · PF · ESI',
    icon: Users, 
    iconBg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%)',
    glowColor: 'rgba(56, 189, 248, 0.45)'
  },
  { 
    path: '/balance-sheet', 
    label: 'Balance Sheet', 
    subtitle: 'Assets & liabilities',
    icon: BookOpenCheck, 
    iconBg: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7e22ce 100%)',
    glowColor: 'rgba(168, 85, 247, 0.45)'
  },
  { 
    path: '/initial-investment', 
    label: 'Initial Investment', 
    subtitle: 'Setup costs & ROI',
    icon: Sparkles, 
    iconBg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
    glowColor: 'rgba(244, 63, 94, 0.45)'
  },
  { 
    path: '/user-guide', 
    label: 'User Guide', 
    subtitle: 'Portal documentation',
    icon: BookOpen, 
    iconBg: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 50%, #0f766e 100%)',
    glowColor: 'rgba(45, 212, 191, 0.45)'
  },
];

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const [animKey, setAnimKey] = useState(0);

  const handleNavClick = () => {
    setAnimKey(prev => prev + 1);
    if (onCloseMobile) onCloseMobile();
  };

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

      {/* Creative Navigation List with 3D Squircle Badges */}
      <div key={animKey} className="sidebar-nav-list">
        {NAV_ITEMS.map((item, idx) => {
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
