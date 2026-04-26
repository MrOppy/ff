import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Heart, ThumbsUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { reviewService, type SellerReview } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import StarRating from './StarRating';

export interface AccountData {
    id: string;
    title: string;
    price: string;
    likes: number;
    level: number;
    image: string;
    seller: string;
    sellerId?: string;
    sellerUsername?: string;
    sellerPhoto?: string | null;
    tags: string[];
    featured?: boolean;
    // Base fields moved up from NewListingData if we want them guaranteed during reads, 
    // but typically they are appended later. We'll add them as optional here for type safety:
    status?: 'active' | 'sold' | 'pending_review';
    description?: string;
    totalVault?: string;
    accountAge?: string;
    maxEvosCount?: number;
    primeLevel?: number;
    videoUrl?: string;
    server?: string;
    evoGuns?: { name: string, level: string }[];
    imageGallery?: string[];
    _searchScore?: number;
    createdAt?: { toMillis?: () => number } | unknown;
    lastBumpedAt?: { toMillis?: () => number } | unknown;
    isFeatured?: boolean;
}

interface AccountCardProps {
    account: AccountData;
    index?: number;
    onDelete?: (id: string, e: React.MouseEvent) => void;
    onStatusChange?: (id: string, currentStatus: string, e: React.MouseEvent) => void;
    onEdit?: (id: string, e: React.MouseEvent) => void;
    onBump?: (id: string, e: React.MouseEvent) => void;
}

