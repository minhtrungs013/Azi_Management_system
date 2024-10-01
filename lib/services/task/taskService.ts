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
export async function moveTaskService(param: { listId: string, taskId: string }): Promise<any> {
  try {
    const response = await api.put(`/cards/${param.taskId}/lists/${param.listId}`);
    return response.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
