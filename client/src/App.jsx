import React, { useState, useEffect, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import CreateReceiptModal from './components/CreateReceiptModal';

import LoginView from './views/LoginView';
import IncomeExpenseView from './views/IncomeExpenseView';
import DailyBusinessView from './views/DailyBusinessView';
import B2BRegistryView from './views/B2BRegistryView';
import PendingFeesView from './views/PendingFeesView';
import ProfitLossView from './views/ProfitLossView';
import EmployeeSalariesView from './views/EmployeeSalariesView';
import BalanceSheetView from './views/BalanceSheetView';
import InitialInvestmentView from './views/InitialInvestmentView';
import UserGuideView from './views/UserGuideView';

import './styles/main.css';
import './styles/sidebar.css';
import './styles/header.css';
import './styles/dashboard.css';
import './styles/modal.css';
import './styles/modules.css';
import './styles/login.css';

// React Error Boundary Component to prevent white screens
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#0f172a', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fb7185', marginBottom: '12px' }}>Something went wrong loading this section</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '500px', marginBottom: '20px' }}>
            {this.state.error?.toString() || 'An unexpected rendering error occurred.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            Refresh Portal Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Re-animates every element in the right section on path switch
function AnimatedContentWrapper({ selectedBranch, setSelectedBranch }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="portal-content-view animate-section-entrance">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/income-expense" replace />} />
          
          <Route path="/income-expense" element={
            <ProtectedRoute allowedRoles={['admin', 'management']}>
              <IncomeExpenseView selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
            </ProtectedRoute>
          } />
          
          <Route path="/daily-business" element={
            <ProtectedRoute allowedRoles={['admin', 'management']}>
              <DailyBusinessView selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
            </ProtectedRoute>
          } />
          
          <Route path="/b2b" element={
            <ProtectedRoute allowedRoles={['admin', 'management']}>
              <B2BRegistryView selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
            </ProtectedRoute>
          } />
          
          <Route path="/pending-fees" element={
            <ProtectedRoute allowedRoles={['admin', 'management']}>
              <PendingFeesView selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
            </ProtectedRoute>
          } />
          
          <Route path="/profit-loss" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProfitLossView selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
            </ProtectedRoute>
          } />
          
          <Route path="/payroll" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EmployeeSalariesView selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
            </ProtectedRoute>
          } />
          
          <Route path="/balance-sheet" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BalanceSheetView selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
            </ProtectedRoute>
          } />
          
          <Route path="/initial-investment" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <InitialInvestmentView selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
            </ProtectedRoute>
          } />
          
          <Route path="/user-guide" element={
            <ProtectedRoute allowedRoles={['admin', 'management']}>
              <UserGuideView />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/income-expense" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

function MainDashboardLayout() {
  const [selectedBranch, setSelectedBranch] = useState('Pune (FC Road) ★');
  const [isGlobalReceiptModalOpen, setIsGlobalReceiptModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="portal-app-layout">
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`mobile-sidebar-backdrop ${isMobileOpen ? 'mobile-open' : ''}`} 
        onClick={() => setIsMobileOpen(false)} 
      />

      {/* Fixed / Mobile Off-Canvas Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        onCloseMobile={() => setIsMobileOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="portal-main-wrapper">
        {/* Sticky Top Header */}
        <TopHeader
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          onOpenReceiptModal={() => setIsGlobalReceiptModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileOpen(prev => !prev)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Animated Module Viewport */}
        <AnimatedContentWrapper 
          selectedBranch={selectedBranch} 
          setSelectedBranch={setSelectedBranch} 
        />
      </div>

      {/* Global Quick Receipt Modal */}
      <CreateReceiptModal
        isOpen={isGlobalReceiptModalOpen}
        onClose={() => setIsGlobalReceiptModalOpen(false)}
        onSaveSuccess={() => {
          window.location.reload();
        }}
        initialBranch={selectedBranch}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/*" element={<MainDashboardLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
