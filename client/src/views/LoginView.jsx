import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ShieldCheck, UserCheck, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import logoImg from '../assets/thoughtflows-logo.png';

export default function LoginView() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/income-expense';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please fill in both username and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (userRole) => {
    setError('');
    setIsSubmitting(true);
    const demoCreds = userRole === 'admin' 
      ? { user: 'admin', pass: 'admin123' } 
      : { user: 'management', pass: 'manage123' };

    setUsername(demoCreds.user);
    setPassword(demoCreds.pass);

    try {
      await login(demoCreds.user, demoCreds.pass);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login with demo credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      
      {/* Background Ambient Glow Orbs */}
      <div className="ambient-glow orb-1" />
      <div className="ambient-glow orb-2" />

      <div className="login-card-container">
        
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-logo-container">
            <img src={logoImg} alt="Thoughtflows Medical Coding Academy" className="login-logo-img" />
          </div>
          <h1 className="login-title">Thought Flows Portal</h1>
          <p className="login-subtitle">Maharashtra Financial & Billing Management</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <User className="input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username (e.g. admin)"
                className="login-input"
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="login-input"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="login-submit-btn"
          >
            {isSubmitting ? (
              <span className="btn-loading-flex">
                <span className="spinner-sm"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="btn-text-flex">
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>OR QUICK ACCESS</span>
        </div>

        {/* Quick Demo Role Cards */}
        <div className="demo-accounts-grid">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            disabled={isSubmitting}
            className="demo-card demo-admin"
          >
            <div className="demo-card-icon admin-bg">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="demo-card-text">
              <span className="demo-role-title">Admin Role</span>
              <span className="demo-role-sub">Full System Access</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-60 ml-auto" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('management')}
            disabled={isSubmitting}
            className="demo-card demo-management"
          >
            <div className="demo-card-icon management-bg">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            <div className="demo-card-text">
              <span className="demo-role-title">Management Role</span>
              <span className="demo-role-sub">Operations & Billing</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-sky-400 opacity-60 ml-auto" />
          </button>
        </div>

        {/* Footer info */}
        <div className="login-footer">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit Encrypted Session • Maharashtra Branch Network</span>
        </div>

      </div>
    </div>
  );
}
