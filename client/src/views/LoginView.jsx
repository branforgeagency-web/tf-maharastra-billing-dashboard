import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Users, BookOpenCheck, BarChart3, Building2, 
  Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react';
import logoImg from '../assets/thoughtflows-logo.png';

const ROLE_CARDS = [
  {
    id: 'bb_admin',
    badgeText: 'MANAGEMENT (BB ADMIN)',
    roleTitle: 'Management (BB Admin)',
    badgeGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    glowColor: 'rgba(67, 56, 202, 0.45)',
    accentColor: '#6366f1',
    subtitle: 'Balu & Bhanu — head office full access to all 11 branches',
    defaultEmail: 'management@thoughtflows.in',
    defaultPassword: 'manage123',
    icon: Shield,
  },
  {
    id: 'operations_head',
    badgeText: 'OPERATIONS HEAD',
    roleTitle: 'Operations Head',
    badgeGradient: 'linear-gradient(135deg, #581c87 0%, #7e22ce 50%, #9333ea 100%)',
    glowColor: 'rgba(147, 51, 234, 0.45)',
    accentColor: '#a855f7',
    subtitle: 'Kartheeswari — sub-admin with full visibility across all branches',
    defaultEmail: 'karthik@thoughtflows.in',
    defaultPassword: 'ops123',
    icon: Users,
  },
  {
    id: 'department_head',
    badgeText: 'DEPARTMENT HEAD',
    roleTitle: 'Department Head',
    badgeGradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
    glowColor: 'rgba(234, 88, 12, 0.45)',
    accentColor: '#f97316',
    subtitle: 'Jasmin / Vidya — view + edit access across all branches',
    defaultEmail: 'jasmin@thoughtflows.in',
    defaultPassword: 'dept123',
    icon: BookOpenCheck,
  },
  {
    id: 'finance_manager',
    badgeText: 'FINANCE MANAGER',
    roleTitle: 'Finance Manager',
    badgeGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    accentColor: '#10b981',
    subtitle: 'Bank reconciliation — IDFC, HDFC, IndusInd transactions only',
    defaultEmail: 'finance@thoughtflows.in',
    defaultPassword: 'fin123',
    icon: BarChart3,
  },
  {
    id: 'branch_head',
    badgeText: 'BRANCH HEAD',
    roleTitle: 'Branch Head',
    badgeGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    accentColor: '#38bdf8',
    subtitle: 'Enter your email and password — your branch will open automatically',
    defaultEmail: 'you@thoughtflows.in',
    defaultPassword: 'branch123',
    icon: Building2,
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
    <div className="modern-login-viewport">
      
      {/* Dynamic Ambient Background Orbs */}
      <div className="ambient-orb orb-emerald" />
      <div className="ambient-orb orb-indigo" />
      <div className="ambient-orb orb-cyan" />

      <div className="modern-login-card">
        
        {/* Top Brand Banner */}
        <div className="login-brand-header">
          <div className="brand-logo-glow-box">
            <img src={logoImg} alt="Thoughtflows Medical Coding Academy" className="brand-logo-img" />
          </div>
        </div>

        {/* 5-Role Modern Interactive Switcher */}
        <div className="modern-role-selector-container">
          <span className="selector-label">SELECT DASHBOARD ROLE</span>
          <div className="modern-role-cards-grid">
            {ROLE_CARDS.map((r) => {
              const isSelected = selectedRole.id === r.id;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`modern-role-card-item ${isSelected ? 'active' : ''}`}
                  style={isSelected ? {
                    borderColor: r.accentColor,
                    boxShadow: `0 8px 24px -4px ${r.glowColor}`,
                  } : {}}
                >
                  <div 
                    className="role-card-icon-box"
                    style={{ background: r.badgeGradient }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="role-card-chip-title">{r.badgeText}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Active Badge Pill */}
        <div key={selectedRole.id} className="role-view-entrance-anim">
          <div className="active-role-pill-wrapper">
            <div 
              className="active-role-badge-pill"
              style={{
                background: selectedRole.badgeGradient,
                boxShadow: `0 6px 20px -2px ${selectedRole.glowColor}`
              }}
            >
              <selectedRole.icon className="w-4 h-4 text-white/90 stroke-[2.5]" />
              <span>{selectedRole.badgeText}</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="role-title-block">
            <h2 className="role-main-title">Sign in to {selectedRole.roleTitle}</h2>
            <p className="role-main-subtitle">{selectedRole.subtitle}</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="modern-error-alert">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="modern-login-form">
          
          <div className="form-input-group">
            <label className="input-label-header">EMAIL</label>
            <div className="input-field-wrapper">
              <Mail className="input-left-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@thoughtflows.in"
                className="modern-text-input"
                autoComplete="email"
                disabled={isSubmitting}
                style={{
                  '--focus-color': selectedRole.accentColor
                }}
              />
            </div>
          </div>

          <div className="form-input-group">
            <div className="label-with-action">
              <label className="input-label-header">PASSWORD</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-link"
                tabIndex={-1}
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>

            <div className="input-field-wrapper">
              <Lock className="input-left-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="modern-text-input"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>
            <span className="field-hint-sub">Click "Show" to verify what you typed</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="modern-primary-submit-btn"
            style={{
              background: 'linear-gradient(135deg, #1b2a4a 0%, #0f172a 100%)',
              boxShadow: `0 8px 24px -4px rgba(27, 42, 74, 0.4)`
            }}
          >
            {isSubmitting ? (
              <span className="btn-flex-center">
                <span className="pulse-loader" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="btn-flex-center">
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            )}
          </button>
        </form>

        {/* Light Teal Info Alert Box */}
        <div className="modern-help-info-card">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p>
            Enter the password BB Admin set up for your account. Forgot? Ask BB Admin for a reset.
          </p>
        </div>

      </div>

    </div>
  );
}
