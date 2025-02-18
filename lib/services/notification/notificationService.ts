import api from '@/lib/config/api';
import { notification, notificationCreate } from '@/types/notification';

export async function createNotificationService(payload: notificationCreate): Promise<any> {
    try {
        const response = await api.post('/notifications', payload);
        return response.data;
    } catch (error: any) {
        return Promise.reject({
            message: error.response?.data?.message || 'Something went wrong',
            status: error.response?.status || 500,
        });
    }
}
export async function updateNotificationByUserIdService(params: { notificationRecipientId: string, userId: string }): Promise<any> {
    try {
        const response = await api.put(`/notifications/notificationRecipient/${params.notificationRecipientId}/${params.userId}`);
        return response.data;
    } catch (error: any) {
        return Promise.reject({
            message: error.response?.data?.message || 'Something went wrong',
            status: error.response?.status || 500,
        });
    }
}
export async function getNotificationsByUserIdService(userId: string): Promise<notification[]> {
    try {
        const response = await api.get(`/notifications/user/${userId}`);
        return response.data.data;
    } catch (error: any) {
        return Promise.reject({
            message: error.response?.data?.message || 'Something went wrong',
            status: error.response?.status || 500,
        });
    }
}