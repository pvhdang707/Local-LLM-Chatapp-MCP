import { apiCall } from './api';
const API_URL = 'http://localhost:5000/api';

// ==================== USER MANAGEMENT ====================

export const adminApi = {
  // Lấy danh sách tất cả users
  getAllUsers: async (page = 1, perPage = 10) => {
    return apiCall(`/admin/users?page=${page}&per_page=${perPage}`, 'GET');
  },

  // Tạo user mới
  createUser: async (userData) => {
    return apiCall('/admin/register_user', 'POST', userData);
  },

  // Cập nhật thông tin user
  updateUser: async (userId, userData) => {
    return apiCall(`/admin/users/${userId}`, 'PUT', userData);
  },

  // Xóa user
  deleteUser: async (userId) => {
    return apiCall(`/admin/users/${userId}`, 'DELETE');
  },

  // ==================== SYSTEM MANAGEMENT ====================

  // Kiểm tra trạng thái server
  getServerStatus: async () => {
    return apiCall('/system/status', 'GET');
  },

  // Kiểm tra sức khỏe hệ thống
  getSystemHealth: async () => {
    return apiCall('/system/health', 'GET');
  },

  // ==================== FILE MANAGEMENT (ADMIN VIEW) ====================

  // Lấy tất cả files (admin có thể xem tất cả)
  getAllFiles: async () => {
    return apiCall('/user/files', 'GET');
  },

  // Lấy files với thông tin chi tiết
  getFilesEnhanced: async () => {
    return apiCall('/user/files/enhanced', 'GET');
  },

  // Upload file với phân quyền
  uploadFileWithPermissions: async (formData) => {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/admin/upload_file`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  // Upload nhiều file với phân quyền
  uploadFilesBatchWithPermissions: async (formData) => {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/admin/upload_files_batch`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  // Xóa file
  deleteFile: async (fileId) => {
    return apiCall(`/user/files/${fileId}`, 'DELETE');
  },

  // Tải xuống file
  downloadFile: async (fileId) => {
    return apiCall(`/user/files/download/${fileId}`, 'GET', null, { responseType: 'blob' });
  },

  // Phân loại file
  classifyFile: async (fileId) => {
    return apiCall(`/files/${fileId}/classify`, 'POST');
  },

  // Phân loại nhiều file
  classifyFilesBatch: async (fileIds) => {
    return apiCall('/files/classify/batch', 'POST', { file_ids: fileIds });
  },

  // Lấy nhóm file
  getFileGroups: async () => {
    return apiCall('/files/groups', 'GET');
  },

  // Lấy metadata file
  getFileMetadata: async (fileId) => {
    return apiCall(`/files/${fileId}/metadata`, 'GET');
  },

  // Lấy metadata nhiều file
  getFilesMetadataBatch: async (fileIds) => {
    return apiCall('/files/metadata/batch', 'POST', { file_ids: fileIds });
  },

  // ==================== STATISTICS ====================

  // Lấy thống kê tổng quan
  getSystemStats: async () => {
    try {
      const [users, files, health] = await Promise.all([
        adminApi.getAllUsers(1, 1), // Chỉ lấy để đếm tổng
        adminApi.getAllFiles(),
        adminApi.getSystemHealth()
      ]);

      return {
        totalUsers: users.total || 0,
        totalFiles: files.files?.length || 0,
        systemHealth: health,
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}; 