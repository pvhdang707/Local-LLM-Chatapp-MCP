import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import FileUploadPage from './pages/FileUploadPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { ChatSessionProvider } from './contexts/ChatSessionContext';
import { EnhancedChatProvider } from './contexts/EnhancedChatContext';
import './components/EnhancedChat.css';

// Component để chuyển hướng dựa trên role
const RoleBasedRedirect = () => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }
  
  // Chuyển hướng dựa trên role
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/chat" replace />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <EnhancedChatProvider>
        <ChatSessionProvider>
          <Router>
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Route cho user - quản lý file cá nhân */}
              <Route
                path="/user/files"
                element={
                  <ProtectedRoute requireUser={true}>
                    <FileUploadPage />
                  </ProtectedRoute>
                }
              />
             
              {/* Route cho admin - quản lý toàn bộ hệ thống */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Route mặc định - chuyển hướng dựa trên role */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <RoleBasedRedirect />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ChatSessionProvider>
      </EnhancedChatProvider>
    </AuthProvider>
  );
};

export default App;