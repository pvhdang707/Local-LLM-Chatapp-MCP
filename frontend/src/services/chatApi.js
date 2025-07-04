const API_URL = 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

// Tạo session chat mới
export const createChatSession = async (title) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/chat/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Không tạo được session mới');
  return response.json();
};

// Lấy danh sách session
export const getChatSessions = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/chat/sessions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Không lấy được danh sách session');
  return response.json();
};

// Lấy tin nhắn trong session
export const getChatMessages = async (sessionId, limit = 50) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/chat/sessions/${sessionId}?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Không lấy được tin nhắn');
  return response.json();
};

// Gửi tin nhắn trong session
export const sendMessage = async (sessionId, message) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/chat/sessions/${sessionId}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Không gửi được tin nhắn');
  return response.json();
};

// Xóa session
export const deleteChatSession = async (sessionId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Không xóa được session');
  return response.json();
};

// Đổi tên session
export const updateSessionTitle = async (sessionId, title) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/chat/sessions/${sessionId}/title`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Không đổi được tên session');
  return response.json();
};

// Chat nhanh (tự tạo session)
export const chat = async (message) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Không gửi được tin nhắn');
  return response.json();
};

// Chat nâng cao (tìm kiếm file + chat)
export const chatEnhanced = async (message, sessionId = null) => {
  const token = getAuthToken();
  const body = { message };
  if (sessionId) body.session_id = sessionId;
  const response = await fetch(`${API_URL}/chat/enhanced`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Không gửi được tin nhắn nâng cao');
  return response.json();
}; 