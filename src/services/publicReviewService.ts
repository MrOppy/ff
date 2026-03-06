import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PublicReview {
    id?: string;
    userId: string;
    userName: string;
    userPhoto: string | null;
    rating: number;
    message: string;
    createdAt: Date | Timestamp;
    isAdminReview?: boolean; // Flag to easily style admin reviews if needed
}

export const REVIEWS_COLLECTION = 'publicReviews';

export const publicReviewService = {
    async addReview(reviewData: Omit<PublicReview, 'id' | 'createdAt'>): Promise<string> {
        // Enforce 24-hour rule on the client side before writing (Admins exempt: controlled in UI mostly, but double check)
        const canReview = await this.canUserReview(reviewData.userId);
        if (!canReview && !reviewData.isAdminReview) {
            throw new Error("You can only post one review every 24 hours.");
        }

        const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
            ...reviewData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    async getReviews(): Promise<PublicReview[]> {
        const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date()
            } as PublicReview;
        });
    },

    async deleteReview(reviewId: string): Promise<void> {
        await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    },

    async canUserReview(userId: string): Promise<boolean> {
        try {
            // Find the reviews by this user without orderBy to avoid requiring a composite index
            const q = query(
                collection(db, REVIEWS_COLLECTION),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);

            // If they have no reviews, they can definitely review
            if (querySnapshot.empty) return true;

            // Sort manually client-side (newest first)
            const userReviews = querySnapshot.docs.map(doc => doc.data());
            userReviews.sort((a, b) => {
                const dateA = a.createdAt ? (a.createdAt as Timestamp).toDate().getTime() : 0;
                const dateB = b.createdAt ? (b.createdAt as Timestamp).toDate().getTime() : 0;
                return dateB - dateA;
            });

            const latestReview = userReviews[0];
            if (!latestReview.createdAt) return false; // Safety check for pending writes

            // Calculate time difference
            const lastReviewDate = (latestReview.createdAt as Timestamp).toDate();
            const now = new Date();
            const hoursSinceLastReview = (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60);

            return hoursSinceLastReview >= 24;
        } catch (error) {
            console.error("Error checking cooldown status:", error);
            // Default to allow if check fails, but in a real app might want to fail-closed
            return true;
        }
    }
};
