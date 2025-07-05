import { apiCall } from './api';

// ==================== CHAT SESSION MANAGEMENT ====================

/**
 * Tạo chat session mới
 * @param {string} title - Tiêu đề của session
 * @returns {Promise<Object>} Thông tin session mới
 */
export const createChatSession = async (title = 'New Chat') => {
  try {
    console.log('[CHAT API] Tạo session mới:', title);
    const response = await apiCall('/chat/sessions', 'POST', { title });
    console.log('[CHAT API] Session tạo thành công:', response);
    return response;
  } catch (error) {
    console.error('[CHAT API] Lỗi tạo session:', error);
    throw error;
  }
};

/**
 * Lấy danh sách chat sessions của user
 * @returns {Promise<Object>} Danh sách sessions
 */
export const getChatSessions = async () => {
  try {
    console.log('[CHAT API] Lấy danh sách sessions');
    const response = await apiCall('/chat/sessions', 'GET');
    console.log('[CHAT API] Danh sách sessions:', response);
    return response;
  } catch (error) {
    console.error('[CHAT API] Lỗi lấy sessions:', error);
    throw error;
  }
};

/**
 * Lấy danh sách messages trong một session
 * @param {string} sessionId - ID của session
 * @param {number} limit - Số lượng messages tối đa
 * @returns {Promise<Object>} Danh sách messages
 */
export const getChatMessages = async (sessionId, limit = 50) => {
  try {
    console.log('[CHAT API] Lấy messages cho session:', sessionId);
    const response = await apiCall(`/chat/sessions/${sessionId}?limit=${limit}`, 'GET');
    console.log('[CHAT API] Messages nhận được:', response);
    return response;
  } catch (error) {
    console.error('[CHAT API] Lỗi lấy messages:', error);
    throw error;
  }
};

/**
 * Xóa chat session
 * @param {string} sessionId - ID của session cần xóa
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteChatSession = async (sessionId) => {
  try {
    console.log('[CHAT API] Xóa session:', sessionId);
    const response = await apiCall(`/chat/sessions/${sessionId}`, 'DELETE');
    console.log('[CHAT API] Session đã xóa:', response);
    return response;
  } catch (error) {
    console.error('[CHAT API] Lỗi xóa session:', error);
    throw error;
  }
};

/**
 * Cập nhật tiêu đề session
 * @param {string} sessionId - ID của session
 * @param {string} title - Tiêu đề mới
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const updateSessionTitle = async (sessionId, title) => {
  try {
    console.log('[CHAT API] Cập nhật tiêu đề session:', sessionId, title);
    const response = await apiCall(`/chat/sessions/${sessionId}/title`, 'PUT', { title });
    console.log('[CHAT API] Tiêu đề đã cập nhật:', response);
    return response;
  } catch (error) {
    console.error('[CHAT API] Lỗi cập nhật tiêu đề:', error);
    throw error;
  }
};

// ==================== MESSAGE SENDING ====================

/**
 * Gửi message trong session
 * @param {string} sessionId - ID của session
 * @param {string} message - Nội dung message
 * @param {Array} fileUrls - Danh sách URL files (tùy chọn)
 * @returns {Promise<Object>} Response từ AI
 */
export const sendMessage = async (sessionId, message, fileUrls = []) => {
  try {
    console.log('[CHAT API] Gửi message:', { sessionId, message, fileUrls });
    const response = await apiCall(`/chat/sessions/${sessionId}/send`, 'POST', {
      message,
      file_urls: fileUrls
    });
    console.log('[CHAT API] Response nhận được:', response);
    return response;
  } catch (error) {
    console.error('[CHAT API] Lỗi gửi message:', error);
    throw error;
  }
};

/**
 * Chat đơn giản (không session)
 * @param {string} message - Nội dung message
 * @returns {Promise<Object>} Response từ AI
 */
export const chatSimple = async (message) => {
  try {
    console.log('[CHAT API] Chat đơn giản:', message);
    const response = await apiCall('/chat', 'POST', { message });
    console.log('[CHAT API] Response chat đơn giản:', response);
    return response;
  } catch (error) {
    console.error('[CHAT API] Lỗi chat đơn giản:', error);
    throw error;
  }
};

// ==================== ENHANCED CHAT ====================

/**
 * Enhanced chat với tìm kiếm file và phân loại
 * @param {string} message - Nội dung message
 * @param {Object} options - Tùy chọn
 * @param {boolean} options.search_files - Có tìm kiếm files không
 * @param {boolean} options.include_classification - Có phân loại không
 * @returns {Promise<Object>} Response từ AI với context
 */
export const chatEnhanced = async (message, options = {}) => {
  try {
    const { search_files = true, include_classification = true } = options;
    console.log('[CHAT API] Enhanced chat:', { message, options });
    
    const response = await apiCall('/chat/enhanced', 'POST', {
      message,
      search_files,
      include_classification
    });
    
    console.log('[CHAT API] Enhanced response:', response);
    return response;
  } catch (error) {
    console.error('[CHAT API] Lỗi enhanced chat:', error);
    throw error;
  }
};

