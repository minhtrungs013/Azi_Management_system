
'use client';
import { clearNotification, getNotificationsByUserIdSlice, refreshNotification, updateNotificationByUserIdSlice } from "@/lib/store/features/notificationSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { notification, notificationRecipient } from "@/types/notification";
import { Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useEffect, useState } from "react";
import Link from "next/link";
interface NotificationListenerProps {
    closeNotifitation: () => void;
    // notifications: notification[];
}
const NotificationListener: React.FC<NotificationListenerProps> = ({ closeNotifitation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const authState = useSelector((state: RootState) => state.auth);
    const [notifications, setNotifications] = useState<notification[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const refreshNotificationSlice = useSelector((state: RootState) => state.notification);

    const handleClearNotification = () => {
        dispatch(clearNotification(null));
        dispatch(refreshNotification(false));
        closeNotifitation();
    };

    useEffect(() => {
        (async () => {
            if (authState.userId) {
                setIsLoading(true);
                const resgetNotificationsByUserId = await dispatch(getNotificationsByUserIdSlice(authState.userId));
                if (getNotificationsByUserIdSlice.fulfilled.match(resgetNotificationsByUserId)) {
                    setNotifications(resgetNotificationsByUserId.payload);
                    setIsLoading(false);
                }
            }
        })();
    }, [authState.userId,]);

    const handleUpdateNotification = async (notification: notification) => {
        const notificationRecipient = notification.notificationRecipients.find((recipient) => recipient.userId === authState.userId);
        if (notificationRecipient && authState.userId) {
            notificationRecipient.isRead = true;
            const resUpdateNotification = await dispatch(updateNotificationByUserIdSlice({ notificationRecipientId: notificationRecipient._id, userId: authState.userId }));
            if (updateNotificationByUserIdSlice.fulfilled.match(resUpdateNotification)) {
                closeNotifitation();
                window.location.href = notification.link;
            }
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg overflow-hidden z-50 border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-gray-100 to-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm">🔔 Notification</h3>
                <span className="flex text-xs text-gray-500 cursor-pointer hover:text-red-500" onClick={() => handleClearNotification()}>
                    <Trash2 className="w-4 h-4 font-light mr-1" />
                    Clear All
                </span>
            </div>

            {/* Danh sách thông báo */}
            <ul className="max-h-96 overflow-y-auto overflow-x-hidden divide-y divide-gray-200">
                {isLoading && (
                    <div className="p-4 text-gray-500 text-center text-sm">Loading...</div>
                )}
                {/* Hiển thị thông báo */}
                {notifications.length > 0 ? (
                    notifications.map((item, index) => (

                        <li
                            onClick={() => handleUpdateNotification(item)}
                            key={item._id}
                            className="p-3 text-gray-700 text-sm flex items-center gap-2 hover:bg-gray-50 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer"
                        >
                            {/* Icon cho mỗi thông báo */}
                            {item.notificationRecipients.find(test => test.userId === authState.userId && test.isRead === false) ?
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span> :
                                <span className="w-2 h-2 bg-gray-500 rounded-full flex-shrink-0"></span>
                            }
                            {/* Nội dung thông báo */}
                            <span className="truncate w-full">{item.message}</span>
                        </li>

                    ))
                ) : (
                    <>
                        {!isLoading && (
                            <li className="p-4 text-gray-500 text-center text-sm">
                                No notifications!
                            </li>
                        )}
                    </>
                )}
                <li className="p-4 text-gray-500 text-center text-sm">
                </li>
            </ul>
        </div>
    );
};

export default NotificationListener;

