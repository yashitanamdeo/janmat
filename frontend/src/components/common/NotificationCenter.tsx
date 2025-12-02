import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Notification {
    id: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    read: boolean;
    createdAt: string;
}

export const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:3000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch('http://localhost:3000/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return '⚠️';
            case 'SUCCESS': return '✅';
            case 'ERROR': return '❌';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700 animate-fade-in-down">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="text-xl flex-shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
