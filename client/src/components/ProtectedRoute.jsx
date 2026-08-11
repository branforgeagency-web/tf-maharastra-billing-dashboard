import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-slate-900, #0f172a)',
        color: '#fff',
        fontFamily: 'inherit'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(16, 185, 129, 0.2)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>
          Verifying security session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '16px',
          color: '#ef4444',
          marginBottom: '16px'
        }}>
          <ShieldAlert size={48} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-slate-100)' }}>
          Access Restricted
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-slate-400)', maxWidth: '420px', marginBottom: '24px' }}>
          Your current account role (<strong>{user.role?.toUpperCase()}</strong>) does not have authorization to view this confidential section. Please contact your system administrator.
        </p>
        <button
          onClick={() => window.location.href = '/income-expense'}
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Return to Dashboard Home
        </button>
      </div>
    );
  }

  return children;
}
