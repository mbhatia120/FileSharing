import { auth } from '@/utils/auth';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api'
}); 

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401
      auth.clear();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

interface FileResponse {
  id: string;
  original_name: string;
  file_type: string;
  size: number;
  created_at: string;
  is_shared: boolean;
  shared_by: string | null;
  permission?: 'VIEW' | 'DOWNLOAD';
}

export const uploadFile = async (
  encryptedFile: ArrayBuffer,
  fileName: string,
  fileType: string
): Promise<{ fileId: string }> => {
  const formData = new FormData();
  const blob = new Blob([encryptedFile], { type: fileType });
  formData.append('file', blob, fileName);

  const response = await api.post('/files/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 

export const getFiles = async (): Promise<FileResponse[]> => {
  const response = await api.get('/files/');
  return response.data;
}; 

export const downloadFile = async (fileId: string): Promise<ArrayBuffer> => {
  const response = await api.get(`/files/${fileId}/download/`, {
    responseType: 'arraybuffer',
  });
  return response.data;
}; 

interface ShareFileRequest {
  shared_with_email: string;
  permission: string;
}

export const shareFile = async (fileId: string, data: ShareFileRequest): Promise<void> => {
  await api.post(`/files/${fileId}/share/`, data, {
    headers: {
      'Content-Type': 'application/json'
    },
  });
};

export const generateSecureLink = async (fileId: string) => {
  const response = await api.post(`/files/${fileId}/generate_secure_link/`);
  return response.data;
};

export const getSecureFile = async (linkId: string) => {
  // Create a new axios instance without the auth interceptor
  const publicApi = axios.create({
    baseURL: 'http://localhost:8000/api'
  });

  try {
    const response = await publicApi.get(`/files/secure-link/${linkId}/`, {
      responseType: 'arraybuffer',
      headers: {
        Accept: '*/*'
      },
    });

    // Convert headers to lowercase for consistency
    const headers = {
      'x-file-name': response.headers['x-file-name'] || response.headers['X-File-Name'],
      'x-file-type': response.headers['x-file-type'] || response.headers['X-File-Type'] || response.headers['content-type'],
    };
    
    console.log('Raw headers:', response.headers);
    console.log('Processed headers:', headers);

    return {
      ...response,
      headers,
    };
  } catch (error: any) {
    // If it's a 410 error, parse the JSON error message
    if (error.response?.status === 410) {
      const decoder = new TextDecoder('utf-8');
      const errorText = decoder.decode(error.response.data);
      error.response.data = JSON.parse(errorText);
    }
    throw error;
  }
};