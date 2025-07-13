import { apiCall } from './api';

// ==================== AGENTIC AI SESSION MANAGEMENT ====================

/**
 * Tạo Agentic AI session mới
 * @param {string} title - Tiêu đề của session
 * @param {string} description - Mô tả session
 * @returns {Promise<Object>} Thông tin session mới
 */
export const createAgenticSession = async (title = 'Agentic AI Session', description = null) => {
  try {
    console.log('[AGENTIC API] Tạo Agentic session mới:', { title, description });
    const response = await apiCall('/agentic/sessions', 'POST', { 
      title, 
      description 
    });
    console.log('[AGENTIC API] Agentic session tạo thành công:', response);
    return response.session;
  } catch (error) {
    console.error('[AGENTIC API] Lỗi tạo Agentic session:', error);
    throw error;
  }
};

/**
 * Lấy danh sách Agentic AI sessions của user
 * @returns {Promise<Object>} Danh sách sessions
 */
export const getAgenticSessions = async () => {
  try {
    console.log('[AGENTIC API] Lấy danh sách Agentic sessions');
    const response = await apiCall('/agentic/sessions', 'GET');
    console.log('[AGENTIC API] Danh sách Agentic sessions:', response);
    return response;
  } catch (error) {
    console.error('[AGENTIC API] Lỗi lấy Agentic sessions:', error);
    throw error;
  }
};

/**
 * Lấy tin nhắn của Agentic AI session
 * @param {string} sessionId - ID của session
 * @param {number} limit - Số lượng messages tối đa
 * @returns {Promise<Object>} Danh sách messages
 */
export const getAgenticSessionMessages = async (sessionId, limit = 50) => {
  try {
    console.log('[AGENTIC API] Lấy messages cho Agentic session:', sessionId);
    const response = await apiCall(`/agentic/sessions/${sessionId}?limit=${limit}`, 'GET');
    console.log('[AGENTIC API] Agentic messages nhận được:', response);
    return response;
  } catch (error) {
    console.error('[AGENTIC API] Lỗi lấy Agentic messages:', error);
    throw error;
  }
};

/**
 * Chat với Agentic AI session
 * @param {string} sessionId - ID của session
 * @param {string} userRequest - Yêu cầu của user
 * @returns {Promise<Object>} Response từ Agentic AI
 */
export const chatWithAgenticSession = async (sessionId, userRequest) => {
  try {
    console.log('[AGENTIC API] Chat với Agentic session:', { sessionId, userRequest });
    const response = await apiCall(`/agentic/sessions/${sessionId}/chat`, 'POST', {
      user_request: userRequest
    });
    console.log('[AGENTIC API] Agentic response:', response);
    return response;
  } catch (error) {
    console.error('[AGENTIC API] Lỗi chat với Agentic session:', error);
    throw error;
  }
};

/**
 * Xóa Agentic AI session
 * @param {string} sessionId - ID của session cần xóa
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteAgenticSession = async (sessionId) => {
  try {
    console.log('[AGENTIC API] Xóa Agentic session:', sessionId);
    const response = await apiCall(`/agentic/sessions/${sessionId}`, 'DELETE');
    console.log('[AGENTIC API] Agentic session đã xóa:', response);
    return response;
  } catch (error) {
    console.error('[AGENTIC API] Lỗi xóa Agentic session:', error);
    throw error;
  }
};

// ==================== AGENTIC AI CORE FUNCTIONS ====================

// Lên kế hoạch và thực hiện ngay (one-step)
export const agenticPlanAndExecute = async (userRequest) => {
  return await apiCall('/agentic/plan-and-execute', 'POST', { user_request: userRequest });
};

// Lấy danh sách các action có sẵn
export const agenticAvailableActions = async () => {
  return await apiCall('/agentic/available-actions', 'GET');
};

// (Có thể mở rộng thêm các hàm cho /plan, /execute nếu cần) 