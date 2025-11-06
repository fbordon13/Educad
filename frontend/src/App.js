import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Page Components
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Jobs from './pages/jobs/Jobs';
import JobDetail from './pages/jobs/JobDetail';
import CreateJob from './pages/jobs/CreateJob';
import EditJob from './pages/jobs/EditJob';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import Applications from './pages/applications/Applications';
import MyJobs from './pages/jobs/MyJobs';
import JobApplications from './pages/jobs/JobApplications';
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/applications" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Applications />
                </ProtectedRoute>
              } />
              
              <Route path="/my-jobs" element={
                <ProtectedRoute allowedRoles={['business']}>
                  <MyJobs />
                </ProtectedRoute>
              } />
              
              <Route path="/jobs/:id/applications" element={
                <ProtectedRoute allowedRoles={['business']}>
                  <JobApplications />
                </ProtectedRoute>
              } />
              
              <Route path="/create-job" element={
                <ProtectedRoute allowedRoles={['business']}>
                  <CreateJob />
                </ProtectedRoute>
              } />
              
              <Route path="/edit-job/:id" element={
                <ProtectedRoute allowedRoles={['business']}>
                  <EditJob />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
