import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập chưa
    const username = localStorage.getItem('username');
    if (username) {
      setUser({ username });
      // Kiểm tra xem có phải admin không
      setIsAdmin(username.toLowerCase() === 'admin');
    }
  }, []);

  // Hàm đăng nhập
  const login = (username) => {
    const isAdminUser = username.toLowerCase() === 'admin';
    
    setUser({ username });
    setIsAdmin(isAdminUser);
    localStorage.setItem('username', username);
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng Auth Context
export const useAuth = () => useContext(AuthContext);
