import React, { useState, useEffect } from 'react';
import UserTable from './UserTable';
import CreateUserForm from './CreateUserForm';
import { adminApi } from '../../services/adminApi';

const UserManagementTab = ({ 
  setNotification, 
  setLoading, 
  setConfirmModal,
  users,
  setUsers,
  usersPagination,
  setUsersPagination,
  filteredUsers,
  setFilteredUsers,
  userSearchTerm,
  setUserSearchTerm,
  editingUser,
  setEditingUser,
  showEditModal,
  setShowEditModal,
  loadUsers
}) => {
    const [activeView, setActiveView] = useState('list');

  // Create user
  const handleCreateUser = async (newUser) => {
    setLoading(true);
    try {
      await adminApi.createUser(newUser);
      loadUsers(usersPagination.page);
      setActiveView('list');
      setNotification({ message: 'Tạo user thành công!', type: 'success' });
    } catch (err) {
      console.error('Lỗi khi tạo user:', err);
      setNotification({ message: 'Tạo user không thành công, vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (userId, userData) => {
    setLoading(true);
    try {
      await adminApi.updateUser(userId, userData);
      setEditingUser(null);
      setShowEditModal(false);
      loadUsers(usersPagination.page);
      setNotification({ message: 'Cập nhật user thành công!', type: 'success' });
    } catch (err) {
      console.error('Lỗi khi cập nhật user:', err);
      setNotification({ message: 'Cập nhật không thành công, vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = (userId) => {
    setConfirmModal({
      show: true,
      message: 'Bạn có chắc chắn muốn xóa user này?',
      onConfirm: async () => {
        setConfirmModal({ show: false, message: '', onConfirm: null });
        setLoading(true);
        try {
          await adminApi.deleteUser(userId);
          loadUsers(usersPagination.page);
          setNotification({ message: 'Xóa user thành công!', type: 'success' });
        } catch (err) {
          console.error('Lỗi khi xóa user:', err);
          setNotification({ message: 'Xóa không thành công, vui lòng thử lại.', type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Search users - cập nhật để hỗ trợ department
  const applyUserSearch = () => {
    if (!userSearchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const searchTerm = userSearchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm) ||
      user.id.toString().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm) ||
      (user.department && user.department.toLowerCase().includes(searchTerm)) // Thêm search theo department
    );
    
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    applyUserSearch();
  }, [users, userSearchTerm]);

  return (
    <div>
      {activeView === 'list' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
            <button
              onClick={() => setActiveView('create')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tạo user mới
            </button>
          </div>

          <UserTable
            users={users}
            filteredUsers={filteredUsers}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            usersPagination={usersPagination}
            onEditUser={(user) => {
              setEditingUser(user);
              setShowEditModal(true);
            }}
            onDeleteUser={handleDeleteUser}
            onPageChange={loadUsers}
          />
        </>
      )}

      {activeView === 'create' && (
        <CreateUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setActiveView('list')}
        />
      )}
    </div>
  );
};

export default UserManagementTab; 