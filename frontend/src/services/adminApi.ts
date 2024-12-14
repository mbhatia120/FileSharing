import { api } from './api';

interface AdminUser {
  id: string;
  email: string;
  is_active: boolean;
  role: string;
  date_joined: string;
  last_login: string | null;
}

interface AdminFile {
  id: string;
  original_name: string;
  file_type: string;
  size: number;
  created_at: string;
  owner_email: string;
}

export const adminApi = {
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/auth/admin/');
    return response.data;
  },

  updateUser: async (userId: string, data: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await api.put(`/auth/admin/${userId}/`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/auth/admin/${userId}/`);
  },

  getUserFiles: async (userId: string): Promise<AdminFile[]> => {
    const response = await api.get(`/auth/admin/${userId}/files/`);
    return response.data;
  },

  getAllFiles: async (): Promise<AdminFile[]> => {
    const response = await api.get('/auth/admin/all_files/');
    return response.data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete('/auth/admin/delete_file/', { data: { file_id: fileId } });
  }
}; 