import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, serverTimestamp, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface NotificationData {
    id: string;
    userId: string; // The user receiving the notification
    type: 'comment' | 'reply' | 'role_update' | 'scammer_flag' | 'banned' | 'custom';
    listingId?: string;
    link?: string; // Optional custom link for custom notifications
    triggerUserId?: string; // The user who made the comment or admin
    triggerUserName?: string;
    triggerUserPhoto?: string | null;
    message?: string; // Optional custom message for system notifications
    isRead: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: any; // Firestore timestamp
}

export const notificationService = {
    // Add a new notification
    async addNotification(data: Omit<NotificationData, 'id' | 'isRead' | 'createdAt'>) {
        try {
            const notificationsRef = collection(db, 'notifications');
            await addDoc(notificationsRef, {
                ...data,
                isRead: false,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error adding notification:', error);
            throw error;
        }
    },

    // Subscribe to a user's notifications
    subscribeToNotifications(userId: string, callback: (notifications: NotificationData[]) => void) {
        // Query for user's notifications. Note: requires index if we use orderBy, so we'll sort locally for now if no index
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as NotificationData[];

            // Sort by newest first
            notifications.sort((a, b) => {
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
            });

            callback(notifications);
        }, (error) => {
            console.error('Error subscribing to notifications:', error);
        });
    },

    // Mark a single notification as read
    async markAsRead(notificationId: string) {
        try {
            const docRef = doc(db, 'notifications', notificationId);
            await updateDoc(docRef, { isRead: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Mark all notifications as read for a user
    async markAllAsRead(userId: string) {
        try {
            const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('isRead', '==', false));
            const snapshot = await getDocs(q);

            if (snapshot.empty) return;

            const batch = writeBatch(db);
            snapshot.docs.forEach(d => {
                batch.update(d.ref, { isRead: true });
            });

            await batch.commit();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    // Delete a notification (optional, e.g., if the comment was deleted)
    async deleteNotification(notificationId: string) {
        try {
            const docRef = doc(db, 'notifications', notificationId);
            await updateDoc(docRef, { deleted: true }); // Soft delete or actual deleteDoc
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};
