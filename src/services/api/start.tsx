import type { AxiosResponse } from 'axios';
import { basicAxios } from '@/services/basicAxios';
import API_ENDPOINTS from '@/services/endpoints';
import { _USER } from '@/types';

export const sample = async (data: any) => {
  const options = {
    method: 'POST',
    data: data,
  };
  const res: AxiosResponse<any> = await basicAxios(API_ENDPOINTS.sample, options);
  return res.data;
};

export const addUser = async (data: Partial<_USER>) => {
  const options = {
    method: 'POST',
    data: data,
  };
  const res: AxiosResponse<_USER> = await basicAxios(API_ENDPOINTS.addUser, options);
  return res.data;
}

