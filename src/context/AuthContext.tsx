import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    updateProfile as updateFirebaseAuthProfile
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_EMAIL } from '../lib/firebase';
import { userService } from '../services/userService';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    bio?: string | null;
    role: 'user' | 'seller' | 'trusted_seller' | 'admin' | 'higher_admin' | 'main_admin';
    createdAt: number;
    whatsappNumber?: string | null;
    isBanned?: boolean;
    isScammer?: boolean;
    wishlist?: string[];
    username?: string;
    hasCompletedOnboarding?: boolean;
}

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    isAdmin: boolean;
    isSeller: boolean;
    toggleWishlist: (listingId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// We'll temporarily set this so we don't block the UI while developing
// In a real app, you'd replace 'ADMIN_EMAIL' in firebase.ts with your actual email.
const isMainAdmin = (email: string | null) => email === ADMIN_EMAIL;
const isAutoAdmin = (email: string | null) => email?.includes("admin") && email !== ADMIN_EMAIL;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Fetch or create user profile in Firestore
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    let userRole: 'user' | 'seller' | 'trusted_seller' | 'admin' | 'higher_admin' | 'main_admin' = 'user';

                    // Auto-assign admin if email matches
                    if (isMainAdmin(currentUser.email)) {
                        userRole = 'main_admin';
                    } else if (isAutoAdmin(currentUser.email)) {
                        userRole = 'admin';
                    }

                    if (userSnap.exists()) {
                        const data = userSnap.data() as UserProfile & { isBanned?: boolean, isScammer?: boolean };

                        // We no longer boot the user if they are banned, so they can login 
                        // but will be blocked from specific actions via UI/Firestore.

                        let updatedData = { ...data };

                        // Generate a username if they don't have one (for retroactive assignment)
                        if (!data.username) {
                            let newUsername = userService.generateRandomUsername();
                            // Ensure it's unique (highly likely it is, but just in case)
                            let isTaken = await userService.isUsernameTaken(newUsername);
                            while (isTaken) {
                                newUsername = userService.generateRandomUsername();
                                isTaken = await userService.isUsernameTaken(newUsername);
                            }
                            updatedData.username = newUsername;
                            await setDoc(userRef, { username: newUsername }, { merge: true });
                        }

                        // If they are a main_admin by email now, but had a different role before, upgrade them
                        if (userRole === 'main_admin' && updatedData.role !== 'main_admin') {
                            updatedData.role = 'main_admin';
                            await setDoc(userRef, { role: 'main_admin' }, { merge: true });
                        } else if (userRole === 'admin' && updatedData.role !== 'admin' && updatedData.role !== 'higher_admin' && updatedData.role !== 'main_admin') {
                            updatedData.role = 'admin';
                            await setDoc(userRef, { role: 'admin' }, { merge: true });
                        }
                        
                        setProfile(updatedData);
                    } else {
                        // Create new user profile
                        let newUsername = userService.generateRandomUsername();
                        let isTaken = await userService.isUsernameTaken(newUsername);
                        while (isTaken) {
                            newUsername = userService.generateRandomUsername();
                            isTaken = await userService.isUsernameTaken(newUsername);
                        }

                        const newProfile: UserProfile = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            photoURL: currentUser.photoURL,
                            username: newUsername,
                            bio: "",
                            role: userRole,
                            whatsappNumber: null,
                            wishlist: [],
                            createdAt: Date.now(),
                            hasCompletedOnboarding: false
                        };

                        await setDoc(userRef, newProfile);
                        setProfile(newProfile);
                    }
                } catch (error) {
                    console.error("Failed to fetch or create user profile in Firestore. Check your Firestore rules or network.", error);
                    // Provide a local fallback profile so the user is not completely blocked
                    setProfile({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        role: isMainAdmin(currentUser.email) ? 'main_admin' : isAutoAdmin(currentUser.email) ? 'admin' : 'user',
                        createdAt: Date.now()
                    });
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user || !profile) return;
        try {
            // Update Firestore doc
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, data, { merge: true });

            // Update Firebase Auth user if display name or photoURL are changing
            const authUpdates: Record<string, string | null> = {};
            if (data.displayName !== undefined) authUpdates.displayName = data.displayName;
            if (data.photoURL !== undefined) authUpdates.photoURL = data.photoURL;

            if (Object.keys(authUpdates).length > 0) {
                await updateFirebaseAuthProfile(user, authUpdates);
                // Also trigger a user state update so components re-render immediately
                setUser({ ...user, ...authUpdates } as FirebaseUser);
            }

            setProfile({ ...profile, ...data });
        } catch (error) {
            console.error("Failed to update profile", error);
            throw error;
        }
    };

    const toggleWishlist = async (listingId: string) => {
        if (!user || !profile) return;
        try {
            const currentWishlist = profile.wishlist || [];
            const isWishlisted = currentWishlist.includes(listingId);

            let newWishlist;
            if (isWishlisted) {
                newWishlist = currentWishlist.filter(id => id !== listingId);
            } else {
                newWishlist = [...currentWishlist, listingId];
            }

            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { wishlist: newWishlist }, { merge: true });

            setProfile({ ...profile, wishlist: newWishlist });
        } catch (error) {
            console.error("Failed to toggle wishlist", error);
            throw error;
        }
    };

    const isAdmin = profile?.role === 'admin' || profile?.role === 'higher_admin' || profile?.role === 'main_admin';
    const isSeller = profile?.role === 'admin' || profile?.role === 'higher_admin' || profile?.role === 'main_admin' || profile?.role === 'trusted_seller' || profile?.role === 'seller';

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, updateProfile, isAdmin, isSeller, toggleWishlist }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
