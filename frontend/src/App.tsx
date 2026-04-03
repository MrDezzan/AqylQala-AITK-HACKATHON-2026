import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLogs from './pages/AdminLogs';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, token, isLoading } = useAuthStore();

  if (isLoading) return <div className="min-h-screen bg-[#05050A] flex items-center justify-center text-white font-display">Loading...</div>;
  if (!token) return <Navigate to="/auth" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/map" />;

  return <>{children}</>;
};

import AccessibilityWidget from './components/AccessibilityWidget';

function App() {
  const { checkAuth } = useAuthStore();

  // Инициализируем Телеграм если мы внутри него
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand(); // Растягиваем на весь экран
    }
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <AccessibilityWidget />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Routes */}
        <Route path="/map" element={
          <ProtectedRoute>
            <MapView />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['OFFICIAL', 'ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        } />

        <Route path="/admin/logs" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminLogs />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
