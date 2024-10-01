import { issueTypes } from "./project";

export interface taskPayload {
    listId: string;
    title: string;
    description: string;
    position: number;
    issueType: string;
    image_urls: string[];
    priority: string;
    assignee: string ;
  }
 