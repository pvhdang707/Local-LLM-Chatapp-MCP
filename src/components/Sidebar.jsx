import React from 'react';
import { PlusIcon, ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat }) => {
  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 h-[calc(100vh-96px)] mt-4 rounded-lg flex flex-col bg-white">
      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="m-4 flex items-center justify-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        <PlusIcon className="h-5 w-5" />
        <span>Cuộc trò chuyện mới</span>
      </button>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
          Lịch sử trò chuyện
        </h2>
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex cursor-pointer items-center justify-between rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                activeChatId === chat.id ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />
                <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                  {chat.title || 'Cuộc trò chuyện mới'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="invisible rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-red-500 group-hover:visible dark:hover:bg-gray-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
  