const API_BASE_URL = '/api';

export const api = {
  async post(endpoint: string, data: any, options: { headers?: Record<string, string> } = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API POST Error [${endpoint}]:`, error.message);
      throw error;
    }
  },

  async put(endpoint: string, data: any, options: { headers?: Record<string, string> } = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API PUT Error [${endpoint}]:`, error.message);
      throw error;
    }
  },

  async get(endpoint: string, options: { headers?: Record<string, string> } = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: options.headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API GET Error [${endpoint}]:`, error.message);
      throw error;
    }
  },
};
