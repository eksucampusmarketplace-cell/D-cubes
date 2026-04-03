// Utility for making authenticated API requests

export class AuthError extends Error {
  constructor(public role: string) {
    super(`Not authenticated as ${role}`);
    this.name = 'AuthError';
  }
}

export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {},
  _role: 'manager' | 'kitchen' | 'bar' = 'manager'
): Promise<Response> => {
  return fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
