import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listingService } from '../services/listingService';
import AccountCard, { type AccountData } from '../components/AccountCard';

export default function Wishlist() {
    const { profile, loading: authLoading } = useAuth();
    const [wishlistAccounts, setWishlistAccounts] = useState<AccountData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!profile?.wishlist || profile.wishlist.length === 0) {
                setWishlistAccounts([]);
                setLoading(false);
                return;
            }

            try {
                // Fetch all active listings
                // In a massive app we'd do a chunky `where('id', 'in', wishlist)` query, 
                // but since active listings are cached and relatively small, we can filter locally or fetch by ID

                // Firestore doesn't support 'in' queries with >10 items easily without chunking.
                // For simplicity here, we'll fetch them individually or use what we get from getActiveListings.
                const allListings = await listingService.getActiveListings();

                const myWishlistItems = allListings.filter(listing => profile.wishlist?.includes(listing.id));
                setWishlistAccounts(myWishlistItems);
            } catch (error) {
                console.error("Failed to load wishlist", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchWishlist();
        }
    }, [profile?.wishlist, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gaming-accent animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="pt-24 min-h-[70vh] flex flex-col items-center justify-center px-4">
                <Heart className="w-16 h-16 text-gaming-700 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Sign in to view Wishlist</h2>
                <p className="text-gaming-muted text-center max-w-sm">
                    You need to be logged in to save and manage your favorite accounts.
                </p>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-16 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/30">
                        <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-heading font-extrabold text-white">My Wishlist</h1>
                        <p className="text-gaming-muted">{wishlistAccounts.length} saved accounts</p>
                    </div>
                </div>

                {wishlistAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistAccounts.map((account, index) => (
                            <AccountCard
                                key={account.id}
                                account={account}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gaming-800/30 border border-white/5 rounded-2xl p-12 text-center mt-8"
                    >
                        <Heart className="w-16 h-16 text-gaming-700 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h3>
                        <p className="text-gaming-muted mb-6">
                            Start exploring the marketplace and click the heart icon to save accounts you like.
                        </p>
                        <a href="/shop" className="btn-primary inline-flex">Explore Market</a>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
