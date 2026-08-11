import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Users, Building, BarChart2, BookOpenCheck, 
  ArrowLeft, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import logoImg from '../assets/thoughtflows-logo.png';

const ROLE_CARDS = [
  {
    id: 'bb_admin',
    badgeText: 'MANAGEMENT (BB ADMIN)',
    badgeBg: '#16213e',
    badgeColor: '#ffffff',
    title: 'Sign in to Management (BB Admin)',
    subtitle: 'Balu & Bhanu — head office full access to all 11 branches',
    defaultEmail: 'management@thoughtflows.in',
    defaultPassword: 'manage123',
    icon: Shield,
    accentGlow: 'rgba(22, 33, 62, 0.4)',
  },
  {
    id: 'operations_head',
    badgeText: 'OPERATIONS HEAD',
    badgeBg: '#6b21a8',
    badgeColor: '#ffffff',
    title: 'Sign in to Operations Head',
    subtitle: 'Kartheeswari — sub-admin with full visibility across all branches',
    defaultEmail: 'karthik@thoughtflows.in',
    defaultPassword: 'ops123',
    icon: Users,
    accentGlow: 'rgba(107, 33, 168, 0.4)',
  },
  {
    id: 'department_head',
    badgeText: 'DEPARTMENT HEAD',
    badgeBg: '#b45309',
    badgeColor: '#ffffff',
    title: 'Sign in to Department Head',
    subtitle: 'Jasmin / Vidya — view + edit access across all branches',
    defaultEmail: 'jasmin@thoughtflows.in',
    defaultPassword: 'dept123',
    icon: BookOpenCheck,
    accentGlow: 'rgba(180, 83, 9, 0.4)',
  },
  {
    id: 'finance_manager',
    badgeText: 'FINANCE MANAGER',
    badgeBg: '#0d9488',
    badgeColor: '#ffffff',
    title: 'Sign in to Finance Manager',
    subtitle: 'Bank reconciliation — IDFC, HDFC, IndusInd transactions only',
    defaultEmail: 'finance@thoughtflows.in',
    defaultPassword: 'fin123',
    icon: BarChart2,
    accentGlow: 'rgba(13, 148, 136, 0.4)',
  },
  {
    id: 'branch_head',
    badgeText: 'BRANCH HEAD',
    badgeBg: '#cff4fc',
    badgeColor: '#087990',
    title: 'Sign in to Branch Head',
    subtitle: 'Enter your email and password — your branch will open automatically',
    defaultEmail: 'you@thoughtflows.in',
    defaultPassword: 'branch123',
    icon: Building,
    accentGlow: 'rgba(207, 244, 252, 0.4)',
  },
];

export default function LoginView() {
  const [selectedRole, setSelectedRole] = useState(ROLE_CARDS[0]);
  const [email, setEmail] = useState(ROLE_CARDS[0].defaultEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/income-expense';

  const handleRoleSelect = (roleObj) => {
    setSelectedRole(roleObj);
    setEmail(roleObj.defaultEmail);
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-login-viewport">
      
      {/* Container Box matching uploaded screenshot style */}
      <div className="portal-login-card">
        
        {/* Official Brand Logo */}
        <div className="login-brand-logo-area">
          <img src={logoImg} alt="Thoughtflows Medical Coding Academy" className="tf-brand-logo" />
        </div>

        {/* 5-Role Selector Tab Bar */}
        <div className="role-selector-tabs">
          {ROLE_CARDS.map((r) => {
            const isSelected = selectedRole.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleSelect(r)}
                className={`role-tab-chip ${isSelected ? 'active' : ''}`}
                style={isSelected ? { borderColor: r.badgeBg } : {}}
              >
                <span 
                  className="role-tab-badge"
                  style={{ background: r.badgeBg, color: r.badgeColor }}
                >
                  {r.badgeText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Role Badge Pill Header */}
        <div className="login-role-badge-wrapper">
          <div 
            className="login-role-badge-pill"
            style={{ 
              background: selectedRole.badgeBg, 
              color: selectedRole.badgeColor,
              boxShadow: `0 4px 14px ${selectedRole.accentGlow}`
            }}
          >
            {selectedRole.badgeText}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="login-card-header">
          <h2 className="role-sign-in-title">{selectedRole.title}</h2>
          <p className="role-sign-in-subtitle">{selectedRole.subtitle}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-banner">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="role-login-form">
          
          <div className="form-field-group">
            <label className="field-label-bold">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@thoughtflows.in"
              className="role-form-input"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-field-group">
            <div className="password-label-row">
              <label className="field-label-bold">PASSWORD</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="show-password-btn"
                tabIndex={-1}
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-teal-600" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              className="role-form-input"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <span className="input-hint-text">Click "Show" to verify what you typed</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="navy-sign-in-btn"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Light Teal Password Alert Info Box */}
        <div className="password-help-alert-box">
          <p>
            Enter the password BB Admin set up for your account. Forgot? Ask BB Admin for a reset.
          </p>
        </div>

      </div>

    </div>
  );
}
