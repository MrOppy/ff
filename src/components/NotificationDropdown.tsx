import { useState, useRef, useEffect } from 'react';
import { Bell, Check, MessageSquare, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleNotificationClick = async (notificationId: string, listingId?: string, link?: string, type?: string) => {
        await markAsRead(notificationId);
        setIsOpen(false);
        if (link) {
            if (link.startsWith('http')) {
                window.open(link, '_blank');
            } else {
                navigate(link);
            }
        } else if (listingId) {
            navigate(`/account/${listingId}`);
        } else if (type !== 'custom') {
            navigate('/profile');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatTimeAgo = (timestamp: any) => {
        if (!timestamp) return '';
        try {
            const time = timestamp.toMillis ? timestamp.toMillis() : (timestamp.seconds ? timestamp.seconds * 1000 : Date.now());
            const diff = Date.now() - time;
            
            const minutes = Math.floor(diff / 60000);
            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        } catch {
            return '';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gaming-800"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-gaming-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-[-10px] sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[360px] bg-gaming-900 border border-gaming-700/80 rounded-2xl shadow-xl shadow-black/50 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gaming-700/80 flex items-center justify-between bg-gaming-800/50">
                        <h3 className="font-bold text-white text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-[10px] text-gaming-accent hover:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gaming-muted flex flex-col items-center">
                                <Bell className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gaming-800/50">
                                {notifications.map(notification => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id, notification.listingId, notification.link, notification.type)}
                                        className={`w-full text-left p-4 hover:bg-gaming-800/80 transition-colors flex items-start gap-3 ${
                                            !notification.isRead ? 'bg-gaming-800/30' : ''
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gaming-700 flex items-center justify-center overflow-hidden border border-gaming-600">
                                                {['banned', 'scammer_flag', 'role_update', 'custom'].includes(notification.type) ? (
                                                    <ShieldAlert className="w-5 h-5 text-gaming-muted" />
                                                ) : notification.triggerUserPhoto ? (
                                                    <img src={notification.triggerUserPhoto} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-white text-xs">
                                                        {notification.triggerUserName ? notification.triggerUserName.charAt(0).toUpperCase() : 'A'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gaming-900 flex items-center justify-center ${notification.type === 'banned' || notification.type === 'scammer_flag' ? 'bg-red-500' : notification.type === 'custom' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                                                {notification.type === 'custom' ? <Bell className="w-2.5 h-2.5 text-white" /> : <MessageSquare className="w-2.5 h-2.5 text-white" />}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-300 leading-snug">
                                                <span className="font-bold text-white">
                                                    {['banned', 'scammer_flag', 'role_update', 'custom'].includes(notification.type) ? 'System Notice' : notification.triggerUserName || 'System'}
                                                </span>
                                                {notification.message ? ` ${notification.message}` : (notification.type === 'comment' ? ' commented on your listing' : ' replied to you')}
                                            </p>
                                            <p className="text-[10px] text-gaming-muted mt-1 uppercase tracking-wide font-medium">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                        
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
