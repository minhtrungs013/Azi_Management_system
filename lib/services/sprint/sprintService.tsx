import api from '@/lib/config/api';
import { sprint, sprintPayload } from '@/types/sprint';

export async function createSprintService(payload: sprintPayload): Promise<any> {
  try {
    const response = await api.post('/sprint', payload);
    return response.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function getAllSprintByProjectIdService(projectId: string): Promise<sprint[]> {
  try {
    const response = await api.get(`/sprint/${projectId}`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}

