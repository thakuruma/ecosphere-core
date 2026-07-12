import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Add more routes here as each module gets built, e.g.:
              <Route path="/carbon" element={<ProtectedRoute><Carbon /></ProtectedRoute>} />
              <Route path="/csr" element={<ProtectedRoute><Csr /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
          */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
