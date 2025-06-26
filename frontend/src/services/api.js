const API_URL = 'http://localhost:8000/api';

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