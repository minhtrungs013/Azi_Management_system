export interface sprintPayload {
    name: string;
    description: string;
    projectId: string;
    startDate: string;
    endDate: string;
  }
export interface sprint {
    _id?: string;
    name: string;
    description: string;
    status: string;
    projectId: string;
    startDate: string;
    endDate: string;
  }