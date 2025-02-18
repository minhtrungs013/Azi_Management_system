import { User } from "./auth";

export interface notification {
    _id?: string;
    title: string;
    message: string;
    senderId: User;
    type: string;
    link: string;
    notificationRecipients: notificationRecipient[];
}
export interface notificationRecipient {
    _id: string;
    notificationId: string;
    userId: string;
    isRead: boolean;
    isArchived: string;
} 

export interface notificationCreate {
    _id?: string;
    title: string;
    message: string;
    senderId?: string;
    type: string;
    link: string;
    notificationRecipients: string[];
}