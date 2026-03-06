import { useParams } from 'react-router-dom';
import { ShieldCheck, Package, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';

import { listingService } from '../services/listingService';
import AccountCard, { type AccountData } from '../components/AccountCard';
import AdminReviewsSection from '../components/AdminReviewsSection';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { userService } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';

export default function SellerProfile() {
    const { sellerName } = useParams<{ sellerName: string }>();
    const { t } = useLanguage();
    const [listings, setListings] = useState<AccountData[]>([]);
    const [sellerRole, setSellerRole] = useState<'seller' | 'trusted_seller' | 'admin' | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!sellerName) return;
            try {
                // Now sellerName in the URL actually refers to the username
                const userInfo = await userService.getUserByUsername(sellerName);
                let uidStr = '';

                if (userInfo) {
                    setUserData(userInfo);
                    setSellerRole(userInfo.role);
                    uidStr = userInfo.uid;
                } else {
                    // Fallback to searching by old display name format for legacy compatibility
                    const q = query(collection(db, 'users'), where('displayName', '==', sellerName));
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        const data = snap.docs[0].data();
                        setUserData(data);
                        setSellerRole(data.role || 'seller');
                        uidStr = snap.docs[0].id;
                    } else {
                        setSellerRole('seller');
                    }
                }

                if (uidStr) {
                    const data = await listingService.getListingsBySellerId(uidStr);
                    if (data && data.length > 0) {
                        // AUTO-HEAL: If the listing has an outdated seller name, silently correct it across the DB
                        const needsHeal = data.some(listing => listing.seller !== (userInfo.displayName || sellerName) || (listing.sellerPhoto || '') !== (userInfo.photoURL || ''));

                        if (needsHeal) {
                            try {
                                await listingService.updateListingsProfile(uidStr, userInfo.displayName || sellerName, userInfo.photoURL || '');
                                // Swap out state locally so user sees update instantly
                                const healedData = data.map(l => ({ ...l, seller: userInfo.displayName || sellerName, sellerPhoto: userInfo.photoURL || '' }));
                                setListings(healedData);
                            } catch (err) {
                                console.error("Background auto-heal failed:", err);
                                setListings(data);
                            }
                        } else {
                            setListings(data);
                        }
                    } else {
                        setListings([]);
                    }
                } else {
                    // Fallback to generic fetch if user document wasn't found at all
                    const oldData = await listingService.getListingsBySeller(sellerName);
                    if (oldData) {
                        setListings(oldData);
                    }
                }

            } catch (err) {
                console.error("Error fetching seller profile info", err);
                setSellerRole('seller');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [sellerName]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="w-12 h-12 text-gaming-accent animate-spin" /></div>;
    }

    if (!sellerName) return <div className="pt-32 text-center text-white text-2xl">Seller not found</div>;

    const displayListings = listings.filter(l => l.status === 'active' || l.status === 'sold' || !l.status);

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Warning Banners */}
                {userData?.isBanned && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-center text-sm">
                        <ShieldAlert className="w-5 h-5 shrink-0" /> This user has been permanently banned
                    </div>
                )}
                {userData?.isScammer && (
                    <div className="bg-amber-500/10 border border-amber-500 text-amber-500 p-4 rounded-xl mb-6 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-center text-sm">
                        <ShieldAlert className="w-5 h-5 shrink-0" /> Warning: This user has been flagged as a scammer
                    </div>
                )}

                {/* Seller Header */}
                <div className="bg-gaming-800 border border-gaming-700 rounded-2xl p-8 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-500/20 to-gaming-accent/20" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full border-4 border-gaming-800 bg-gaming-700 flex items-center justify-center text-5xl font-bold text-white shadow-xl flex-shrink-0 overflow-hidden">
                            {userData?.photoURL ? (
                                <img src={userData.photoURL} alt={sellerName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                                sellerName.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* Seller Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-heading font-extrabold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                                {userData?.displayName || sellerName} <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            </h1>
                            {/* Role Badge & Reviews */}
                            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 mb-6">
                                {sellerRole === 'admin' && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/50 rounded-full text-pink-400 font-bold text-sm shadow-[0_0_10px_rgba(236,72,153,0.2)]">
                                        <ShieldAlert className="w-4 h-4" /> Admin
                                    </div>
                                )}
                                {sellerRole === 'trusted_seller' && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/50 rounded-full text-blue-400 font-bold text-sm shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                        <ShieldCheck className="w-4 h-4" /> Trusted Seller
                                    </div>
                                )}
                                {sellerRole === 'seller' && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-bold text-sm">
                                        <CheckCircle2 className="w-4 h-4" /> Seller
                                    </div>
                                )}
                                <AdminReviewsSection sellerId={sellerName} />
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                <div className="bg-gaming-900 border border-gaming-700 px-4 py-2 rounded-lg flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gaming-accent" />
                                    <span className="text-sm font-bold text-white">{displayListings.length} {t['profile_all_listings'] || 'All Listings'}</span>
                                </div>
                            </div>


                        </div>

                        {/* Contact CTA */}
                        <div className="flex-shrink-0 w-full md:w-auto">
                            <button onClick={() => window.open(`https://wa.me/8801764696964?text=${encodeURIComponent('Hi Admin, I want to talk to the seller: ' + sellerName)}`, '_blank')} className="w-full btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                                Message Seller via Admin
                            </button>
                        </div>
                    </div>
                </div>



                {/* Seller Listings */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="w-6 h-6 text-gaming-accent" /> {t['profile_all_listings'] || 'All Listings'} ({displayListings.length})
                    </h2>
                </div>

                {displayListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayListings.map((account, index) => (
                            <AccountCard key={account.id} account={account} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gaming-800/50 rounded-2xl border border-gaming-700">
                        <Package className="w-16 h-16 text-gaming-muted mx-auto mb-4 opacity-50" />
                        <h3 className="text-2xl font-bold text-white mb-2">No listings</h3>
                        <p className="text-gaming-muted">This seller currently has no items for sale.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
