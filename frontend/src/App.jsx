import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import Dashboard from './pages/Dashboard';
import TrackEmission from './pages/TrackEmission';
import MyDevice from './pages/MyDevice';
import Reports from './pages/Reports';
import Recommendations from './pages/Recommendations';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Devices from './pages/admin/Devices';
import SensorData from './pages/admin/SensorData';
import CarbonFactors from './pages/admin/CarbonFactors';
import AdminRewards from './pages/admin/AdminRewards';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected user routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/track" element={<ProtectedRoute><Layout><TrackEmission /></Layout></ProtectedRoute>} />
        <Route path="/device" element={<ProtectedRoute><Layout><MyDevice /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Layout><Recommendations /></Layout></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><Layout><Rewards /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/devices" element={<Devices />} />
        <Route path="/admin/sensor-data" element={<SensorData />} />
        <Route path="/admin/carbon-factors" element={<CarbonFactors />} />
        <Route path="/admin/rewards" element={<AdminRewards />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
