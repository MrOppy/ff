import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const USERS_COLLECTION = 'users';

export const userService = {
    // Check if a username is already taken by another user
    async isUsernameTaken(username: string, excludeUid?: string): Promise<boolean> {
        if (!username) return true;

        const q = query(
            collection(db, USERS_COLLECTION),
            where('username', '==', username)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
            return false;
        }

        // If it's taken, check if it's taken by the CURRENT user (which is fine)
        if (excludeUid) {
            const doc = snap.docs[0];
            if (doc.id === excludeUid) {
                return false;
            }
        }

        return true;
    },

    // Generates a random alphanumeric username
    generateRandomUsername(): string {
        const randomString = Math.random().toString(36).substring(2, 8);
        return `user_${randomString}`;
    },

    // Get user by username
    async getUserByUsername(username: string) {
        const q = query(
            collection(db, USERS_COLLECTION),
            where('username', '==', username)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return { uid: snap.docs[0].id, ...(snap.docs[0].data() as any) };
        }
        return null;
    }
};
