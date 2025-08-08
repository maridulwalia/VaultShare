const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('vaultshare_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  // File operations
  uploadFile: async (formData: FormData) => {
    const token = sessionStorage.getItem('vaultshare_token');
    const response = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  },

  getFileInfo: async (fileId: string) => {
    const response = await fetch(`${API_BASE}/files/info/${fileId}`);
    return response.json();
  },

  downloadFile: async (fileId: string, password?: string) => {
    const response = await fetch(`${API_BASE}/files/download/${fileId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response;
  },

  getUserFiles: async () => {
    const response = await fetch(`${API_BASE}/files/my-files`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  deleteFile: async (fileId: string) => {
    const response = await fetch(`${API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Admin operations
  getAdminStats: async () => {
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getAdminFiles: async (page = 1, limit = 20) => {
    const response = await fetch(`${API_BASE}/admin/files?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  deleteFileAdmin: async (fileId: string) => {
    const response = await fetch(`${API_BASE}/admin/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getAdminUsers: async () => {
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  deleteUserAdmin: async (userId: string) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};