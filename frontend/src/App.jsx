import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import OrderDetail from './pages/OrderDetail';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-lime"></div></div>;

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
      <Route path="/signup" element={<Signup />} />

      {/* Customer Routes */}
      <Route path="/customer" element={
        <PrivateRoute allowedRoles={['customer']}>
          <CustomerDashboard />
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

      {/* Order Detail — accessible by customer (owner), agent (assigned), admin */}
      <Route path="/orders/:orderId" element={
        <PrivateRoute allowedRoles={['customer', 'agent', 'admin']}>
          <OrderDetail />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
