import api from '@/lib/config/api';
import { ProjectList, projectPayload } from '@/types/project';

export async function CreateprojectService(payload: projectPayload): Promise<any> {
  try {
    const response = await api.post('/projects', payload);
    return response.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function getProjectByUserIdService(): Promise<ProjectList> {
  try {
    const response = await api.get('/projects');
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function updateProjectIdByUserIdService(params: { url: string; payload: projectPayload }): Promise<any> {
  try {
    const response = await api.put(`/projects/${params.url}`, params.payload);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}

export async function deleteProjectIdByUserIdService(payload: string): Promise<any> {
  try {
    const response = await api.delete(`/projects/${payload}`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function getProjectIdService(payload: string): Promise<any> {
  try {
    const response = await api.get(`/projects/${payload}`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}