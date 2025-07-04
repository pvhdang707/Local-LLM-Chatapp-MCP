import React from 'react';

// Utility functions cho AdminPage

export const getFileType = (fileName) => {
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

export const getUsernameById = (userId, users) => {
  if (!userId) return 'N/A';
  
  const user = users.find(u => {
    const userStr = u.id.toString();
    const fileStr = userId.toString();
    return userStr === fileStr;
  });
  
  return user ? user.username : userId;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN');
};

export const getFileIcon = (ext, fileType) => {
  switch (ext) {
    // PDF Files
    case 'pdf':
      return (
        <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      );
    
    // Word Documents
    case 'doc':
    case 'docx':
      return (
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          <path d="M16,13H8V15H16V13M16,17H8V19H16V17M10,9H8V11H10V9Z" fill="white"/>
        </svg>
      );
    
    // Excel Files
    case 'xls':
    case 'xlsx':
    case 'csv':
      return (
        <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          <path d="M8,12L10.5,14.5L8,17L9.4,18.4L12.5,15.3L15.6,18.4L17,17L14.5,14.5L17,12L15.6,10.6L12.5,13.7L9.4,10.6L8,12Z" fill="white"/>
        </svg>
      );
    
    // PowerPoint Files
    case 'ppt':
    case 'pptx':
      return (
        <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          <path d="M8,12H10.5C11.3,12 12,12.7 12,13.5C12,14.3 11.3,15 10.5,15H8V17H6V10H10.5C11.3,10 12,10.7 12,11.5C12,12.3 11.3,13 10.5,13H8V12Z" fill="white"/>
        </svg>
      );
    
    // Text Files
    case 'txt':
    case 'rtf':
      return (
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          <path d="M8,12H16V14H8V12M8,16H13V18H8V16Z" fill="white"/>
        </svg>
      );
    
    // Image Files
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
    case 'ico':
    case 'tiff':
    case 'tif':
      return (
        <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
        </svg>
      );
    
    // Audio Files
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
    case 'm4a':
    case 'aac':
    case 'wma':
    case 'aiff':
      return (
        <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17S7.79,21 10,21 14,19.21 14,17V7H18V3H12M10,19C8.9,19 8,18.1 8,17S8.9,15 10,15 12,15.9 12,17 11.1,19 10,19Z"/>
        </svg>
      );
    
    // Video Files
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'mkv':
    case 'webm':
    case 'm4v':
    case '3gp':
    case 'ogv':
      return (
        <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
        </svg>
      );
    
    // Archive Files
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'bz2':
    case 'xz':
    case 'cab':
      return (
        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20,6H16V4A2,2 0 0,0 14,2H10A2,2 0 0,0 8,4V6H4A2,2 0 0,0 2,8V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V8A2,2 0 0,0 20,6M10,4H14V6H10V4M20,19H4V8H20V19Z"/>
        </svg>
      );
    
    // Code Files
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'php':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'cs':
    case 'rb':
    case 'go':
    case 'rs':
    case 'swift':
    case 'kt':
    case 'scala':
    case 'r':
    case 'sql':
    case 'sh':
    case 'bat':
    case 'ps1':
    case 'json':
    case 'xml':
    case 'yaml':
    case 'yml':
    case 'md':
    case 'vue':
    case 'svelte':
      return (
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.89,3L10.86,13.26L13.25,14.77L15.64,13.26L13.61,3H12.89M15.5,17.71C15.2,18.1 14.71,18.3 14.23,18.3C13.75,18.3 13.26,18.1 12.96,17.71C12.66,17.32 12.66,16.8 12.96,16.41C13.26,16.02 13.75,15.82 14.23,15.82C14.71,15.82 15.2,16.02 15.5,16.41C15.8,16.8 15.8,17.32 15.5,17.71M8.82,15.82C9.3,15.82 9.79,16.02 10.09,16.41C10.39,16.8 10.39,17.32 10.09,17.71C9.79,18.1 9.3,18.3 8.82,18.3C8.34,18.3 7.85,18.1 7.55,17.71C7.25,17.32 7.25,16.8 7.55,16.41C7.85,16.02 8.34,15.82 8.82,15.82Z"/>
        </svg>
      );
    
    // Database Files
    case 'db':
    case 'sqlite':
    case 'mdb':
    case 'accdb':
      return (
        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4,6H20V16H4M22,4A2,2 0 0,1 24,6V18A2,2 0 0,1 22,20H2A2,2 0 0,1 0,18V6A2,2 0 0,1 2,4H22M6,9V11H8V9H6M10,9V11H12V9H10M14,9V11H16V9H14M6,13V15H8V13H6M10,13V15H12V13H10M14,13V15H16V13H14Z"/>
        </svg>
      );
    
    // Font Files
    case 'ttf':
    case 'otf':
    case 'woff':
    case 'woff2':
    case 'eot':
      return (
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
        </svg>
      );
    
    // CAD Files
    case 'dwg':
    case 'dxf':
    case 'stl':
    case 'obj':
    case '3ds':
    case 'blend':
      return (
        <svg className="w-5 h-5 mr-2 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2L2,7L12,12L22,7L12,2M12,22L2,17L2,7M12,22L22,17L22,7M12,12L12,22"/>
        </svg>
      );
    
    // Executable Files
    case 'exe':
    case 'msi':
    case 'app':
    case 'dmg':
    case 'deb':
    case 'rpm':
    case 'pkg':
      return (
        <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          <path d="M16,13H8V15H16V13M16,17H8V19H16V17M10,9H8V11H10V9Z" fill="white"/>
          <path d="M12,14L10,16L12,18L14,16L12,14Z" fill="white"/>
        </svg>
      );
    
    // Default icons based on file type
    default:
      if (fileType === 'document') return (
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          <path d="M8,12H16V14H8V12M8,16H13V18H8V16Z" fill="white"/>
        </svg>
      );
      if (fileType === 'image') return (
        <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
        </svg>
      );
      if (fileType === 'video') return (
        <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
        </svg>
      );
      if (fileType === 'audio') return (
        <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17S7.79,21 10,21 14,19.21 14,17V7H18V3H12M10,19C8.9,19 8,18.1 8,17S8.9,15 10,15 12,15.9 12,17 11.1,19 10,19Z"/>
        </svg>
      );
      if (fileType === 'archive') return (
        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20,6H16V4A2,2 0 0,0 14,2H10A2,2 0 0,0 8,4V6H4A2,2 0 0,0 2,8V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V8A2,2 0 0,0 20,6M10,4H14V6H10V4M20,19H4V8H20V19Z"/>
        </svg>
      );
      if (fileType === 'code') return (
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.89,3L10.86,13.26L13.25,14.77L15.64,13.26L13.61,3H12.89M15.5,17.71C15.2,18.1 14.71,18.3 14.23,18.3C13.75,18.3 13.26,18.1 12.96,17.71C12.66,17.32 12.66,16.8 12.96,16.41C13.26,16.02 13.75,15.82 14.23,15.82C14.71,15.82 15.2,16.02 15.5,16.41C15.8,16.8 15.8,17.32 15.5,17.71M8.82,15.82C9.3,15.82 9.79,16.02 10.09,16.41C10.39,16.8 10.39,17.32 10.09,17.71C9.79,18.1 9.3,18.3 8.82,18.3C8.34,18.3 7.85,18.1 7.55,17.71C7.25,17.32 7.25,16.8 7.55,16.41C7.85,16.02 8.34,15.82 8.82,15.82Z"/>
        </svg>
      );
      if (fileType === 'spreadsheet') return (
        <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          <path d="M8,12L10.5,14.5L8,17L9.4,18.4L12.5,15.3L15.6,18.4L17,17L14.5,14.5L17,12L15.6,10.6L12.5,13.7L9.4,10.6L8,12Z" fill="white"/>
        </svg>
      );
      if (fileType === 'presentation') return (
        <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          <path d="M8,12H10.5C11.3,12 12,12.7 12,13.5C12,14.3 11.3,15 10.5,15H8V17H6V10H10.5C11.3,10 12,10.7 12,11.5C12,12.3 11.3,13 10.5,13H8V12Z" fill="white"/>
        </svg>
      );
      // Generic file icon
      return (
        <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      );
  }
}; 