/**
 * Enhanced chat với session management
 * @param {string} message - Nội dung message
 * @param {string} sessionId - ID của session
 * @param {Object} options - Tùy chọn
 * @returns {Promise<Object>} Response từ AI
 */
export const chatEnhancedWithSession = async (message, sessionId, options = {}) => {
  try {
    console.log('[CHAT API] Enhanced chat với session:', { message, sessionId, options });
    
    // Thử enhanced chat trước
    try {
      const enhancedResponse = await chatEnhanced(message, options);
      
      // Nếu thành công, lưu vào session
      if (enhancedResponse.success) {
        await sendMessage(sessionId, message);
      }
      
      return enhancedResponse;
    } catch (enhancedError) {
      console.warn('[CHAT API] Enhanced chat thất bại, fallback về session chat:', enhancedError);
      
      // Fallback về session chat thường
      const sessionResponse = await sendMessage(sessionId, message);
      return {
        success: true,
        message: message,
        response: sessionResponse.response,
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }
  } catch (error) {
    console.error('[CHAT API] Lỗi enhanced chat với session:', error);
    throw error;
  }
};

/**
 * Enhanced chat legacy (tương thích ngược)
 * @param {string} message - Nội dung message
 * @returns {Promise<Object>} Response từ AI
 */
export const chatEnhancedLegacy = async (message) => {
  try {
    console.log('[CHAT API] Enhanced chat legacy:', message);
    const response = await apiCall('/chat/enhanced', 'POST', { message });
    console.log('[CHAT API] Legacy response:', response);
    return response;
  } catch (error) {
    console.error('[CHAT API] Lỗi enhanced chat legacy:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Kiểm tra trạng thái backend
 * @returns {Promise<boolean>} Backend có hoạt động không
 */
export const checkBackendStatus = async () => {
  try {
    console.log('[CHAT API] Kiểm tra backend status');
    const response = await apiCall('/system/status', 'GET');
    console.log('[CHAT API] Backend status:', response);
    
    // Backend có thể trả về 'ok' hoặc 'running'
    const isHealthy = response.status === 'ok' || response.status === 'running';
    console.log('[CHAT API] Backend healthy:', isHealthy);
    
    return isHealthy;
  } catch (error) {
    console.error('[CHAT API] Backend không khả dụng:', error);
    return false;
  }
};

/**
 * Format message cho hiển thị
 * @param {Object} messageData - Dữ liệu message từ backend
 * @returns {Array|Object} Message đã format (có thể là array nếu có cả user và bot message)
 */
export const formatMessage = (messageData) => {
  console.log('[CHAT API] Format message data:', messageData);
  
  // Backend trả về format: {id, message, response, created_at, message_type}
  // Frontend cần format: {id, text, sender, timestamp, files, metadata, response}
  
  // Nếu có cả message và response, tạo 2 messages (user + bot)
  if (messageData.message && messageData.response) {
    console.log('[CHAT API] Tạo cặp user-bot messages');
    return [
      {
        id: `${messageData.id}_user`,
        text: messageData.message,
        sender: 'user',
        timestamp: messageData.created_at || new Date().toISOString(),
        files: null,
        metadata: null
      },
      {
        id: `${messageData.id}_bot`,
        text: messageData.response,
        sender: 'bot',
        timestamp: new Date(messageData.created_at || Date.now()).toISOString(),
        files: messageData.file_sources || null,
        metadata: messageData.metadata || null
      }
    ];
  }
  
  // Nếu chỉ có message (user message)
  if (messageData.message && !messageData.response) {
    const formattedMessage = {
      id: messageData.id || Date.now(),
      text: messageData.message,
      sender: 'user',
      timestamp: messageData.created_at || new Date().toISOString(),
      files: null,
      metadata: null
    };
    console.log('[CHAT API] Formatted user message:', formattedMessage);
    return formattedMessage;
  }
  
  // Nếu chỉ có response (bot message)
  if (messageData.response && !messageData.message) {
    const formattedMessage = {
      id: messageData.id || Date.now(),
      text: messageData.response,
      sender: 'bot',
      timestamp: messageData.created_at || new Date().toISOString(),
      files: messageData.file_sources || null,
      metadata: messageData.metadata || null
    };
    console.log('[CHAT API] Formatted bot message:', formattedMessage);
    return formattedMessage;
  }
  
  // Fallback cho format cũ
  const formattedMessage = {
    id: messageData.id || Date.now(),
    text: messageData.message || messageData.content || '',
    sender: messageData.role === 'user' ? 'user' : 'bot',
    timestamp: messageData.timestamp || messageData.created_at || new Date().toISOString(),
    files: messageData.file_sources || messageData.files || null,
    metadata: messageData.metadata || null,
    response: messageData.response || null
  };
  
  console.log('[CHAT API] Formatted message (fallback):', formattedMessage);
  return formattedMessage;
};

/**
 * Format session cho hiển thị
 * @param {Object} sessionData - Dữ liệu session từ backend
 * @returns {Object} Session đã format
 */
export const formatSession = (sessionData) => {
  return {
    id: sessionData.id,
    title: sessionData.title,
    createdAt: sessionData.created_at,
    updatedAt: sessionData.updated_at,
    messageCount: sessionData.message_count || 0
  };
}; 