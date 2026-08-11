import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Fallback demo accounts for local testing if backend API is updating or unreachable
const DEMO_5_ACCOUNTS = {
  'management@thoughtflows.in': {
    id: 'demo-bbadmin-id',
    email: 'management@thoughtflows.in',
    role: 'bb_admin',
    branch: 'All Branches (Global View)',
    password: 'manage123',
  },
  'karthik@thoughtflows.in': {
    id: 'demo-opshead-id',
    email: 'karthik@thoughtflows.in',
    role: 'operations_head',
    branch: 'All Branches (Global View)',
    password: 'ops123',
  },
  'jasmin@thoughtflows.in': {
    id: 'demo-depthead-id',
    email: 'jasmin@thoughtflows.in',
    role: 'department_head',
    branch: 'All Branches (Global View)',
    password: 'dept123',
  },
  'finance@thoughtflows.in': {
    id: 'demo-finmanager-id',
    email: 'finance@thoughtflows.in',
    role: 'finance_manager',
    branch: 'All Branches (Global View)',
    password: 'fin123',
  },
  'you@thoughtflows.in': {
    id: 'demo-branchhead-id',
    email: 'you@thoughtflows.in',
    role: 'branch_head',
    branch: 'Pune (FC Road) ★',
    password: 'branch123',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('tf_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('tf_auth_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('tf_auth_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('tf_auth_user', JSON.stringify(data.user));
        } else if (res.status === 401) {
          localStorage.removeItem('tf_auth_token');
          localStorage.removeItem('tf_auth_user');
          setUser(null);
          setToken(null);
        } else {
          const savedUser = localStorage.getItem('tf_auth_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (err) {
        console.warn('Backend auth check skipped, using stored session if available:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Login handler accepting email/username and password
  const login = async (emailOrUsername, password) => {
    const cleanIdentifier = emailOrUsername.toLowerCase().trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanIdentifier, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        localStorage.setItem('tf_auth_token', data.token);
        localStorage.setItem('tf_auth_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      if (err.message && !err.message.includes('Unexpected token') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: Check 5 default accounts locally if server returns non-JSON / HTML
    const demoAcc = DEMO_5_ACCOUNTS[cleanIdentifier];
    if (demoAcc && demoAcc.password === password) {
      const demoToken = `demo-jwt-${demoAcc.role}-${Date.now()}`;
      const userPayload = {
        id: demoAcc.id,
        email: demoAcc.email,
        role: demoAcc.role,
        branch: demoAcc.branch,
      };

      localStorage.setItem('tf_auth_token', demoToken);
      localStorage.setItem('tf_auth_user', JSON.stringify(userPayload));
      setToken(demoToken);
      setUser(userPayload);
      return userPayload;
    }

    throw new Error('Invalid email or password.');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('tf_auth_token');
    localStorage.removeItem('tf_auth_user');
    setToken(null);
    setUser(null);
  };

  const isAdminRole = ['bb_admin', 'operations_head', 'admin'].includes(user?.role);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin: isAdminRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
