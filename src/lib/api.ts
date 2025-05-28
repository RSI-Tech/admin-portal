/**
 * API utility functions for handling requests with proper basePath
 */

// Get the base path from Next.js config
const basePath = process.env.NODE_ENV === 'production' ? '/admin-portal' : '';

/**
 * Creates an API URL with the correct base path
 * @param endpoint - The API endpoint (e.g., '/api/users')
 * @returns Full API URL with base path
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present, then add base path
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${basePath}/${cleanEndpoint}`;
}

/**
 * Wrapper around fetch with automatic base path handling
 * @param endpoint - The API endpoint
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
}

/**
 * Convenience method for GET requests
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Convenience method for POST requests
 */
export async function apiPost<T = any>(endpoint: string, data: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}