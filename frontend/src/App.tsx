import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { AttendancePage } from './pages/AttendancePage';
import { AdminAttendancePage } from './pages/AdminAttendancePage';
import { OfficerLeavePage } from './pages/OfficerLeavePage';
import { AdminLeavePage } from './pages/AdminLeavePage';
import { Profile } from './pages/Profile';
import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { AboutPage } from './pages/AboutPage';
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
        <Route path="/admin/attendance" element={<AdminAttendancePage />} />
        <Route path="/admin/leaves" element={<AdminLeavePage />} />
        <Route path="/officer" element={<OfficerDashboard />} />
        <Route path="/officer/attendance" element={<AttendancePage />} />
        <Route path="/officer/leaves" element={<OfficerLeavePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/" element={<LandingPage />} />
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
