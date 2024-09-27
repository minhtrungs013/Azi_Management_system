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
  title: string;
  description: string;
  assignedUserIds: string[];
  image_urls: string[];
  listId: string;
  position: string;
  priority: string;
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
  cards: Cards[];
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