export default function AccountCard({ account, index = 0, onDelete, onStatusChange, onEdit, onBump }: AccountCardProps) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { profile, toggleWishlist } = useAuth();
    const [sellerRating, setSellerRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);

    const isWishlisted = profile?.wishlist?.includes(account.id) || false;

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!profile) {
            alert("Please sign in to save accounts to your wishlist.");
            return;
        }
        try {
            await toggleWishlist(account.id);
        } catch (error) {
            console.error("Error toggling wishlist", error);
        }
    };

    useEffect(() => {
        async function fetchRating() {
            if (!account.seller) return;
            try {
                const reviews = await reviewService.getReviewsForSeller(account.seller);
                if (reviews.length > 0) {
                    const avg = reviews.reduce((acc: number, r: SellerReview) => acc + r.rating, 0) / reviews.length;
                    setSellerRating(avg);
                    setReviewCount(reviews.length);
                }
            } catch (error) {
                console.error("Failed to fetch card rating", error);
            }
        }
        fetchRating();
    }, [account.seller]);

    // Format bump time safely
    const formatBumpTime = () => {
        if (!account.lastBumpedAt) return null;
        try {
            const time = (account.lastBumpedAt as any).toMillis?.() || (account.lastBumpedAt as any).seconds * 1000 || null;
            if (!time) return null;
            
            const diffMs = Date.now() - time;
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 60) return `${diffMins}m ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            return `${Math.floor(diffHours / 24)}d ago`;
        } catch (e) {
            return null;
        }
    };

    const bumpStr = formatBumpTime();

    const formatListDate = () => {
        if (!account.createdAt) return null;
        try {
            const dateValue = (account.createdAt as any).toDate ? (account.createdAt as any).toDate() : new Date(account.createdAt as any);
            return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(dateValue);
        } catch (e) {
            return null;
        }
    };
    const listDateStr = formatListDate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
            className={`glass-card flex flex-col group cursor-pointer relative overflow-hidden ring-1 ring-white/5 hover:ring-gaming-accent/50 ${account.status === 'sold' ? 'grayscale opacity-75 hover:opacity-100 hover:grayscale-0 transition-all duration-300' : ''
                }`}
            onClick={() => navigate(`/account/${account.id}`)}
        >
            {/* Hover Glare Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30 transform translate-x-[-100%] group-hover:translate-x-[100%]" />
            {/* Card Image */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gaming-900 to-transparent z-10 opacity-60" />
                <img src={account.image} alt={account.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />

                {/* Sold Overlay */}
                {account.status === 'sold' && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                        <span className="text-white text-3xl font-extrabold tracking-widest bg-red-600/90 px-6 py-2 rounded-xl rotate-[-15deg] border-4 border-red-500 shadow-2xl">
                            SOLD
                        </span>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistClick}
                    className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all ${isWishlisted ? 'bg-pink-500/20 text-pink-500' : 'bg-black/20 text-white hover:bg-black/40 hover:text-pink-400'}`}
                >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-pink-500' : ''}`} />
                </button>                {/* Status/Price Tag */}
                <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 items-end">
                    {account.status && account.status !== 'active' && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase shadow ${account.status === 'sold' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {account.status.replace('_', ' ')}
                        </span>
                    )}
                    <span className="px-3 py-1 bg-gaming-accent text-white font-bold rounded shadow-lg text-lg">
                        {account.price}
                    </span>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="font-heading font-bold text-xl text-white mb-3 group-hover:text-gaming-accent transition-colors line-clamp-2">
                    {account.title}
                </h3>

                {/* Tags moved to card body */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {account.featured && (
                        <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded text-xs font-bold text-indigo-400">
                            ★ FEATURED
                        </span>
                    )}

                    {account.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gaming-800 border border-gaming-700 rounded text-xs text-gaming-muted">
                            {tag}
                        </span>
                    ))}
                    {account.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gaming-800 border border-gaming-700 rounded text-xs text-gaming-muted">
                            +{account.tags.length - 3}
                        </span>
                    )}
                </div>

                <div className="mt-auto flex flex-col">
                    <div className="flex items-center justify-between text-sm text-gaming-muted mb-3">
                        <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" /> LVL {account.level}
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4 text-pink-500" /> {account.likes} Likes
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-1 font-medium min-h-[36px] justify-end mb-4">
                        {listDateStr && (
                            <div className="text-[11px] text-gaming-muted/80 flex items-center gap-1.5 uppercase tracking-wide">
                                <Calendar className="w-3 h-3 text-gaming-muted/60" /> Listed: {listDateStr}
                            </div>
                        )}
                        {bumpStr && (
                            <div className="text-[11px] text-emerald-500/80 flex items-center gap-1.5 uppercase tracking-wide">
                                <ArrowRight className="w-3 h-3 -rotate-45" /> Bumped: {bumpStr}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gaming-700 flex flex-wrap items-center justify-between gap-y-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/seller/${account.sellerUsername || account.sellerId || account.seller}`); }}
                        className="flex shrink-0 items-center gap-2 hover:bg-gaming-800 p-1.5 -ml-1.5 rounded-lg transition-colors group/seller"
                    >
                        <div className="w-8 h-8 rounded-full bg-gaming-700 group-hover/seller:bg-gaming-600 flex items-center justify-center text-xs font-bold text-white transition-colors overflow-hidden border border-gaming-600">
                            {account.sellerPhoto ? (
                                <img src={account.sellerPhoto} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                                account.seller.charAt(0)
                            )}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm text-gray-300 group-hover/seller:text-white transition-colors">
                                {account.seller.length > 12 ? account.seller.substring(0, 12) + '...' : account.seller}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                                {sellerRating !== null ? (
                                    <StarRating rating={sellerRating} />
                                ) : (
                                    <span className="text-xs font-bold text-white">New Seller</span>
                                )}
                                <span className="text-[10px] text-gaming-muted">({reviewCount})</span>
                            </div>
                        </div>
                    </button>
                    <div className="flex flex-wrap shrink items-center justify-end gap-1.5">
                        {onEdit && (
                            <button onClick={(e) => { e.stopPropagation(); onEdit(account.id, e); }} className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-bold bg-blue-500/10 px-2 py-1.5 rounded border border-transparent hover:border-blue-500/50">Edit</button>
                        )}
                        {onBump && (
                            <button onClick={(e) => { e.stopPropagation(); onBump(account.id, e); }} className="text-emerald-400 hover:text-emerald-300 transition-colors text-xs font-bold bg-emerald-500/10 px-2 py-1.5 rounded border border-transparent hover:border-emerald-500/50">Bump</button>
                        )}
                        {onStatusChange && (
                            <button onClick={(e) => { e.stopPropagation(); onStatusChange(account.id, account.status || 'active', e); }} className="text-amber-400 hover:text-amber-300 transition-colors text-xs font-bold bg-amber-500/10 px-2 py-1.5 rounded border border-transparent hover:border-amber-500/50">
                                {account.status === 'sold' ? 'Mark Active' : 'Mark Sold'}
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={(e) => { e.stopPropagation(); onDelete(account.id, e); }} className="text-red-400 hover:text-red-300 transition-colors text-xs font-bold bg-red-500/10 px-2 py-1.5 rounded border border-transparent hover:border-red-500/50">Delete</button>
                        )}
                        {!onDelete && !onStatusChange && !onEdit && !onBump && (
                            <button className="text-gaming-accent hover:text-white transition-colors text-sm font-bold flex items-center gap-1 pl-2">
                                {t['card_details']} <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                </div>
            </div>
        </motion.div>
    );
}
