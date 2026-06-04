import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // При завантаженні — перевіряємо токен
useEffect(() => {
  if (!token) {
    setLoading(false);
    return;
  }

  fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      if (data) {
        setUser(data);
      } else {
        logout();
      }
    })
    .catch(() => {
      logout();
    })
    .finally(() => {
      setLoading(false);
    });
}, [token]);

  const login = (userData, newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Хелпер для fetch з токеном (використовується в усіх сторінках)
  const authFetch = async (url, options = {}) => {
    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
	...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (res.status === 401 && token) logout();
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
