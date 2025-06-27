import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
    // Dữ liệu mẫu cho các user
  const [users, setUsers] = useState([
    { id: 1, username: 'user1', fullName: 'Nguyễn Văn A', role: 'user', status: 'active', department: 'Công nghệ' },
    { id: 2, username: 'user2', fullName: 'Trần Thị B', role: 'user', status: 'active', department: 'Kinh doanh' },
    { id: 3, username: 'user3', fullName: 'Lê Văn C', role: 'user', status: 'inactive', department: 'Nhân sự' },
    { id: 4, username: 'user4', fullName: 'Phạm Thị D', role: 'user', status: 'active', department: 'Kế toán' },
    { id: 5, username: 'user5', fullName: 'Hoàng Văn E', role: 'user', status: 'active', department: 'Công nghệ' },
  ]);
    // Hàm để xác định loại file từ tên file
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['txt', 'pdf', 'doc', 'docx', 'rtf'].includes(extension)) return 'document';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension)) return 'audio';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'php', 'py', 'java', 'c', 'cpp', 'cs'].includes(extension)) return 'code';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(extension)) return 'presentation';
    return 'other';
  };
  
  // Dữ liệu mẫu cho các file
  const [files, setFiles] = useState([
    { id: 1, name: 'document1.txt', size: '1.2MB', owner: 'user1', uploadDate: '16/06/2025' },
    { id: 2, name: 'image1.jpg', size: '2.5MB', owner: 'user2', uploadDate: '15/06/2025' },
    { id: 3, name: 'video1.mp4', size: '15MB', owner: 'user3', uploadDate: '14/06/2025' },
    { id: 4, name: 'music1.mp3', size: '3.8MB', owner: 'user1', uploadDate: '13/06/2025' },
    { id: 5, name: 'archive.zip', size: '8.2MB', owner: 'user2', uploadDate: '12/06/2025' },
    { id: 6, name: 'script.js', size: '0.5MB', owner: 'user3', uploadDate: '11/06/2025' },
    { id: 7, name: 'data.xlsx', size: '2.1MB', owner: 'user4', uploadDate: '10/06/2025' },
    { id: 8, name: 'presentation.pptx', size: '5.3MB', owner: 'user5', uploadDate: '09/06/2025' },
    { id: 9, name: 'report.pdf', size: '3.7MB', owner: 'user1', uploadDate: '08/06/2025' },
  ]);
    // Form tạo tài khoản mới
  const [newUser, setNewUser] = useState({ username: '', fullName: '', password: '', role: 'user', department: 'Công nghệ' });
    const handleCreateUser = (e) => {
    e.preventDefault();
    // Mô phỏng tạo user mới
    const newUserId = users.length + 1;
    setUsers([...users, { 
      id: newUserId, 
      username: newUser.username, 
      fullName: newUser.fullName, 
      role: newUser.role, 
      status: 'active',
      department: newUser.department
    }]);
    
    // Reset form
    setNewUser({ username: '', fullName: '', password: '', role: 'user', department: 'Công nghệ' });
    alert('Tạo tài khoản thành công!');
  };
  
  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };
  
  const handleDeleteFile = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Truy cập bị từ chối</h2>
            <p>Bạn không có quyền truy cập trang này. Chỉ tài khoản Admin mới có thể truy cập.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Trang quản trị Admin</h1>
        
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <nav className="flex">
              <button 
                className={`px-4 py-4 text-sm font-medium ${activeTab === 'users' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('users')}
              >
                Quản lý người dùng
              </button>
              <button 
                className={`px-4 py-4 text-sm font-medium ${activeTab === 'files' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('files')}
              >
                Quản lý file
              </button>
              <button 
                className={`px-4 py-4 text-sm font-medium ${activeTab === 'create' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('create')}
              >
                Tạo tài khoản
              </button>
              <button 
                className={`px-4 py-4 text-sm font-medium ${activeTab === 'statistics' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('statistics')}
              >
                Thống kê
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Danh sách người dùng</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Sửa</button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
              {activeTab === 'files' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Danh sách file</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên file</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tải lên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tải lên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file) => {
                        const fileType = getFileType(file.name);
                        return (
                        <tr key={file.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{file.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center">
                            {fileType === 'document' && (
                              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                            )}
                            {fileType === 'image' && (
                              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            )}
                            {fileType === 'video' && (
                              <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            )}
                            {fileType === 'audio' && (
                              <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                              </svg>
                            )}
                            {fileType === 'archive' && (
                              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                              </svg>
                            )}
                            {fileType === 'code' && (
                              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                              </svg>
                            )}
                            {fileType === 'spreadsheet' && (
                              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                            )}
                            {fileType === 'presentation' && (
                              <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                              </svg>
                            )}
                            {fileType === 'other' && (
                              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                              </svg>
                            )}
                            {file.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              fileType === 'document' ? 'bg-blue-100 text-blue-800' : 
                              fileType === 'image' ? 'bg-green-100 text-green-800' : 
                              fileType === 'video' ? 'bg-red-100 text-red-800' : 
                              fileType === 'audio' ? 'bg-yellow-100 text-yellow-800' : 
                              fileType === 'archive' ? 'bg-purple-100 text-purple-800' : 
                              fileType === 'code' ? 'bg-gray-100 text-gray-800' :
                              fileType === 'spreadsheet' ? 'bg-green-200 text-green-900' :
                              fileType === 'presentation' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{file.owner}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{file.size}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{file.uploadDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Tải xuống</button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'create' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Tạo tài khoản mới</h2>
                <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                    <input
                      type="text"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>                  <div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
                    <select
                      value={newUser.department}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Công nghệ">Công nghệ</option>
                      <option value="Kinh doanh">Kinh doanh</option>
                      <option value="Nhân sự">Nhân sự</option>
                      <option value="Kế toán">Kế toán</option>
                      <option value="Hành chính">Hành chính</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Tạo tài khoản
                  </button>
                </form>
              </div>
            )}
            
            {activeTab === 'statistics' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Thống kê hệ thống</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg shadow">
                    <div className="text-blue-500 text-4xl font-bold">{users.length}</div>
                    <div className="text-gray-700 mt-2">Tổng số người dùng</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg shadow">
                    <div className="text-green-500 text-4xl font-bold">{files.length}</div>
                    <div className="text-gray-700 mt-2">Tổng số file</div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg shadow">
                    <div className="text-purple-500 text-4xl font-bold">42</div>
                    <div className="text-gray-700 mt-2">Lượt tương tác hôm nay</div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
                  <ul className="space-y-3">
                    <li className="bg-white p-4 rounded-lg shadow">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">User1 đã đăng nhập</p>
                          <p className="text-sm text-gray-500">19/06/2025, 10:30 AM</p>
                        </div>
                      </div>
                    </li>
                    <li className="bg-white p-4 rounded-lg shadow">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full">
                          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">User2 đã tải lên file mới</p>
                          <p className="text-sm text-gray-500">19/06/2025, 9:15 AM</p>
                        </div>
                      </div>
                    </li>
                    <li className="bg-white p-4 rounded-lg shadow">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full">
                          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Admin đã xóa một tài khoản</p>
                          <p className="text-sm text-gray-500">18/06/2025, 3:45 PM</p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
