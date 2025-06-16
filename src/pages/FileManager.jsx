import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const FileManager = () => {
  const [files, setFiles] = useState([
    { id: 1, name: 'document1.txt', size: '1.2MB', type: 'text', lastModified: '2024-03-16' },
    { id: 2, name: 'image1.jpg', size: '2.5MB', type: 'image', lastModified: '2024-03-15' },
    { id: 3, name: 'video1.mp4', size: '15MB', type: 'video', lastModified: '2024-03-14' },
    { id: 4, name: 'music1.mp3', size: '3.8MB', type: 'audio', lastModified: '2024-03-13' },
    { id: 5, name: 'archive.zip', size: '8.2MB', type: 'archive', lastModified: '2024-03-12' },
    { id: 6, name: 'script.js', size: '0.5MB', type: 'code', lastModified: '2024-03-11' },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filterType, setFilterType] = useState('all');

  const getFileIcon = (type) => {
    switch (type) {
      case 'text':
        return <DocumentTextIcon className="h-6 w-6 text-blue-500" />;
      case 'image':
        return <PhotoIcon className="h-6 w-6 text-green-500" />;
      case 'video':
        return <VideoCameraIcon className="h-6 w-6 text-red-500" />;
      case 'audio':
        return <MusicalNoteIcon className="h-6 w-6 text-purple-500" />;
      case 'archive':
        return <ArchiveBoxIcon className="h-6 w-6 text-yellow-500" />;
      case 'code':
        return <CodeBracketIcon className="h-6 w-6 text-orange-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedFiles = () => {
    const filteredFiles = filterType === 'all' 
      ? files 
      : files.filter(file => file.type === filterType);

    return [...filteredFiles].sort((a, b) => {
      if (sortConfig.key === 'size') {
        const sizeA = parseFloat(a.size);
        const sizeB = parseFloat(b.size);
        return sortConfig.direction === 'asc' ? sizeA - sizeB : sizeB - sizeA;
      }
      if (sortConfig.key === 'lastModified') {
        return sortConfig.direction === 'asc'
          ? new Date(a.lastModified) - new Date(b.lastModified)
          : new Date(b.lastModified) - new Date(a.lastModified);
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type.split('/')[0];
      const newFile = {
        id: files.length + 1,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        type: fileType,
        lastModified: new Date().toISOString().split('T')[0],
      };
      setFiles([...files, newFile]);
      setShowUploadModal(false);
    }
  };

  const handleDeleteFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? (
      <ArrowUpIcon className="h-4 w-4 inline-block ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 inline-block ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar username={localStorage.getItem('username')} />
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quản lý File</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="text">Văn bản</option>
                  <option value="image">Hình ảnh</option>
                  <option value="video">Video</option>
                  <option value="audio">Âm thanh</option>
                  <option value="archive">Nén</option>
                  <option value="code">Mã nguồn</option>
                </select>
                <FunnelIcon className="h-5 w-5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Thêm File
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      Tên file
                      <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('size')}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      Kích thước
                      <SortIcon column="size" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      Loại
                      <SortIcon column="type" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('lastModified')}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      Ngày sửa
                      <SortIcon column="lastModified" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {getSortedFiles().map((file) => (
                  <tr key={file.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <span>{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{file.size}</td>
                    <td className="px-6 py-4 capitalize">{file.type}</td>
                    <td className="px-6 py-4">{file.lastModified}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewFile(file)}
                        className="text-blue-500 hover:text-blue-700 mr-3"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-500 hover:text-red-700"
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
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Thêm File</h3>
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View File Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-3/4 h-3/4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile.type)}
                <h3 className="text-xl font-bold">{selectedFile.name}</h3>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="h-full overflow-auto">
              {/* File content will be displayed here */}
              <p>Nội dung file sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager; 