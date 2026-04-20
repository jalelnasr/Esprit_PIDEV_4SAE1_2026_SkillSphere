// ✅ Fix SockJS "global is not defined" error in Karma/Jasmine test environment
// SockJS uses Node.js 'global' variable which doesn't exist in browsers
(window as any).global = window;
