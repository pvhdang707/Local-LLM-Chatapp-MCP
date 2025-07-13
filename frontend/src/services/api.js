import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Tạo axios instance với interceptor để tự động thêm token
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Hàm gọi API chung
export const apiCall = async (endpoint, method = 'GET', data = null, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
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
    const response = await fetch(`${API_BASE}/chat`, {
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

export async function getChatSessions() {
  try {
    const res = await apiClient.get('/chat/sessions');
    // Đảm bảo trả về mảng session
    return Array.isArray(res.data) ? res.data : (res.data.sessions || []);
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    throw error;
  }
}

export async function getChatMessages(sessionId) {
  try {
    const res = await apiClient.get(`/chat/sessions/${sessionId}`);
    // Đảm bảo trả về mảng messages
    return Array.isArray(res.data) ? res.data : (res.data.messages || []);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
}

export async function createChatSession(title = 'Cuộc trò chuyện mới') {
  try {
    const res = await apiClient.post('/chat/sessions', { title });
    // Đảm bảo trả về object session
    return res.data.session || res.data;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

export const sendChatMessage = async (sessionId, message, sessionType = 'normal') => {
  try {
    const response = await fetch(`${API_BASE}/chat/sessions/${sessionId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        message,
        session_type: sessionType  // Thêm session_type vào request
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] sendChatMessage response:', data);
    return data;
  } catch (error) {
    console.error('[API] Error in sendChatMessage:', error);
    throw error;
  }
};

export async function deleteChatSession(sessionId) {
  try {
    const res = await apiClient.delete(`/chat/sessions/${sessionId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

export async function updateSessionTitle(sessionId, title) {
  try {
    const res = await apiClient.put(`/chat/sessions/${sessionId}/title`, { title });
    return res.data;
  } catch (error) {
    console.error('Error updating session title:', error);
    throw error;
  }
}

// Feedback API
export async function submitFeedback(feedbackData) {
  try {
    const res = await apiClient.post('/feedback', feedbackData);
    return res.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}