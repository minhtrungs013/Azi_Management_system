import { LoginPayload } from '@/types/auth';
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