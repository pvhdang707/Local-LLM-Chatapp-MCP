// Import apiCall từ api.js
import { apiCall } from './api';

const API_URL = 'http://localhost:5000/api';

// Cấu hình upload file dựa trên backend config
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB
  ALLOWED_EXTENSIONS: ['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  ALLOWED_TYPES: {
    'txt': 'text/plain',
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
};

// Helper function để lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function để validate file
export const validateFile = (file) => {
  const errors = [];
  
  // Kiểm tra kích thước file
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    errors.push(`File quá lớn. Kích thước tối đa: ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  // Kiểm tra định dạng file
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    errors.push(`Định dạng file không được hỗ trợ. Các định dạng được phép: ${UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Upload file
export const uploadFile = async (file) => {
  try {
    // Validate file trước khi upload
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/user/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi upload file');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Lấy danh sách file của user
export const getUserFiles = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/user/files`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi lấy danh sách file');
    }

    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error('Error getting user files:', error);
    throw error;
  }
};

// Lấy danh sách file với thông tin chi tiết (phân loại, metadata)
export const getUserFilesEnhanced = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/user/files/enhanced`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi lấy danh sách file');
    }

    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error('Error getting enhanced user files:', error);
    throw error;
  }
};

// Xóa file
export const deleteFile = async (fileId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/user/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi xóa file');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Phân loại file bằng AI
export const classifyFile = async (fileId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/files/${fileId}/classify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi phân loại file');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error classifying file:', error);
    throw error;
  }
};

// Lấy metadata của file
export const getFileMetadata = async (fileId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/files/${fileId}/metadata`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi lấy metadata file');
    }

    const data = await response.json();
    return data.metadata;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};

// Lấy danh sách nhóm file theo phân loại
export const getFileGroups = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/files/groups`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi lấy nhóm file');
    }

    const data = await response.json();
    return data.groups;
  } catch (error) {
    console.error('Error getting file groups:', error);
    throw error;
  }
};

// Tải xuống file
export const downloadFile = async (fileId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    console.log('Starting download for file:', fileId);

    // Sử dụng fetch trực tiếp giống như adminApi.uploadFileWithPermissions
    const response = await fetch(`${API_URL}/user/files/download/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Không gửi Content-Type để tránh CORS preflight
      },
    });

    console.log('Download response status:', response.status);
    console.log('Download response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Tạo blob từ response
    const blob = await response.blob();
    console.log('Blob created:', blob.size, 'bytes');
    
    // Tạo URL cho blob
    const url = window.URL.createObjectURL(blob);
    console.log('Blob URL created:', url);
    
    // Tạo link tải xuống
    const link = document.createElement('a');
    link.href = url;
    link.download = ''; // Để browser tự động đặt tên file
    
    // Thêm link vào DOM và click
    document.body.appendChild(link);
    link.click();
    
    // Dọn dẹp
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Download completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

export { UPLOAD_CONFIG }; 