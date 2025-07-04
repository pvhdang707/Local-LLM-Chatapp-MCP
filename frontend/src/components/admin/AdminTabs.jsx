import React from 'react';

const AdminTabs = ({ activeTab, setActiveTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Quản lý người dùng' },
    { id: 'files', label: 'Quản lý file' },
    { id: 'system', label: 'Hệ thống' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="border-b">
      <nav className="flex flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-4 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminTabs; 