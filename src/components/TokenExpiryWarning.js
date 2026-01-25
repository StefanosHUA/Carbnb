import React, { useEffect, useState } from 'react';
import { isTokenExpiringSoon } from '../utils/tokenManager';
import { useToastContext } from '../context/ToastContext';

/**
 * TokenExpiryWarning Component
 * Monitors token expiration and warns user before session expires
 * Best practice: Give users advance notice before auto-logout
 */
function TokenExpiryWarning() {
  const toast = useToastContext();
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    // Check token expiry every 30 seconds
    const checkInterval = setInterval(() => {
      const token = localStorage.getItem('carbnb_token');
      
      if (!token) {
        setHasWarned(false);
        return;
      }

      // Warn user 2 minutes before expiry (only once)
      if (!hasWarned && isTokenExpiringSoon(token, 2)) {
        console.log('[TokenExpiryWarning] Token expiring soon, showing warning');
        toast.warning('Your session will expire soon. Your session will be automatically refreshed if you continue using the app.');
        setHasWarned(true);
      }

      // Reset warning flag if token is refreshed
      if (hasWarned && !isTokenExpiringSoon(token, 5)) {
        setHasWarned(false);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [hasWarned, toast]);

  // This component doesn't render anything
  return null;
}

export default TokenExpiryWarning;

