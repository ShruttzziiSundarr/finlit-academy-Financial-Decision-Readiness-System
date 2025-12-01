import { ApolloClient } from '@apollo/client';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

/**
 * Get stored authentication token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

/**
 * Get stored user data
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

/**
 * Store authentication data
 */
export function setAuthData(token: string, refreshToken: string, user: User): void {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Decode JWT token (simple base64 decode - does not verify signature)
 */
export function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
}

/**
 * Check if current stored token is valid
 */
export function hasValidToken(): boolean {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Logout and redirect to login page
 */
export function logout(apolloClient?: ApolloClient<any>): void {
  clearAuthData();

  // Clear Apollo cache if provided
  if (apolloClient) {
    apolloClient.clearStore();
  }

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
