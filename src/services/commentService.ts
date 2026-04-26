import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, arrayUnion, deleteDoc, arrayRemove, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CommentData {
    id: string;
    listingId: string;
    userId: string;
    userName: string;
    userPhoto: string | null;
    text: string;
    createdAt: unknown;
    isSellerReply: boolean;
    authorRole?: string;
    replies?: {
        userId: string;
        userName: string;
        userPhoto: string | null;
        text: string;
        createdAt: string;
        isSellerReply?: boolean;
        authorRole?: string;
    }[];
}

export const commentService = {
    async addComment(listingId: string, userId: string, userName: string, userPhoto: string | null, text: string, isSeller: boolean, authorRole?: string) {
        try {
            const docRef = await addDoc(collection(db, 'comments'), {
                listingId,
                userId,
                userName,
                userPhoto,
                text,
                isSellerReply: isSeller,
                authorRole: authorRole || null,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding comment: ", error);
            throw error;
        }
    },

    async getCommentsByListing(listingId: string): Promise<CommentData[]> {
        try {
            const q = query(
                collection(db, 'comments'),
                where("listingId", "==", listingId)
            );
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CommentData));

            return docs.sort((a, b) => {
                const timeA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
                const timeB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
                return timeB - timeA; // Latest first
            });
        } catch (error) {
            console.error("Error fetching comments: ", error);
            return [];
        }
    },

    async replyToComment(commentId: string, replyData: { userId: string, userName: string, userPhoto: string | null, text: string, isSellerReply?: boolean, authorRole?: string }) {
        try {
            const commentRef = doc(db, 'comments', commentId);
            // Sanitize undefined/null fields for Firestore
            const rawData = {
                userId: replyData.userId,
                userName: replyData.userName,
                userPhoto: replyData.userPhoto,
                text: replyData.text,
                isSellerReply: replyData.isSellerReply,
                authorRole: replyData.authorRole
            };
            const sanitizedData = Object.fromEntries(
                Object.entries(rawData).filter(([_, v]) => v != null) // Filters both null and undefined
            );
            await updateDoc(commentRef, {
                replies: arrayUnion({
                    ...sanitizedData,
                    createdAt: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error("Error adding reply: ", error);
            throw error;
        }
    },

    async deleteComment(commentId: string) {
        try {
            await deleteDoc(doc(db, 'comments', commentId));
        } catch (error) {
            console.error("Error deleting comment: ", error);
            throw error;
        }
    },

    async deleteReply(commentId: string, replyData: { userId: string, userName: string, text: string, createdAt: string, userPhoto: string | null }) {
        try {
            const commentRef = doc(db, 'comments', commentId);
            await updateDoc(commentRef, {
                replies: arrayRemove(replyData)
            });
        } catch (error) {
            console.error("Error deleting reply: ", error);
            throw error;
        }
    },

    // Batch update displayName and photo across all comments by a user
    async updateCommentsProfile(userId: string, newDisplayName: string, newPhotoURL: string) {
        try {
            const q = query(collection(db, 'comments'), where('userId', '==', userId));
            const snapshots = await getDocs(q);

            const batchItem = writeBatch(db);
            snapshots.docs.forEach(d => {
                batchItem.update(d.ref, {
                    userName: newDisplayName,
                    userPhoto: newPhotoURL
                });
            });

            await batchItem.commit();
        } catch (error) {
            console.error("Error updating comments profile: ", error);
            throw error;
        }
    }
};
