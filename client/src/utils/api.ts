// Utility for making authenticated API requests

export class AuthError extends Error {
  constructor(public role: string) {
    super(`Not authenticated as ${role}`);
    this.name = 'AuthError';
  }
}

const getAuthToken = (role: string): string | null => {
  return localStorage.getItem(`dcubes_auth_${role}_token`);
};

export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {},
  role: 'manager' | 'kitchen' | 'bar' = 'manager'
): Promise<Response> => {
  const token = getAuthToken(role);
  if (!token) throw new AuthError(role);  // <-- KEY CHANGE
  return fetch(endpoint, {
    ...options,
    headers: { ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` },
  });
};
