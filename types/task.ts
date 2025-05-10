import { User } from "./auth";
import { issueTypes, List } from "./project";

export interface taskPayload {
  _id?: string; 
  listId: string;
  title: string;
  description: string;
  position: number;
  issueType: string;
  image_urls: string[];
  priority: string;
  assignee: string;
  reporter?: string;
  sprintId?: string;
  isBacklog: boolean;
}
export interface getTaskByProjectIdPayload {
  _id?: string; 
  listId: List;
  identifier: string;
  title: string;
  description: string;
  position: number;
  issueType: string;
  image_urls: string[];
  priority: string;
  assignee: User ;
  reporter?: User;
  sprintId?: string;
  isBacklog: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface tasksFilterParams {
  assignee?: string;
  reporter?: string;
  status: string;
  page: string;
  searchParams: string;
}