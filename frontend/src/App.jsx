import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import JobMatching from './pages/JobMatching';
import JobEligibility from './pages/JobEligibility';
import ResumeAnalysis from './pages/ResumeAnalysis';
import { AuthProvider, AuthContext } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
        <Route path="/job-matching" element={<PrivateRoute><JobMatching /></PrivateRoute>} />
        <Route path="/job-eligibility" element={<PrivateRoute><JobEligibility /></PrivateRoute>} />
        <Route path="/resume/:id/analysis" element={<PrivateRoute><ResumeAnalysis /></PrivateRoute>} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
