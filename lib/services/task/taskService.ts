import api from '@/lib/config/api';
import { taskPayload } from '@/types/task';

export async function CreatetaskService(payload: taskPayload): Promise<any> {
  try {
    const response = await api.post('/cards', payload);
    return response.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
