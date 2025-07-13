import { apiCall } from './api';

// Lên kế hoạch và thực hiện ngay (one-step)
export const agenticPlanAndExecute = async (userRequest) => {
  return await apiCall('/agentic/plan-and-execute', 'POST', { user_request: userRequest });
};

// Lấy danh sách các action có sẵn
export const agenticAvailableActions = async () => {
  return await apiCall('/agentic/available-actions', 'GET');
};

// (Có thể mở rộng thêm các hàm cho /plan, /execute nếu cần) 