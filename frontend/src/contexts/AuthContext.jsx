import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, logout as logoutApi, checkAuth, getProfile, getCurrentUser } from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userDepartment, setUserDepartment] = useState(null); // Thêm department state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra authentication khi app khởi động
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          // Lấy thông tin user từ localStorage trước
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAdmin(currentUser.isAdmin);
            setUserDepartment(currentUser.department); // Thêm department
          } else {
            // Nếu không có trong localStorage, lấy từ API
            const profileData = await getProfile();
            const userData = {
              id: profileData.id,
              username: profileData.username,
              role: profileData.role,
              department: profileData.department, // Thêm department
              isAdmin: profileData.role === 'admin'
            };
            setUser(userData);
            setIsAdmin(userData.isAdmin);
            setUserDepartment(userData.department); // Thêm department
          }
        } else {
          // Token không hợp lệ, xóa thông tin cũ
          logoutApi();
          setUser(null);
          setIsAdmin(false);
          setUserDepartment(null); // Thêm reset department
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Có lỗi, xóa thông tin cũ
        logoutApi();
        setUser(null);
        setIsAdmin(false);
        setUserDepartment(null); // Thêm reset department
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Hàm đăng nhập
  const login = async (username, password) => {
    try {
      const result = await loginApi(username, password);
      
      if (result.success) {
        const userData = {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
          department: result.user.department, // Thêm department
          isAdmin: result.user.role === 'admin'
        };
        setUser(userData);
        setIsAdmin(userData.isAdmin);
        setUserDepartment(userData.department); // Thêm department
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    logoutApi();
    setUser(null);
    setIsAdmin(false);
    setUserDepartment(null); // Thêm reset department
  };

  // Hàm cập nhật thông tin user
  const updateUser = (userData) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
    setUserDepartment(userData.department); // Thêm department
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      userDepartment, // Thêm department
      login, 
      logout, 
      loading,
      updateUser,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
