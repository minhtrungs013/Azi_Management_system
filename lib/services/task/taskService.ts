import api from '@/lib/config/api';
import { Cards } from '@/types/project';
import { sprint, sprintPayload } from '@/types/sprint';
import { getTaskByProjectIdPayload, taskPayload, tasksFilterParams } from '@/types/task';

export async function CreatetaskService(payload: taskPayload): Promise<any> {
  try {
    const response = await api.post('/tasks', payload);
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
    const response = await api.put(`/tasks/${param.taskId}/lists/${param.listId}`);
    return response.data;
  } catch (error: any) {
    return Promise.reject({

      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function updateTaskService(body: { taskId: string, data: object }): Promise<any> {
  try {
    const response = await api.put(`/tasks/${body.taskId}`, body.data);
    return response.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function getTasksByProjectIdService(body: { projectId: string, filterParams: tasksFilterParams }): Promise<{tasks: getTaskByProjectIdPayload[], totalPages: number}> {
  try {
    const response = await api.get(`/tasks/project/${body.projectId}?page=${body.filterParams.page}&searchParams=${body.filterParams.searchParams}&status=${body.filterParams.status}&reporter=${body.filterParams.reporter}&assignee=${body.filterParams.assignee}`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function getTasksByIdService(taskId: string): Promise<Cards> {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function getTaskByCurrentSprintService(projectId: string): Promise<{tasks: getTaskByProjectIdPayload[], sprint: sprint,completionPercentage: number}> {
  try {
    const response = await api.get(`/tasks/current-sprint/${projectId}`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function getTasksOnBacklogService(projectId: string): Promise<getTaskByProjectIdPayload[]> {
  try {
    const response = await api.get(`/tasks/backlog/${projectId}`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}
export async function getTasksBySprintIdService(sprintId: string): Promise<{tasks: getTaskByProjectIdPayload[], sprint: sprint}> {
  try {
    const response = await api.get(`/tasks/sprint/${sprintId}`);
    return response.data.data;
  } catch (error: any) {
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status || 500,
    });
  }
}