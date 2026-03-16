// Utility for making authenticated API requests

const getAuthToken = (role: string): string | null => {
  return localStorage.getItem(`dcubes_auth_${role}_token`);
};

export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {},
  requiredRole: 'manager' | 'kitchen' | 'bar' = 'manager'
): Promise<Response> => {
  const token = getAuthToken(requiredRole);
  
  const headers: HeadersInit = {
    ...options.headers,
    'Content-Type': 'application/json',
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(endpoint, {
    ...options,
    headers,
  });
};
