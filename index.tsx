import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardLayout from './components/DashboardLayout';
import MissionControlPage from './pages/MissionControlPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MissionPlannerPage from './pages/MissionPlannerPage';
import FleetManagementPage from './pages/FleetManagementPage';
import ModelRegistryPage from './pages/ModelRegistryPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppRouter: React.FC = () => {
  const { initialize } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MissionControlPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="planner" element={<MissionPlannerPage />} />
          <Route path="fleet" element={<FleetManagementPage />} />
          <Route path="models" element={<ModelRegistryPage />} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);