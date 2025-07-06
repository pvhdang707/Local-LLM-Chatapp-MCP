import React, { useState } from "react";
import { useEnhancedChat } from "../contexts/EnhancedChatContext";

const EnhancedChatToggle = ({ className = "" }) => {
  const {
    chatMode,
    toggleChatMode,
    enhancedSettings,
    updateEnhancedSettings,
    isEnhancedProcessing,
  } = useEnhancedChat();

  const [showSettings, setShowSettings] = useState(false);

  const handleModeChange = (mode) => {
    if (isEnhancedProcessing) return; // Prevent change during processing
    toggleChatMode(mode);
  };

  const handleSettingChange = (key, value) => {
    updateEnhancedSettings({ [key]: value });
  };

  return (
    <div className={`enhanced-chat-toggle  ${className}`}>
      {/* Main Toggle */}
      <div className="flex items-center justify-center mb-0 ">
        <div className="bg-gray-100 rounded-lg p-1 flex items-center justify-between  shadow-sm">
          <button
            type="button"
            onClick={() => handleModeChange("normal")}
            disabled={isEnhancedProcessing}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 mx-2
              ${
                chatMode === "normal"
                  ? "bg-white text-blue-600 shadow-sm ring-2 ring-blue-200"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }
              ${
                isEnhancedProcessing
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Chat thường</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("enhanced")}
            disabled={isEnhancedProcessing}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                chatMode === "enhanced"
                  ? "bg-white text-green-600 shadow-sm ring-2 ring-green-200"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }
              ${
                isEnhancedProcessing
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Nâng cao</span>
              {chatMode === "enhanced" && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </button>
        </div>

        {/* Settings Button */}
        {/* {chatMode === 'enhanced' && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            disabled={isEnhancedProcessing}
            className={`
              ml-3 p-2 rounded-lg transition-all duration-200
              ${showSettings 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              ${isEnhancedProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title="Cài đặt Enhanced Chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )} */}
      </div>
      {/* Di chuyển dòng mô tả nhỏ ra ngoài hàng chứa toggle */}
      {chatMode === "enhanced" && (
        <div className="text-xs text-gray-500 text-center mt-2">
          <p>
            Cho phép bạn tìm kiếm và phân tích file với AI.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatToggle;
