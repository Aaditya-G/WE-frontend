import { BACKEND_URL } from '@/const';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

export const basicAxios = async (endpoint: string, options?: AxiosRequestConfig) => {
  try {
    const res = await axios({
      baseURL: BACKEND_URL,
      url: endpoint,
      method: 'GET',
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${getAccessToken()}`,
      },
      ...options,
    });
    return res;
  } catch (err) {
    throw err;
  }
};
