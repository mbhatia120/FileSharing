import { auth } from '@/utils/auth';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api'
}); 

export const uploadFile = async (
  encryptedFile: ArrayBuffer,
  fileName: string,
  fileType: string
): Promise<{ fileId: string }> => {
  const formData = new FormData();
  const blob = new Blob([encryptedFile], { type: fileType });
  formData.append('file', blob, fileName);

  const accessToken = auth.getToken();

  const response = await api.post('/files/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}; 