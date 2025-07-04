const API_URL = 'http://localhost:5000/api';

// Helper function để lấy headers với token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Đăng nhập
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Đăng nhập thất bại');
    }

    // Lưu token và thông tin user vào localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user.id);
    }

    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Đăng ký (chỉ admin mới có thể đăng ký user mới)
export const registerUser = async (username, password, role = 'user') => {
  try {
    const response = await fetch(`${API_URL}/admin/register_user`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Đăng ký thất bại');
    }

    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Lấy thông tin profile user
export const getProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lấy thông tin thất bại');
    }

    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

// Lấy danh sách tất cả users (chỉ admin)
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lấy danh sách users thất bại');
    }

    return data;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Cập nhật thông tin user (chỉ admin)
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Cập nhật user thất bại');
    }

    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Xóa user (chỉ admin)
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Xóa user thất bại');
    }

    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
};

// Kiểm tra token có hợp lệ không
export const checkAuth = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
};

// Lấy thông tin user từ localStorage
export const getCurrentUser = () => {
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  
  if (!username || !role || !userId) {
    return null;
  }
  
  return {
    id: userId,
    username,
    role,
    isAdmin: role === 'admin'
  };
}; 