import React, { useState } from 'react';
import { deleteChatSession, updateSessionTitle } from '../services/api';
import ConfirmModal from './ConfirmModal';
import SessionTypeModal from './SessionTypeModal';

const ChatSessionList = ({
  sessions = [],
  selectedSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteChat,
  onUpdateSession
}) => {
  const [editingSession, setEditingSession] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);

  // Sửa lại: chỉ mở dialog xác nhận, không gọi API xóa ở đây
  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === sessionId);
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete || loading) return;
    try {
      setLoading(true);
      if (onDeleteChat) {
        onDeleteChat(sessionToDelete.id); // Chỉ callback để cha reload lại danh sách, KHÔNG gọi API xóa ở cha nữa
      }
    } catch (error) {
      console.error('Lỗi xóa session:', error);
      alert('Không thể xóa cuộc trò chuyện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSessionToDelete(null);
    }
  };

  const cancelDeleteSession = () => {
    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  const handleRenameSession = async (sessionId, e) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setEditingSession(session);
      setEditTitle(session.title || 'Cuộc trò chuyện mới');
      setShowRenameModal(true);
    }
  };

  const handleSaveRename = async () => {
    if (!editTitle.trim()) {
      alert('Tiêu đề không được để trống');
      return;
    }

    try {
      setLoading(true);
      await updateSessionTitle(editingSession.id, editTitle.trim());
      if (onUpdateSession) {
        onUpdateSession(editingSession.id, editTitle.trim());
      }
      setShowRenameModal(false);
      setEditingSession(null);
      setEditTitle('');
    } catch (error) {
      console.error('Lỗi cập nhật tiêu đề:', error);
      alert('Không thể cập nhật tiêu đề. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRename = () => {
    setShowRenameModal(false);
    setEditingSession(null);
    setEditTitle('');
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancelRename();
    }
  };

  const handleCreateSession = async () => {
    setShowSessionTypeModal(true);
  };

  const handleSelectSessionType = async (sessionType) => {
    setIsCreatingSession(true);
    setShowSessionTypeModal(false);
    try {
      await onCreateSession(sessionType);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleCloseSessionTypeModal = () => {
    setShowSessionTypeModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header với nút tạo mới */}
      <div className="p-4 border-b border-gray-700">
        <button
          className="w-full  text-white py-3 px-3 rounded-lg font-medium hover:bg-gray-700
           transition-all duration-200 flex items-center  gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          onClick={handleCreateSession}
          disabled={isCreatingSession}
        >
          {isCreatingSession ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          {isCreatingSession ? 'Đang tạo...' : 'Cuộc trò chuyện mới'}
        </button>
      </div>

      {/* Danh sách session với scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {sessions && sessions.length > 0 ? (
            <div className="space-y-1">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className={`hover:bg-gray-700 group relative rounded-lg px-3 py-3 cursor-pointer select-none transition-all duration-200 border border-transparent
                    ${selectedSessionId === session.id
                      ? 'bg-gray-900 text-white border-gray-600 shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-400'}`}
                  onClick={() => onSelectSession(session.id)}
                >
                  {/* Icon chat */}
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedSessionId === session.id 
                        ? 'bg-blue-500 text-white' 
                        : session.type === 'agentic'
                        ? 'bg-purple-600 text-white'
                        : session.type === 'enhanced'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {session.type === 'agentic' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      ) : session.type === 'enhanced' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Tiêu đề session */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight truncate flex items-center gap-2">
                        {session.title || 'Cuộc trò chuyện mới'}
                        {session.type === 'agentic' && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">Agentic</span>
                        )}
                        {session.type === 'enhanced' && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Nâng cao</span>
                        )}
                      </div>
                      {session.created_at && (
                        <div className={`text-xs mt-1 ${
                          selectedSessionId === session.id 
                            ? 'text-blue-100' 
                            : 'text-gray-500'
                        }`}>
                          {new Date(session.created_at).toLocaleString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: false
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Nút actions - hiển thị khi hover hoặc selected */}
                  <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ${selectedSessionId === session.id ? 'opacity-100' : ''}`}>
                    {/* Nút đổi tên */}
                    <button
                      className={`p-1.5 rounded-md transition-all duration-200 ${
                        selectedSessionId === session.id
                          ? 'text-blue-100 hover:bg-blue-500 hover:text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-blue-400'
                      }`}
                      onClick={(e) => handleRenameSession(session.id, e)}
                      title="Đổi tên"
                      disabled={loading}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    {/* Nút xóa */}
                    <button
                      className={`p-1.5 rounded-md transition-all duration-200 ${
                        selectedSessionId === session.id
                          ? 'text-blue-100 hover:bg-red-500 hover:text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-red-400'
                      }`}
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      title="Xóa"
                      disabled={loading}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-400 mb-2">Chưa có cuộc trò chuyện nào</div>
              <div className="text-xs text-gray-500">Tạo cuộc trò chuyện mới để bắt đầu</div>
            </div>
          )}
        </div>
      </div>

      {/* Modal đổi tên */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleModalBackdropClick}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all duration-200 scale-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Đổi tên cuộc trò chuyện
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên mới
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Nhập tên mới..."
                autoFocus
                maxLength={100}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveRename();
                  } else if (e.key === 'Escape') {
                    handleCancelRename();
                  }
                }}
              />
              <div className="text-xs text-gray-500 mt-1">
                {editTitle.length}/100 ký tự
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelRename}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveRename}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                disabled={loading || !editTitle.trim()}
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Xóa cuộc trò chuyện"
        message={`Bạn có chắc chắn muốn xóa cuộc trò chuyện "${sessionToDelete?.title || 'Cuộc trò chuyện mới'}"? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteSession}
        onCancel={cancelDeleteSession}
        confirmText="Xóa"
        cancelText="Hủy"
        loading={loading}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />

      {/* Modal chọn loại session */}
      <SessionTypeModal
        isOpen={showSessionTypeModal}
        onClose={handleCloseSessionTypeModal}
        onSelectType={handleSelectSessionType}
      />
    </div>
  );
};

export default ChatSessionList; 