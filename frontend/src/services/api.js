const API_URL = 'http://localhost:5000/api';

// Hàm gọi API chung
export const apiCall = async (endpoint, method = 'GET', data = null, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  // Xóa Content-Type nếu được set thành undefined
  if (options.headers && options.headers['Content-Type'] === undefined) {
    delete config.headers['Content-Type'];
  }

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Xử lý lỗi khác nhau cho blob và JSON response
      if (options.responseType === 'blob') {
        // Với blob response, không thể parse JSON
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
    }

    // Xử lý response dựa trên responseType
    if (options.responseType === 'blob') {
      return await response.blob();
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

export const sendMessage = async (message) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Có lỗi xảy ra khi gửi tin nhắn');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}; 