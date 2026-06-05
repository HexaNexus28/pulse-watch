import { api } from './api';
import { API_ENDPOINTS } from '@/config/api';

// Test connection to backend
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing backend connection...');
    
    // Test a simple GET request to a public endpoint
    const response = await api.get('/api/categories');
    
    console.log('Backend connection successful:', response);
    return response.success;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

// Test authentication endpoints
export const testAuthEndpoints = async (): Promise<void> => {
  try {
    console.log('Testing auth endpoints...');
    
    // Test login endpoint (should work even with invalid credentials)
    await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    console.log('Auth endpoint reachable');
  } catch (error: any) {
    // We expect this to fail with 401, but the endpoint should be reachable
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.log('Auth endpoint reachable (expected 401 error)');
    } else {
      console.error('Auth endpoint test failed:', error);
    }
  }
};

// Test dashboard endpoint (requires auth)
export const testDashboardEndpoint = async (): Promise<void> => {
  try {
    console.log('Testing dashboard endpoint...');
    
    const response = await api.get(API_ENDPOINTS.DASHBOARD.STATS);
    console.log('Dashboard endpoint successful:', response);
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.log('Dashboard endpoint reachable (requires authentication)');
    } else {
      console.error('Dashboard endpoint test failed:', error);
    }
  }
};

// Run all connection tests
export const runConnectionTests = async (): Promise<void> => {
  console.log('=== Running Backend Connection Tests ===');
  
  const isConnected = await testBackendConnection();
  
  if (isConnected) {
    await testAuthEndpoints();
    await testDashboardEndpoint();
    console.log('=== All connection tests completed ===');
  } else {
    console.error('=== Backend connection failed - check server status ===');
  }
};

export default runConnectionTests;
