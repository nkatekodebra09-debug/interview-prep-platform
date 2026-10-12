import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function readStoredUser() {
  if (!localStorage.getItem('token')) {
    localStorage.removeItem('user');
    return null;
  }
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (userData, incomingToken = null) => {
    const normalizedUser = userData && userData.user ? userData.user : userData;
    const nextUser = normalizedUser
      ? {
          ...normalizedUser,
          name:
            normalizedUser.name ||
            normalizedUser.username ||
            normalizedUser.email?.split('@')[0] ||
            'Candidate',
          role: normalizedUser.role || 'student',
        }
      : null;

    const nextToken = incomingToken || userData?.token || null;
    if (!nextUser || !nextToken) {
      setUser(null);
      setToken(null);
      throw new Error('The server returned an incomplete sign-in response. Please try again.');
    }
    setUser(nextUser);
    setToken(nextToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const hasRole = (role) => user?.role === role;

  const value = useMemo(() => ({ user, token, login, logout, hasRole }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
