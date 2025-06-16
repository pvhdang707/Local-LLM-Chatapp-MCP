import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between w-full items-center">
        <div className="flex items-center space-x-4">
          <Link to="/chat" className="text-xl font-bold">Local LLM Chat</Link>
          <div className="flex space-x-4">
            <Link to="/chat" className="hover:text-gray-300">Chat</Link>
            <Link to="/files" className="hover:text-gray-300">Quản lý File</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Xin chào, {username}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 