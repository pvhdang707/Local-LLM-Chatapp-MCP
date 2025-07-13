import React, { useState } from 'react';

const CreateUserForm = ({ onSubmit, onCancel }) => {
  const [newUser, setNewUser] = useState({ 
    username: '', 
    password: '', 
    role: 'user',
    department: '' // Thêm department
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newUser);
    setNewUser({ username: '', password: '', role: 'user', department: '' }); // Reset department
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tạo tài khoản mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={newUser.username}
            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vai trò</label>
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        {/* Thêm field department */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
          <select
            value={newUser.department}
            onChange={(e) => setNewUser({...newUser, department: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Chọn phòng ban</option>
            <option value="Sales">Sales</option>
            <option value="Tài chính">Tài chính</option>
            <option value="HR">HR</option>
          </select>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tạo user
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm; 