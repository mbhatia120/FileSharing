import { auth } from '@/utils/auth';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

    // Log all headers for debugging
    console.log('Raw response headers:', response.headers);

    // Get file name from headers, trying different cases
    const fileName = response.headers['x-file-name'] || 
                    response.headers['X-File-Name'] || 
                    response.headers['x-filename'] ||
                    response.headers['X-Filename'];

    // Get file type from headers, trying different cases
    const fileType = response.headers['x-file-type'] || 
                    response.headers['X-File-Type'] || 
                    response.headers['content-type'] ||
                    response.headers['Content-Type'];

    // Log the extracted values
    console.log('Extracted fileName:', fileName);
    console.log('Extracted fileType:', fileType);

    // Create normalized headers object
    const headers = {
      'x-file-name': fileName,
      'x-file-type': fileType,
    };

    return {
      ...response,
      headers,
      data: response.data,
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

export const register = async (data: { email: string; password: string }) => {
  const response = await api.post('/auth/register/', data);
  return response.data;
};

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  const response = await api.post('/auth/login/', credentials);
  return response.data;
};

export const googleLogin = async (code: string) => {
  try {
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    console.log('Google login request:', {
      code: code.substring(0, 10) + '...',
      redirectUri,
      apiUrl: api.defaults.baseURL
    });
    
    const requestData = { 
      code,
      redirect_uri: redirectUri
    };
    console.log('Request payload:', requestData);

    const response = await api.post('/auth/google/callback/', requestData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Google login response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Full error details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    });
    throw error.response?.data || error.message || 'Failed to authenticate with Google';
  }
};