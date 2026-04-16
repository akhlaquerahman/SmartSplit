import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import Dashboard from '../pages/Dashboard';
import Groups from '../pages/Groups';
import Reports from '../pages/Reports';
import GroupDetails from '../pages/GroupDetails';
import Profile from '../pages/Profile';
import MainLayout from '../layouts/MainLayout';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/group/:id" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
