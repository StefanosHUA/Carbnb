/**
 * Test script for UserActivityTracker
 * This file can be imported in the browser console for testing
 */

// Import the user activity tracker (in a real test environment)
import userActivityTracker, { isUserActive, getTimeSinceLastActivity, setInactivityTimeout } from './userActivity';

console.log('=== User Activity Tracker Test ===');

// Test 1: Initial state should be active
console.log('Test 1: Initial state');
console.log('Is user active?', isUserActive());
console.log('Time since last activity:', getTimeSinceLastActivity(), 'ms');

// Test 2: Simulate user activity
console.log('\nTest 2: Simulating user activity');
document.dispatchEvent(new Event('click'));
setTimeout(() => {
  console.log('After click - Is user active?', isUserActive());
  console.log('Time since last activity:', getTimeSinceLastActivity(), 'ms');
}, 100);

// Test 3: Test inactivity timeout (set to 2 seconds for testing)
console.log('\nTest 3: Testing inactivity timeout');
setInactivityTimeout(2000); // 2 seconds
console.log('Set timeout to 2 seconds');

setTimeout(() => {
  console.log('After 3 seconds - Is user active?', isUserActive());
  console.log('Time since last activity:', getTimeSinceLastActivity(), 'ms');
}, 3000);

// Test 4: Test page visibility
console.log('\nTest 4: Testing page visibility');
console.log('Current visibility state:', document.visibilityState);

// Simulate visibility change (in a real browser, this would be triggered by user)
Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
document.dispatchEvent(new Event('visibilitychange'));
console.log('After visibility change to hidden - Is user active?', isUserActive());

Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
document.dispatchEvent(new Event('visibilitychange'));
console.log('After visibility change to visible - Is user active?', isUserActive());

console.log('\n=== Test completed ===');
console.log('To test manually:');
console.log('- Click anywhere on the page to reset activity');
console.log('- Switch tabs to test visibility');
console.log('- Wait for timeout to test inactivity detection');
