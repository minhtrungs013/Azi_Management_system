import api from '@/lib/config/api';
import { LoginPayload, UserUpdate } from '@/types/auth';
import axios from 'axios';

export async function loginService(payload: LoginPayload): Promise<any> {
  try {
    const response = await axios.post('http://192.168.188.71:5555/auth/login', payload);
    return response.data; // Return the actual response data
  } catch (error: any) {
    return Promise.reject({
      message: error.response.data.message || 'Something went wrong',
      status: error.response.status
    });
  }
}

export async function getAllUserService(): Promise<any> {
  try {
    const response = await api.get(`/users`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function updateUserService(body: { url: string; payload: UserUpdate }): Promise<any> {
  try {
    const response = await api.put(`/users/${body.url}`, body.payload);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}