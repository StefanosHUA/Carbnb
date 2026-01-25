/**
 * User Activity Tracker
 * Tracks whether the user is actively using the page
 * Used to determine whether to refresh tokens or log out when refresh token expires
 */

class UserActivityTracker {
  constructor(inactivityTimeout = 5 * 60 * 1000) { // 5 minutes default
    this.inactivityTimeout = inactivityTimeout;
    this.lastActivity = Date.now();
    this.isActive = true;
    this.timeoutId = null;
    this.eventListeners = [];

    this.init();
  }

  /**
   * Initialize activity tracking
   */
  init() {
    // Track user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      const handler = () => this.updateActivity();
      document.addEventListener(event, handler, { passive: true });
      this.eventListeners.push({ event, handler });
    });

    // Track page visibility changes
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.updateActivity();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    this.eventListeners.push({ event: 'visibilitychange', handler: visibilityHandler });

    // Start inactivity timer
    this.resetInactivityTimer();

    console.log('[UserActivity] Initialized with', this.inactivityTimeout / 1000, 'second timeout');
  }

  /**
   * Update last activity timestamp and reset timer
   */
  updateActivity() {
    this.lastActivity = Date.now();
    this.isActive = true;
    this.resetInactivityTimer();
  }

  /**
   * Reset the inactivity timer
   */
  resetInactivityTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.isActive = false;
      console.log('[UserActivity] User marked as inactive after', this.inactivityTimeout / 1000, 'seconds');
    }, this.inactivityTimeout);
  }

  /**
   * Check if user is currently active
   * @returns {boolean} True if user is active, false otherwise
   */
  isUserActive() {
    // Check if page is visible
    if (document.visibilityState !== 'visible') {
      return false;
    }

    // Check if within activity timeout
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    return timeSinceLastActivity < this.inactivityTimeout;
  }

  /**
   * Get time since last activity in milliseconds
   * @returns {number} Milliseconds since last activity
   */
  getTimeSinceLastActivity() {
    return Date.now() - this.lastActivity;
  }

  /**
   * Clean up event listeners and timers
   */
  destroy() {
    // Clear timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Remove event listeners
    this.eventListeners.forEach(({ event, handler }) => {
      document.removeEventListener(event, handler);
    });

    this.eventListeners = [];
    console.log('[UserActivity] Destroyed');
  }

  /**
   * Update inactivity timeout
   * @param {number} newTimeout - New timeout in milliseconds
   */
  setInactivityTimeout(newTimeout) {
    this.inactivityTimeout = newTimeout;
    this.resetInactivityTimer();
    console.log('[UserActivity] Inactivity timeout updated to', newTimeout / 1000, 'seconds');
  }
}

// Create singleton instance
const userActivityTracker = new UserActivityTracker();

// Export the tracker instance and utility functions
export default userActivityTracker;

/**
 * Check if user is currently active
 * @returns {boolean} True if user is active
 */
export const isUserActive = () => userActivityTracker.isUserActive();

/**
 * Get time since last user activity
 * @returns {number} Milliseconds since last activity
 */
export const getTimeSinceLastActivity = () => userActivityTracker.getTimeSinceLastActivity();

/**
 * Set new inactivity timeout
 * @param {number} timeout - Timeout in milliseconds
 */
export const setInactivityTimeout = (timeout) => userActivityTracker.setInactivityTimeout(timeout);
