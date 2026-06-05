// Session utilities for handling expired sessions

export const showSessionExpiredNotification = (message: string = 'Your session has expired. Please login again.') => {
  // Create a toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
  toast.innerHTML = `
    <div class="flex items-center space-x-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 5000);
};

export const handleSessionExpired = (message?: string) => {
  // Clear tokens
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  
  // Show notification
  showSessionExpiredNotification(message);
  
  // Redirect to login after a short delay
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
};
