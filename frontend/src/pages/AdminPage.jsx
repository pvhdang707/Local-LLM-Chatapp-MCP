import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/adminApi';
import EditUserModal from '../components/EditUserModal';
import Notification from '../components/Notification';
import LoadingOverlay from '../components/LoadingOverlay';
import ConfirmModal from '../components/ConfirmModal';
import {
  AdminTabs,
  DashboardTab,
  UserManagementTab,
  FileManagementTab,
  SystemTab
} from '../components/admin';

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho quản lý users
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, perPage: 10, total: 0 });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // State cho quản lý files
  const [files, setFiles] = useState([]);
  const [fileGroups, setFileGroups] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPermissions, setUploadPermissions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // State cho filter và tìm kiếm file
  const [fileFilters, setFileFilters] = useState({
    type: '',
    uploadedBy: '',
    searchTerm: ''
  });
  const [filteredFiles, setFilteredFiles] = useState([]);

  // State cho system
  const [systemHealth, setSystemHealth] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [systemStats, setSystemStats] = useState(null);

  const [notification, setNotification] = useState({ message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, health, status] = await Promise.all([
        adminApi.getSystemStats(),
        adminApi.getSystemHealth(),
        adminApi.getServerStatus()
      ]);
      
      setSystemStats(stats);
      setSystemHealth(health);
      setServerStatus(status);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err);
      setNotification({ message: 'Không thể tải dữ liệu dashboard, vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    if (tabId === 'users' && users.length === 0) {
      // Load users when switching to users tab
      loadUsers();
    } else if (tabId === 'files' && files.length === 0) {
      // Load files when switching to files tab
      loadFiles();
    } else if (tabId === 'system') {
      // Refresh system data when switching to system tab
      loadDashboardData();
    }
  };

  // Load users function (for UserManagementTab)
  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminApi.getAllUsers(page, usersPagination.perPage);
      const usersList = response.users || [];
      setUsers(usersList);
      setFilteredUsers(usersList);
      setUsersPagination({
        page: response.page || 1,
        perPage: response.per_page || 10,
        total: response.total || 0
      });
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
      setNotification({ message: 'Không thể tải danh sách người dùng, vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Load files function (for FileManagementTab)
  const loadFiles = async () => {
    setLoading(true);
    try {
      const [filesResponse, groupsResponse] = await Promise.all([
        adminApi.getAllFiles(),
        adminApi.getFileGroups()
      ]);
      const filesList = filesResponse.files || [];
      setFiles(filesList);
      setFilteredFiles(filesList);
      setFileGroups(groupsResponse.groups || []);
      
      // Đảm bảo users đã được load để map username
      if (users.length === 0) {
        await loadUsers();
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách file:', err);
      setNotification({ message: 'Không thể tải danh sách file, vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle system restart
  const handleRestartSystem = () => {
    if (window.confirm('Bạn có chắc chắn muốn khởi động lại hệ thống?')) {
      alert('Tính năng này chưa được triển khai');
    }
  };

 

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Trang quản trị Admin</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              className="float-right font-bold"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ message: '', type: 'info' })}
          />
        )}

        <LoadingOverlay show={loading} />
        
        <div className="bg-white rounded-lg shadow-md">
          <AdminTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onTabChange={handleTabChange}
          />
          
          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <DashboardTab
                systemStats={systemStats}
                systemHealth={systemHealth}
                serverStatus={serverStatus}
                fileGroups={fileGroups}
              />
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <UserManagementTab
                setNotification={setNotification}
                setLoading={setLoading}
                setConfirmModal={setConfirmModal}
                users={users}
                setUsers={setUsers}
                usersPagination={usersPagination}
                setUsersPagination={setUsersPagination}
                filteredUsers={filteredUsers}
                setFilteredUsers={setFilteredUsers}
                userSearchTerm={userSearchTerm}
                setUserSearchTerm={setUserSearchTerm}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                loadUsers={loadUsers}
              />
            )}
            
            {/* Files Tab */}
            {activeTab === 'files' && (
              <FileManagementTab
                setNotification={setNotification}
                setLoading={setLoading}
                setConfirmModal={setConfirmModal}
                files={files}
                setFiles={setFiles}
                fileGroups={fileGroups}
                setFileGroups={setFileGroups}
                filteredFiles={filteredFiles}
                setFilteredFiles={setFilteredFiles}
                fileFilters={fileFilters}
                setFileFilters={setFileFilters}
                users={users}
                showUploadModal={showUploadModal}
                setShowUploadModal={setShowUploadModal}
                uploadFile={uploadFile}
                setUploadFile={setUploadFile}
                uploadPermissions={uploadPermissions}
                setUploadPermissions={setUploadPermissions}
                loadFiles={loadFiles}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
              />
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <SystemTab
                systemHealth={systemHealth}
                serverStatus={serverStatus}
                onRefreshData={loadDashboardData}
                onRestartSystem={handleRestartSystem}
              />
            )}
          </div>
        </div>

        {/* Edit User Modal */}
        <EditUserModal
          user={editingUser}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSave={(userId, userData) => {
            // This will be handled by UserManagementTab
            console.log('Update user:', userId, userData);
          }}
        />

        <ConfirmModal
          isOpen={confirmModal.show}
          message={confirmModal.message}
          onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
          onConfirm={confirmModal.onConfirm}
        />
      </div>
    </div>
  );
};

export default AdminPage;
