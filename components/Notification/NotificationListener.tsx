
'use client';
import { clearNotification } from "@/lib/store/features/notificationSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
interface NotificationListenerProps {
    closeNotifitation: () => void;
}
const NotificationListener: React.FC<NotificationListenerProps> = ({ closeNotifitation }) => {
    const notificationState = useSelector((state: RootState) => state.notification);
    const notifications = notificationState.notification || [];
    const dispatch = useDispatch<AppDispatch>();

    const handleClearNotification = () => {
        dispatch(clearNotification(null));
        closeNotifitation();
    };
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg overflow-hidden z-50 border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-gray-100 to-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm">🔔 Notification</h3>
                <span className="flex text-xs text-gray-500 cursor-pointer hover:text-red-500" onClick={() =>handleClearNotification()}>
                <Trash2 className="w-4 h-4 font-light mr-1" />
                    Clear All
                </span>
            </div>

            {/* Danh sách thông báo */}
            <ul className="max-h-96 overflow-y-auto overflow-x-hidden divide-y divide-gray-200">
                {notifications.length > 0 ? (
                    notifications.map((item, index) => (
                        <li
                            key={index}
                            className="p-3 text-gray-700 text-sm flex items-center gap-2 hover:bg-gray-50 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer"
                        >
                            {/* Icon cho mỗi thông báo */}
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            {/* Nội dung thông báo */}
                            <span className="truncate w-full">{item}</span>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-gray-500 text-center text-sm">
                        No notifications!
                    </li>
                )}
                <li className="p-4 text-gray-500 text-center text-sm">
                </li>
            </ul>
        </div>
    );
};

export default NotificationListener;

