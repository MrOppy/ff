import { useParams } from 'react-router-dom';
import { ShieldCheck, Package, CircleCheck as CheckCircle2, Loader as Loader2, ShieldAlert, Calendar, Store, Activity, BadgeCheck } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    const activeCount = displayListings.filter(l => l.status === 'active' || !l.status).length;
    const soldCount = displayListings.filter(l => l.status === 'sold').length;

    const memberSince = (() => {
        const raw = userData?.createdAt;
        if (!raw) return null;
        try {
            const d = raw?.toDate ? raw.toDate() : new Date(raw);
            if (isNaN(d.getTime())) return null;
            const month = d.toLocaleDateString(undefined, { month: 'short' });
            const yearShort = String(d.getFullYear()).slice(-2);
            return `${month} '${yearShort}`;
        } catch {
            return null;
        }
    })();

    const roleBadge = (() => {
        if (sellerRole === 'admin') {
            return { icon: ShieldAlert, label: 'Admin', cls: 'bg-pink-500/10 border-pink-500/50 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.25)]' };
        }
        if (sellerRole === 'trusted_seller') {
            return { icon: BadgeCheck, label: 'Trusted Seller', cls: 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)]' };
        }
        return { icon: CheckCircle2, label: 'Seller', cls: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' };
    })();
    const RoleIcon = roleBadge.icon;

    return (
        <div className="pt-20 sm:pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

                {/* Warning Banners */}
                {userData?.isBanned && (
                    <div className="bg-red-500/10 border border-red-500/60 text-red-400 p-3 rounded-lg mb-3 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-center text-xs sm:text-sm">
                        <ShieldAlert className="w-4 h-4 shrink-0" /> This user has been permanently banned
                    </div>
                )}
                {userData?.isScammer && (
                    <div className="bg-amber-500/10 border border-amber-500/60 text-amber-400 p-3 rounded-lg mb-3 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-center text-xs sm:text-sm">
                        <ShieldAlert className="w-4 h-4 shrink-0" /> Warning: This user has been flagged as a scammer
                    </div>
                )}

                {/* Seller Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="relative overflow-hidden rounded-2xl border border-gaming-700/60 bg-gradient-to-b from-gaming-800 to-gaming-800/60 mb-5 sm:mb-8"
                >
                    {/* Cover */}
                    <div className="relative h-20 sm:h-36 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-gaming-accent/20 to-gaming-900" />
                        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.5),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.35),transparent_45%)]" />
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-gaming-800" />
                    </div>

                    {/* Profile body */}
                    <div className="relative px-4 sm:px-8 pb-5 sm:pb-7 -mt-12 sm:-mt-16">
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4 sm:gap-6">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-gaming-800 bg-gaming-700 flex items-center justify-center text-3xl sm:text-5xl font-bold text-white shadow-xl overflow-hidden ring-2 ring-gaming-accent/30">
                                    {userData?.photoURL ? (
                                        <img src={userData.photoURL} alt={sellerName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    ) : (
                                        sellerName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                {(sellerRole === 'admin' || sellerRole === 'trusted_seller') && (
                                    <div className="absolute -bottom-1.5 -right-1.5 bg-gaming-900 rounded-full p-1 border-2 border-gaming-800 shadow-lg">
                                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center lg:text-left lg:pb-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start gap-2 mb-1.5">
                                    <h1 className="text-xl sm:text-3xl font-heading font-extrabold text-white tracking-tight truncate">
                                        {userData?.displayName || sellerName}
                                    </h1>
                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider self-center ${roleBadge.cls}`}>
                                        <RoleIcon className="w-3 h-3" /> {roleBadge.label}
                                    </div>
                                </div>
                                {userData?.username && (
                                    <p className="text-gaming-muted text-xs sm:text-sm mb-2 sm:mb-3 font-mono">@{userData.username}</p>
                                )}
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                    <AdminReviewsSection sellerId={sellerName} />
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex-shrink-0 w-full lg:w-auto">
                                <button
                                    onClick={() => window.open(`https://wa.me/8801764696964?text=${encodeURIComponent('Hi Admin, I want to talk to the seller: ' + sellerName)}`, '_blank')}
                                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-[0_6px_18px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5"
                                >
                                    <WhatsAppIcon className="w-4 h-4" />
                                    Message via Admin
                                </button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
                            <div className="bg-gaming-900/70 border border-gaming-700/60 rounded-lg p-2.5 sm:p-3.5 hover:border-gaming-accent/40 transition-colors">
                                <div className="flex items-center gap-1 text-gaming-muted text-[9px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">
                                    <Package className="w-3 h-3" /> Total
                                </div>
                                <p className="text-base sm:text-2xl font-extrabold text-white">{displayListings.length}</p>
                            </div>
                            <div className="bg-gaming-900/70 border border-gaming-700/60 rounded-lg p-2.5 sm:p-3.5 hover:border-emerald-400/40 transition-colors">
                                <div className="flex items-center gap-1 text-gaming-muted text-[9px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">
                                    <Activity className="w-3 h-3" /> Active
                                </div>
                                <p className="text-base sm:text-2xl font-extrabold text-emerald-400">{activeCount}</p>
                            </div>
                            <div className="bg-gaming-900/70 border border-gaming-700/60 rounded-lg p-2.5 sm:p-3.5 hover:border-blue-400/40 transition-colors">
                                <div className="flex items-center gap-1 text-gaming-muted text-[9px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">
                                    <Store className="w-3 h-3" /> Sold
                                </div>
                                <p className="text-base sm:text-2xl font-extrabold text-blue-400">{soldCount}</p>
                            </div>
                            <div className="bg-gaming-900/70 border border-gaming-700/60 rounded-lg p-2.5 sm:p-3.5 hover:border-gaming-accent/40 transition-colors">
                                <div className="flex items-center gap-1 text-gaming-muted text-[9px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">
                                    <Calendar className="w-3 h-3" /> Joined
                                </div>
                                <p className="text-xs sm:text-base font-bold text-white whitespace-nowrap">{memberSince || '—'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Seller Listings */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gaming-accent" /> {t['profile_all_listings'] || 'All Listings'}
                        <span className="text-gaming-muted text-sm sm:text-base font-medium">({displayListings.length})</span>
                    </h2>
                </div>

                {displayListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {displayListings.map((account, index) => (
                            <AccountCard key={account.id} account={account} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 sm:py-16 bg-gaming-800/40 rounded-2xl border border-dashed border-gaming-700">
                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gaming-900 border border-gaming-700 mb-3 sm:mb-4">
                            <Package className="w-7 h-7 sm:w-10 sm:h-10 text-gaming-muted opacity-60" />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">No listings yet</h3>
                        <p className="text-gaming-muted text-sm">This seller currently has no items for sale.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
