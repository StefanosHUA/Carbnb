import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastProvider } from './context/ToastContext';
import { CarCardSkeleton } from './components/LoadingSkeleton';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const CarRegistration = lazy(() => import('./pages/CarRegistration'));
const Cars = lazy(() => import('./pages/Cars'));
const CarDetail = lazy(() => import('./pages/CarDetail'));
const Booking = lazy(() => import('./pages/Booking'));
const Payment = lazy(() => import('./pages/Payment'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CarCardSkeleton />
  </div>
);

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Header />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register-car" element={<CarRegistration />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/car/:id" element={<CarDetail />} />
              <Route path="/book/:id" element={<Booking />} />
              <Route path="/payment/:id" element={<Payment />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/dashboard/bookings" element={<UserDashboard />} />
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true} requireAuth={true} show404={true}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App; 