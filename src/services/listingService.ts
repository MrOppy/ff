import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AccountData } from '../components/AccountCard';

// Firestore requires strictly formatted objects, undefined is not allowed. 
// Adding Omit to exclude the 'id' when inserting
export type NewListingData = Omit<AccountData, 'id' | 'featured'> & {
    sellerId: string;
    sellerUsername: string;
    sellerPhoto: string | null;
    createdAt: unknown; // serverTimestamp
    status: 'active' | 'sold' | 'pending_review';
    description: string;
    evoGuns: { name: string, level: string }[];
    totalVault: string;
    accountAge: string;
    maxEvosCount: number;
    primeLevel: number; // Max 8
    server: string;
    videoUrl?: string; // YouTube or Streamable
    imageGallery: string[]; // Replaces storage URLs with direct URLs from Catbox.moe
};

export const LISTINGS_COLLECTION = 'listings';

export const listingService = {
    // Create a new listing
    async createListing(data: Omit<NewListingData, 'createdAt' | 'status'>) {
        const listingsRef = collection(db, LISTINGS_COLLECTION);
        const docRef = await addDoc(listingsRef, {
            ...data,
            status: 'active',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    // Get all active listings
    async getActiveListings(): Promise<AccountData[]> {
        // Removed orderBy to prevent requiring a composite index in Firestore. We sort locally.
        const q = query(
            collection(db, LISTINGS_COLLECTION),
            where('status', 'in', ['active', 'sold'])
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AccountData[];

        // Sort newest first
        return results.sort((a, b) => {
            const timeA = (a as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() || 0;
            const timeB = (b as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() || 0;
            return timeB - timeA;
        });
    },

    // Get featured active listings
    async getFeaturedListings(): Promise<AccountData[]> {
        const q = query(
            collection(db, LISTINGS_COLLECTION),
            where('status', 'in', ['active', 'sold']),
            where('isFeatured', '==', true)
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AccountData[];

        // Sort oldest first (so the first feature added is at the top)
        return results.sort((a, b) => {
            const timeA = (a as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() || 0;
            const timeB = (b as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() || 0;
            return timeA - timeB;
        });
    },

    // Get a specific listing by ID
    async getListingById(id: string) {
        const docRef = doc(db, LISTINGS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    },

    // Get all listings by a specific seller (by display name -> used for public profiles)
    async getListingsBySeller(sellerName: string): Promise<AccountData[]> {
        const q = query(
            collection(db, LISTINGS_COLLECTION),
            where('seller', '==', sellerName)
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AccountData[];

        return results.sort((a, b) => {
            const timeA = (a as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() || 0;
            const timeB = (b as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() || 0;
            return timeB - timeA;
        });
    },

    // Get all listings for the logged-in seller securely by their UID
    async getListingsBySellerId(sellerId: string): Promise<AccountData[]> {
        const q = query(
            collection(db, LISTINGS_COLLECTION),
            where('sellerId', '==', sellerId)
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AccountData[];

        return results.sort((a, b) => {
            const timeA = (a as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() || 0;
            const timeB = (b as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() || 0;
            return timeB - timeA;
        });
    },

    // Update entire listing data (Admin or Owner)
    async updateListingData(id: string, data: Partial<NewListingData>) {
        const docRef = doc(db, LISTINGS_COLLECTION, id);
        await updateDoc(docRef, data);
    },

    // Update a listing (e.g. mark as sold)
    async updateListingStatus(id: string, status: 'active' | 'sold' | 'pending_review') {
        const docRef = doc(db, LISTINGS_COLLECTION, id);
        await updateDoc(docRef, { status });
    },

    // Delete a listing (admin only)
    async deleteListing(id: string) {
        const docRef = doc(db, LISTINGS_COLLECTION, id);
        await deleteDoc(docRef);
    },

    // Batch update username on all of a seller's listings
    async updateListingsUsername(sellerId: string, newUsername: string) {
        const q = query(collection(db, LISTINGS_COLLECTION), where('sellerId', '==', sellerId));
        const snapshots = await getDocs(q);

        // Firestore batch limits to 500, we'll assume a seller doesn't have > 500
        const batchItem = writeBatch(db);
        snapshots.docs.forEach(d => {
            batchItem.update(d.ref, { sellerUsername: newUsername });
        });

        await batchItem.commit();
    },

    // Batch update displayName and photo across listings
    async updateListingsProfile(sellerId: string, newDisplayName: string, newPhotoURL: string) {
        const q = query(collection(db, LISTINGS_COLLECTION), where('sellerId', '==', sellerId));
        const snapshots = await getDocs(q);

        const batchItem = writeBatch(db);
        snapshots.docs.forEach(d => {
            batchItem.update(d.ref, {
                seller: newDisplayName,
                sellerPhoto: newPhotoURL
            });
        });

        await batchItem.commit();
    }
};
