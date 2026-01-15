import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../utils/api';
import { useToastContext } from '../context/ToastContext';
import NotFound from '../pages/NotFound';

/**
 * ProtectedRoute component that restricts access based on user role
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if access is granted
 * @param {boolean} props.requireAdmin - If true, requires admin or super_admin role
 * @param {boolean} props.requireAuth - If true, requires user to be logged in
 * @param {string} props.redirectTo - Path to redirect to if access is denied (default: '/')
 * @param {boolean} props.show404 - If true, shows 404 page instead of redirecting (default: false for admin routes)
 */
function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireAuth = false,
  redirectTo = '/',
  show404 = false
}) {
  const location = useLocation();
  const toast = useToastContext();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      try {
        // Check if user is logged in
        const userData = JSON.parse(localStorage.getItem('carbnb_user') || 'null');
        const token = localStorage.getItem('carbnb_token') || userData?.token;

        if (requireAuth && !token) {
          // User not logged in
          setHasAccess(false);
          setIsChecking(false);
          toast.error('Please log in to access this page');
          return;
        }

        if (requireAdmin) {
          // Check admin role
          const isUserAdmin = isAdmin();
          if (!isUserAdmin) {
            setHasAccess(false);
            setIsChecking(false);
            // Don't show toast for 404 pages
            if (!show404) {
              toast.error('Admin access required. You do not have permission to access this page.');
            }
            return;
          }
        }

        // Access granted
        setHasAccess(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
        setIsChecking(false);
        toast.error('Error verifying access. Please try again.');
      }
    };

    checkAccess();
  }, [requireAdmin, requireAuth, toast]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '18px', color: '#717171' }}>Checking access...</div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #ff385c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show 404 page or redirect if access denied
  if (!hasAccess) {
    if (show404) {
      return <NotFound />;
    }
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render children if access granted
  return children;
}

export default ProtectedRoute;

