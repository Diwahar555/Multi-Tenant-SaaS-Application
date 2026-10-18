import { createContext, useContext, useEffect, useState } from 'react';
import { api, ensureCsrf, refreshAccess, setAccessToken } from '../api/client';

const AuthContext = createContext(null);
export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        await ensureCsrf();
        await refreshAccess();
        const {data} = await api.get('/me/');
        if (mounted) setUser(data);
      } catch { if (mounted) setUser(null); }
      finally { if (mounted) setLoading(false); }
    };
    bootstrap();
    const signedOut = () => { setAccessToken(null); setUser(null); };
    window.addEventListener('teamspace:signedout', signedOut);
    return () => { mounted = false; window.removeEventListener('teamspace:signedout', signedOut); };
  }, []);
  const login = async (username, password) => {
    await ensureCsrf();
    const {data} = await api.post('/auth/token/', { username, password });
    setAccessToken(data.access); setUser(data.user);
  };
  const register = async (values) => { await api.post('/auth/register/', values); await login(values.username, values.password); };
  const logout = async () => {
    try { await api.post('/auth/logout/'); } finally { setAccessToken(null); setUser(null); }
  };
  const updateProfile = async (values) => { const {data} = await api.patch('/me/', values); setUser(data); };
  return <AuthContext.Provider value={{user, loading, login, register, logout, updateProfile}}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
