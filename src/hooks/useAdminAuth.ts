import { useState, useEffect } from 'react';

interface AdminUser {
  username: string;
  loginTime: string;
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      console.log('useAdminAuth: checking auth status');
      const authStatus = localStorage.getItem('adminAuthenticated');
      const userData = localStorage.getItem('adminUser');
      
      console.log('useAdminAuth: authStatus =', authStatus);
      console.log('useAdminAuth: userData =', userData);
      
      if (authStatus === 'true' && userData) {
        const user = JSON.parse(userData);
        setAdminUser(user);
        setIsAuthenticated(true);
        console.log('useAdminAuth: user authenticated');
      } else {
        setIsAuthenticated(false);
        setAdminUser(null);
        console.log('useAdminAuth: user not authenticated');
      }
    } catch (error) {
      console.error('Error checking admin auth status:', error);
      setIsAuthenticated(false);
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (username: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('useAdminAuth: login called with', username, password);
      // Simulate API call
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
          console.log('useAdminAuth: credentials valid, setting up session');
          const userData = {
            username,
            loginTime: new Date().toISOString()
          };
          
          localStorage.setItem('adminAuthenticated', 'true');
          localStorage.setItem('adminUser', JSON.stringify(userData));
          
          setAdminUser(userData);
          setIsAuthenticated(true);
          console.log('useAdminAuth: authentication state updated');
          resolve(true);
        } else {
          console.log('useAdminAuth: invalid credentials');
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  return {
    isAuthenticated,
    adminUser,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };
};
