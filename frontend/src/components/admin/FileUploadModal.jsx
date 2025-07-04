import React, { useState } from 'react';

const FileUploadModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  users, 
  uploadFile, 
  setUploadFile, 
  uploadPermissions, 
  setUploadPermissions 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Vui lòng chọn file để upload');
      return;
    }
    onSubmit(e);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload file với phân quyền</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Chọn file</label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phân quyền cho user</label>
              <div className="mt-2 max-h-32 overflow-y-auto border rounded p-2">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={uploadPermissions.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUploadPermissions([...uploadPermissions, user.id]);
                        } else {
                          setUploadPermissions(uploadPermissions.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{user.username}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Chọn user nào được phép truy cập file này</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal; 