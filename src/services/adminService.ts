import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TrustedAdmin {
    id?: string;
    name: string;
    position: string;
    whatsapp: string;
    facebook: string;
    photoUrl: string;
    createdAt?: unknown;
}

const ADMINS_COLLECTION = 'trustedAdmins';

export const adminService = {
    // Add a new Trusted Admin
    async addAdmin(data: Omit<TrustedAdmin, 'id' | 'createdAt'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, ADMINS_COLLECTION), {
                ...data,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding trusted admin: ", error);
            throw error;
        }
    },

    // Get all Trusted Admins (sorted oldest first)
    async getTrustedAdmins(): Promise<TrustedAdmin[]> {
        try {
            // Using logic client-side sorting if composite indexes aren't set up, 
            // but let's try a simple orderBy first. If it fails due to indexing,
            // we will catch and fallback to client-side sorting.
            const q = query(
                collection(db, ADMINS_COLLECTION)
            );

            const querySnapshot = await getDocs(q);
            const admins = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as TrustedAdmin[];

            // Sort oldest first (so newest is at the bottom)
            return admins.sort((a, b) => {
                const timeA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
                const timeB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
                return timeA - timeB;
            });
        } catch (error) {
            console.error("Error getting trusted admins: ", error);
            throw error;
        }
    },

    // Delete a Trusted Admin by ID
    async deleteAdmin(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, ADMINS_COLLECTION, id));
        } catch (error) {
            console.error("Error deleting trusted admin: ", error);
            throw error;
        }
    }
};
