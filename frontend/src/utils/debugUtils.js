// Debug utilities cho chat system

// Load debug functions vào window object
export const loadDebugFunctions = () => {
  // Debug 1: Kiểm tra session hiện tại
  const debugCurrentSession = async () => {
    console.log('📋 Debug 1: Kiểm tra session hiện tại');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('✅ Sessions:', data);
      return data.sessions;
    } catch (error) {
      console.error('❌ Lỗi lấy sessions:', error);
      return [];
    }
  };

  // Debug 2: Kiểm tra messages của session cụ thể
  const debugSessionMessages = async (sessionId) => {
    console.log('📨 Debug 2: Kiểm tra messages của session:', sessionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/chat/sessions/${sessionId}?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('✅ Raw messages from API:', data);
      
      // Kiểm tra từng message
      if (data.messages && data.messages.length > 0) {
        console.log('📊 Chi tiết messages:');
        data.messages.forEach((msg, index) => {
          console.log(`Message ${index + 1}:`, {
            id: msg.id,
            message: msg.message,
            response: msg.response,
            created_at: msg.created_at,
            message_type: msg.message_type
          });
        });
      } else {
        console.log('⚠️ Không có messages nào trong session này');
      }
      
      return data.messages;
    } catch (error) {
      console.error('❌ Lỗi lấy messages:', error);
      return [];
    }
  };

  // Debug 3: Gửi test message
  const debugSendTestMessage = async (sessionId) => {
    console.log('💬 Debug 3: Gửi test message');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/chat/sessions/${sessionId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: 'Test message - ' + new Date().toISOString()
        })
      });
      const data = await response.json();
      console.log('✅ Test message response:', data);
      return data;
    } catch (error) {
      console.error('❌ Lỗi gửi test message:', error);
      return null;
    }
  };

  // Debug 4: Chạy tất cả debug functions
  const runAllDebug = async () => {
    console.log('🧪 Bắt đầu chạy tất cả debug functions...');
    
    // Debug 1: Sessions
    const sessions = await debugCurrentSession();
    
    if (sessions.length > 0) {
      const firstSession = sessions[0];
      console.log('🎯 Sử dụng session đầu tiên:', firstSession.id);
      
      // Debug 2: Messages của session
      await debugSessionMessages(firstSession.id);
      
      // Debug 3: Gửi test message
      await debugSendTestMessage(firstSession.id);
      
      // Debug 4: Kiểm tra lại messages sau khi gửi
      setTimeout(async () => {
        console.log('🔄 Kiểm tra lại messages sau khi gửi...');
        await debugSessionMessages(firstSession.id);
      }, 2000);
    }
    
    console.log('🎉 Tất cả debug functions đã hoàn thành!');
  };

  // Export functions
  window.debugMessages = {
    debugCurrentSession,
    debugSessionMessages,
    debugSendTestMessage,
    runAllDebug
  };

  console.log('📚 Debug functions đã được load!');
  console.log('Sử dụng: window.debugMessages.runAllDebug() để chạy tất cả debug');
  console.log('Hoặc: window.debugMessages.debugSessionMessages("session_id") để debug session cụ thể');
};

// Auto-load khi import
if (typeof window !== 'undefined') {
  loadDebugFunctions();
} 