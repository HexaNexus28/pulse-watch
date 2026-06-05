import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import WidgetDashboard from '@/pages/WidgetDashboard';
import Categories from '@/pages/Categories';
import Feeds from '@/pages/Feeds';
import Notes from '@/pages/Notes';
import Trends from '@/pages/Trends';
import Summaries from '@/pages/Summaries';
import Profile from '@/pages/Profile';

// Import styles
import '@/styles/globals.css';
import '@/styles/components.css';

// Public widget dashboard (no auth required)
const PublicWidgetDashboard = () => <WidgetDashboard />;

// Auth routes
const AuthRoutes: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Protected routes wrapper
const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthRoutes />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/widgets" element={<WidgetDashboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/feeds" element={<Feeds />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/summaries" element={<Summaries />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/widgets" element={<PublicWidgetDashboard />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
