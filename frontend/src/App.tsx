import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { OfficerManagement } from './pages/OfficerManagement';
import { FeedbackDashboard } from './pages/FeedbackDashboard';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { Profile } from './pages/Profile';
import { loginSuccess } from './store/slices/authSlice';
import axios from 'axios';

const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data) {
            dispatch(loginSuccess({ user: response.data, token }));
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Token might be invalid, clear it
          localStorage.removeItem('token');
        }
      }
    };

    loadUserProfile();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/departments" element={<DepartmentManagement />} />
        <Route path="/admin/officers" element={<OfficerManagement />} />
        <Route path="/admin/feedback" element={<FeedbackDashboard />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        <Route path="/officer" element={<OfficerDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
