import api from '@/lib/config/api';
import { AddUserPermissionforProject, permission, PostList, ProjectList, projectPayload, updateList } from '@/types/project';

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

export async function getPermissionService(): Promise<permission[]> {
  try {
    const response = await api.get(`/permissions`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}

export async function inviteMemberToProjectService(body: { url: string; payload: AddUserPermissionforProject }): Promise<any> {
  try {
    const response = await api.post(`/projects/${body.url}/members`, body.payload);
    return response.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}

export async function getAllNonMemberToProjectService(url: String): Promise<any> {
  try {
    const response = await api.get(`/projects/${url}/non-members`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}

export async function getAllMemberProjectService(url: String): Promise<any> {
  try {
    const response = await api.get(`/projects/${url}/members`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}

export async function postListToProjectService(payload: PostList): Promise<any> {
  try {
    const response = await api.post(`/lists`, payload);
    return response.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function updateListToProjectService(payload: updateList): Promise<any> {
  try {
    const response = await api.put(`/lists`, payload);
    return response.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}