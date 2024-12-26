import type { AxiosResponse } from 'axios';
import { basicAxios } from '@/services/basicAxios';
import API_ENDPOINTS from '@/services/endpoints';

export const sample = async (data: any) => {
  const options = {
    method: 'POST',
    data: data,
  };
  const res: AxiosResponse<any> = await basicAxios(API_ENDPOINTS.sample, options);
  return res.data;
};

