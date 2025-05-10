import { User } from "./auth";
import { sprint } from "./sprint";

export interface projectPayload {
  name: string;
  description: string;
  [key: string]: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}
export interface ProjectUpdate {
  id: string;
  name: string;
  description: string;
}

export type ProjectList = Project[];


export interface Cards {
  _id: string;
  identifier: string;
  title: string;
  description: string;
  assignee: User;
  issueType: string,
  image_urls: string[];
  listId: string;
  position: string;
  priority: string;
  reporter: User;
  startDate: string,
  endDate: string,
  createdAt: string;
  updatedAt: string;
}


export interface List {
  _id: string;
  projectId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  tasks: Cards[];
}
export interface PostList {
  projectId: string;
  name: string;
  position: number;
}
export interface updateList {
  id: string;
  projectId: string;
  name: string;
  position: number;
}

export interface ProjectDetails {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  lists: List[];
}

export interface permission {
  _id: string;
  name: string;
  label: string;
  description: string;
}

export interface AddUserPermissionforProject {
  user: string;
  projectId: string;
  permissions: string[];
}

export const issueTypes = [
  {
    value: 'Task',
  },
  {
    value: 'Bug',
  },
  {
    value: 'Story',
  },
  {
    value: 'Epic',
  },
];
export interface listtest {
  _id: string;
  name: string;
}

export interface Dashboard {
  project: {
      taskCount: number;
      bugCount: number;
      memberCount: number;
      sprintCount: number;
  };
  sprint: {
      currentSprint: sprint; // Hoặc kiểu dữ liệu phù hợp (có thể là object nếu chứa nhiều thông tin)
      lowTaskCount: number;
      mediumTaskCount: number;
      highTaskCount: number;
      inprogressPercentage: number;
      reviewPercentage: number;
      todoPercentage: number;
      donePercentage: number;
      bugPercentage: number;
  };
}