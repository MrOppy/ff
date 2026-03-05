import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';

export interface SellerReview {
    id: string;
    sellerId: string;
    adminId: string;
    rating: number; // 1 to 5
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewsCollection = collection(db, 'reviews');

export const reviewService = {
    async getReviewsForSeller(sellerId: string): Promise<SellerReview[]> {
        try {
            const q = query(
                reviewsCollection,
                where("sellerId", "==", sellerId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as SellerReview;
            });
        } catch (error) {
            console.error("Error fetching reviews:", error);
            // Firebase might need an index for this query. If it fails, fallback to client side sorting.
            try {
                const fallbackQ = query(reviewsCollection, where("sellerId", "==", sellerId));
                const snapshot = await getDocs(fallbackQ);
                const reviews = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date()
                    } as SellerReview;
                });
                return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            } catch (fallbackError) {
                console.error("Fallback review fetch failed:", fallbackError);
                return [];
            }
        }
    },

    async addReview(sellerId: string, adminId: string, rating: number, text: string): Promise<string> {
        const docRef = await addDoc(reviewsCollection, {
            sellerId,
            adminId,
            rating,
            text,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    },

    async updateReview(reviewId: string, rating: number, text: string): Promise<void> {
        const reviewRef = doc(db, 'reviews', reviewId);
        await updateDoc(reviewRef, {
            rating,
            text,
            updatedAt: Timestamp.now()
        });
    },

    async deleteReview(reviewId: string): Promise<void> {
        const reviewRef = doc(db, 'reviews', reviewId);
        await deleteDoc(reviewRef);
    }
};
