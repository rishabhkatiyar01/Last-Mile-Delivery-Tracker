import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import TrackOrder from './pages/TrackOrder';
import CreateOrder from './pages/CreateOrder';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/track" element={<TrackOrder />} />

      {/* Customer Routes */}
      <Route path="/customer" element={
        <PrivateRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </PrivateRoute>
      } />
      <Route path="/create-order" element={
        <PrivateRoute allowedRoles={['customer']}>
          <CreateOrder />
        </PrivateRoute>
      } />

      {/* Agent Routes */}
      <Route path="/agent" element={
        <PrivateRoute allowedRoles={['agent']}>
          <AgentDashboard />
        </PrivateRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
