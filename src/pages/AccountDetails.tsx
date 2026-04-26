import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, MessageCircle, Heart, Info, ShieldAlert, Loader as Loader2, User, X, ChevronLeft, ChevronRight, TriangleAlert as AlertTriangle, Globe, Share2, Check, Hash, Play, Maximize2, Crown, Flame, Calendar, Coins, Swords, ThumbsUp, ChevronDown } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { MOCK_ACCOUNTS } from './Shop';
import { useState, useEffect } from 'react';
import { listingService } from '../services/listingService';
import { commentService } from '../services/commentService';
import type { CommentData } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { AccountData } from '../components/AccountCard';
import { reviewService, type SellerReview } from '../services/reviewService';
import StarRating from '../components/StarRating';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { userService } from '../services/userService';

const FALLBACK_DETAILS = {
    description: "Selling my Free Fire account. fully maxed out.",
    images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80"],
    accountAge: "Unknown",
    totalVault: "Unknown",
    maxEvosCount: 0,
    evoGuns: [] as string[]
};

export default function AccountDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user, profile, toggleWishlist, signInWithGoogle } = useAuth();

    const [account, setAccount] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(true);

    const [sellerRating, setSellerRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [sellerWhatsapp, setSellerWhatsapp] = useState<string | null>(null);

    const [comments, setComments] = useState<CommentData[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commenting, setCommenting] = useState(false);

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [replying, setReplying] = useState(false);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [activeImage, setActiveImage] = useState(0);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'comments'>('overview');
    const [evosExpanded, setEvosExpanded] = useState(false);

    const isOwner = Boolean(user && account && user.displayName === account.seller);
    const isWishlisted = Boolean(profile?.wishlist?.includes(id || ''));
    const isAdminUser = profile?.role === 'main_admin' || profile?.role === 'higher_admin' || profile?.role === 'admin';

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!profile || !id) {
            alert("Please sign in to save accounts to your wishlist.");
            return;
        }
        try {
            await toggleWishlist(id);
        } catch (error) {
            console.error("Error toggling wishlist", error);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        async function fetchDetails() {
            try {
                if (!id) return;
                const data = await listingService.getListingById(id);
                if (data) {
                    setAccount(data as AccountData);
                } else {
                    setAccount((MOCK_ACCOUNTS.find(a => a.id === id) || MOCK_ACCOUNTS[0]) as AccountData);
                }

                const currentAccount = data || MOCK_ACCOUNTS.find(a => a.id === id) || MOCK_ACCOUNTS[0];
                const reviewKey = (currentAccount as AccountData)?.seller;
                if (reviewKey) {
                    const reviews = await reviewService.getReviewsForSeller(reviewKey);
                    if (reviews.length > 0) {
                        const avg = reviews.reduce((acc: number, r: SellerReview) => acc + r.rating, 0) / reviews.length;
                        setSellerRating(avg);
                        setReviewCount(reviews.length);
                    }
                    
                    // Fetch seller whatsapp
                    let userInfo = null;
                    if (currentAccount.sellerUsername) {
                        userInfo = await userService.getUserByUsername(currentAccount.sellerUsername);
                    }
                    if (!userInfo) {
                        const q = query(collection(db, 'users'), where('displayName', '==', reviewKey));
                        const snap = await getDocs(q);
                        if (!snap.empty) {
                            userInfo = snap.docs[0].data();
                        }
                    }
                    if (userInfo && userInfo.whatsappNumber) {
                        setSellerWhatsapp(userInfo.whatsappNumber);
                    }
                }

                const fetchedComments = await commentService.getCommentsByListing(id);
                setComments(fetchedComments);
            } catch (err) {
                console.error(err);
                setAccount(MOCK_ACCOUNTS.find(a => a.id === id) || MOCK_ACCOUNTS[0]);
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();
    }, [id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !id) return;
        setCommenting(true);
        try {
            const isSeller = account?.seller === user.displayName;
            const authorRole = profile?.role;
            const newCommentId = await commentService.addComment(
                id, user.uid, user.displayName || 'Anonymous User',
                user.photoURL, newComment, isSeller, authorRole
            );
            const newCommentData: CommentData = {
                id: newCommentId, listingId: id, userId: user.uid,
                userName: user.displayName || 'Anonymous User',
                userPhoto: user.photoURL, text: newComment, createdAt: new Date(),
                isSellerReply: isSeller, authorRole: authorRole
            };
            setComments([...comments, newCommentData]);
            setNewComment('');
        } catch (err) {
            console.error(err);
            alert("Failed to post comment.");
        } finally {
            setCommenting(false);
        }
    };

    const handleReplySubmit = async (e: React.FormEvent, commentId: string) => {
        e.preventDefault();
        if (!user || !account || !replyText.trim()) return;
        setReplying(true);
        try {
            const isSeller = account?.seller === user.displayName;
            const authorRole = profile?.role;
            await commentService.replyToComment(commentId, {
                userId: user.uid, userName: user.displayName || 'Seller',
                userPhoto: user.photoURL, text: replyText.trim(),
                isSellerReply: isSeller,
                authorRole: authorRole
            });
            setReplyText('');
            setReplyingTo(null);
            const commentsData = await commentService.getCommentsByListing(account.id);
            setComments(commentsData);
        } catch (error: any) {
            console.error("Failed to post reply", error);
            alert("Failed to post reply: " + (error.message || 'Unknown error'));
        } finally {
            setReplying(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await commentService.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error: any) {
            console.error('Failed to delete comment', error);
            alert('Failed to delete comment: ' + (error.message || 'Unknown error'));
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDeleteReply = async (commentId: string, reply: any) => {
        if (!window.confirm('Are you sure you want to delete this reply?')) return;
        try {
            await commentService.deleteReply(commentId, reply);
            if (account) {
                const commentsData = await commentService.getCommentsByListing(account.id);
                setComments(commentsData);
            }
        } catch (error: any) {
            console.error('Failed to delete reply', error);
            alert('Failed to delete reply: ' + (error.message || 'Unknown error'));
        }
    };

    const handleBumpListing = async () => {
        if (!account) return;
        try {
            await listingService.bumpListing(account.id);
            alert("Listing bumped successfully! It is now at the top of the shop.");
            const updated = await listingService.getListingById(account.id);
            if (updated) setAccount(updated as AccountData);
        } catch (error) {
            console.error("Failed to bump listing", error);
            alert("Failed to bump listing.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
                <Loader2 className="w-12 h-12 text-gaming-accent animate-spin" />
                <p className="text-gaming-muted text-sm tracking-widest uppercase">Loading...</p>
            </div>
        );
    }

    if (!account) return <div className="pt-32 text-center text-white text-2xl">Account not found</div>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const displayImages = account.imageGallery && account.imageGallery.length > 0 ? account.imageGallery :
        ((account as any).images ? (account as any).images : [account.image || FALLBACK_DETAILS.images[0]]);

    const displayAge = account.accountAge || FALLBACK_DETAILS.accountAge;
    const displayVault = account.totalVault || FALLBACK_DETAILS.totalVault;
    const displayMaxEvosCount = account.maxEvosCount || FALLBACK_DETAILS.maxEvosCount;
    const displayEvos = account.evoGuns || FALLBACK_DETAILS.evoGuns;
    const displayDesc = account.description || FALLBACK_DETAILS.description;
    const displayServer = account.server || 'Unknown';

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        try {
            let date;
            if (timestamp.toDate) {
                date = timestamp.toDate();
            } else if (typeof timestamp === 'string') {
                date = new Date(timestamp);
            } else if (timestamp.seconds) {
                date = new Date(timestamp.seconds * 1000);
            } else {
                date = new Date(timestamp);
            }
            return new Intl.DateTimeFormat(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch {
            return '';
        }
    };

    const formatListDate = (timestamp: any) => {
        if (!timestamp) return null;
        try {
            let date;
            if (timestamp.toDate) {
                date = timestamp.toDate();
            } else if (timestamp.seconds) {
                date = new Date(timestamp.seconds * 1000);
            } else {
                date = new Date(timestamp);
            }
            return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
        } catch (error) {
            return null;
        }
    };
    const listDateStr = formatListDate(account.createdAt);

    const handleBuyNow = () => {
        if (!sellerWhatsapp) {
            alert("This seller hasn't added their WhatsApp number yet.");
            return;
        }
        const text = `Hi, I'm interested in buying this account:\n\n*ID*: ${account.id}\n*Title*: ${account.title}\n*Price*: ${account.price}\n*Link*: ${window.location.href}`;
        const whatsappUrl = `https://wa.me/${sellerWhatsapp}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }
        if (url.includes('streamable.com')) {
            const videoId = url.split('streamable.com/')[1]?.split('/')[0];
            return videoId ? `https://streamable.com/e/${videoId}` : null;
        }
        return null;
    };
    const embedUrl = account.videoUrl ? getEmbedUrl(account.videoUrl) : null;

    const stats = [
        { label: 'Level', value: account.level, icon: Crown, accent: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Prime Lvl', value: account.primeLevel || 0, icon: Flame, accent: 'text-orange-400', bg: 'bg-orange-500/10' },
        { label: 'Likes', value: account.likes || 0, icon: ThumbsUp, accent: 'text-rose-400', bg: 'bg-rose-500/10' },
        { label: 'Vault', value: displayVault, icon: Coins, accent: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Max Evos', value: displayMaxEvosCount, icon: Swords, accent: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Age', value: `${displayAge}y`, icon: Calendar, accent: 'text-sky-400', bg: 'bg-sky-500/10' },
    ];

    return (
        <div className="pt-28 sm:pt-32 pb-28 md:pb-10 min-h-screen relative bg-gaming-950">
            <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-7">

                {/* Top toolbar */}
                <div className="flex items-center justify-between mb-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gaming-muted hover:text-white transition-colors text-sm font-medium group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span>{t['details_back_to_shop']}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleShare}
                            className="px-3 h-8 rounded-full bg-gaming-800 border border-gaming-700 flex items-center gap-1.5 text-xs font-medium text-gaming-muted hover:text-white hover:border-gaming-500 transition-all"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
                        </button>
                    </div>
                </div>

                {/* HERO STAGE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl overflow-hidden border border-gaming-700/80 bg-gaming-900 shadow-xl shadow-black/40 mb-4"
                >
                    {/* Hero image */}
                    <div className="relative aspect-[16/10] sm:aspect-[21/9] cursor-zoom-in group" onClick={() => { setLightboxIndex(activeImage); setLightboxOpen(true); }}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImage}
                                src={displayImages[activeImage]}
                                alt={account.title}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        {/* Status badge */}
                        {account.status === 'sold' && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-lg shadow-red-500/40 flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" /> Sold
                            </div>
                        )}

                        {/* Image counter */}
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                            <Maximize2 className="w-3 h-3" /> {activeImage + 1} / {displayImages.length}
                        </div>

                        {/* Nav arrows */}
                        {displayImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === 0 ? displayImages.length - 1 : prev - 1); }}
                                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === displayImages.length - 1 ? 0 : prev + 1); }}
                                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {displayImages.length > 1 && (
                        <div className="bg-gaming-900/80 backdrop-blur-md border-t border-gaming-700/80 p-2 flex gap-2 overflow-x-auto custom-scrollbar">
                            {displayImages.map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                                        activeImage === i
                                            ? 'ring-2 ring-gaming-accent ring-offset-2 ring-offset-gaming-900'
                                            : 'opacity-50 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* TITLE BLOCK — outside the hero image */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-4"
                >
                    {account.tags && account.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {account.tags.slice(0, 4).map((tag: string) => (
                                <span key={tag} className="px-2 py-0.5 bg-gaming-accent/10 border border-gaming-accent/30 rounded text-[10px] font-bold text-gaming-accent uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <h1 className="text-xl sm:text-3xl lg:text-4xl font-heading font-black text-white leading-[1.15] tracking-tight">
                        {account.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-gaming-muted">
                        <span className="flex items-center gap-1 font-mono">
                            <Hash className="w-3 h-3" />{account.id}
                        </span>
                        {listDateStr && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Listed on {listDateStr}
                                </span>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* SELLER CARD (mobile only) */}
                <button
                    onClick={() => navigate(`/seller/${account.sellerUsername || account.sellerId || account.seller}`)}
                    className="md:hidden w-full flex items-center gap-3 p-3 mb-4 rounded-2xl bg-gaming-800/50 border border-gaming-700/80 hover:border-gaming-accent/40 transition-all group"
                >
                    <div className="relative w-11 h-11 flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gaming-700 flex items-center justify-center text-white font-bold overflow-hidden border border-gaming-600">
                            {account.sellerPhoto ? (
                                <img src={account.sellerPhoto} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : account.seller.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gaming-800 flex items-center justify-center z-10">
                            <ShieldCheck className="w-2 h-2 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-[9px] uppercase tracking-wider text-gaming-muted font-bold">Seller</p>
                        <p className="text-white font-bold text-sm truncate group-hover:text-gaming-accent transition-colors">{account.seller}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            {sellerRating !== null ? (
                                <>
                                    <StarRating rating={sellerRating} />
                                    <span className="text-[9px] text-gaming-muted">({reviewCount})</span>
                                </>
                            ) : (
                                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">New Seller</span>
                            )}
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gaming-muted group-hover:text-gaming-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>

                {/* PRICE & ACTION BAR (desktop only) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="hidden md:flex items-center justify-between gap-4 bg-gradient-to-r from-gaming-800/70 via-gaming-800/40 to-gaming-800/70 border border-gaming-700/80 rounded-2xl p-3.5 mb-4 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-gaming-muted font-bold mb-0.5">Price</p>
                            <h2 className="text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-gaming-accent leading-none">
                                {account.price}
                            </h2>
                        </div>

                        <div className="h-10 w-px bg-gaming-700" />

                        <button
                            onClick={() => navigate(`/seller/${account.sellerUsername || account.sellerId || account.seller}`)}
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="relative w-10 h-10">
                                <div className="w-10 h-10 rounded-full bg-gaming-700 flex items-center justify-center text-white font-bold overflow-hidden border border-gaming-600">
                                    {account.sellerPhoto ? (
                                        <img src={account.sellerPhoto} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    ) : account.seller.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gaming-800 flex items-center justify-center z-10">
                                    <ShieldCheck className="w-2 h-2 text-white" />
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] uppercase tracking-wider text-gaming-muted font-bold">Seller</p>
                                <p className="text-white font-bold text-xs group-hover:text-gaming-accent transition-colors">{account.seller}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {sellerRating !== null ? (
                                        <>
                                            <StarRating rating={sellerRating} />
                                            <span className="text-[9px] text-gaming-muted">({reviewCount})</span>
                                        </>
                                    ) : (
                                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">New Seller</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleWishlistClick}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                                isWishlisted
                                    ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                                    : 'bg-gaming-800 border-gaming-700 text-gray-400 hover:text-rose-400 hover:border-rose-500/50'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
                        </button>
                        {account.status === 'sold' ? (
                            <div className="bg-red-500/10 border border-red-500/40 text-red-400 font-black px-6 h-10 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                <AlertTriangle className="w-3.5 h-3.5" /> Sold Out
                            </div>
                        ) : (
                            <button
                                onClick={handleBuyNow}
                                disabled={!sellerWhatsapp}
                                className={`relative ${sellerWhatsapp ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-[0_6px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_30px_rgba(16,185,129,0.45)]' : 'bg-gaming-700 text-gaming-muted opacity-50 cursor-not-allowed'} font-bold px-6 h-10 rounded-xl transition-all flex items-center justify-center gap-2 text-xs active:scale-[0.98] overflow-hidden group`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                <WhatsAppIcon className="w-3.5 h-3.5 relative" />
                                <span className="relative tracking-wide">{sellerWhatsapp ? t['details_buy_btn'] || 'Contact Seller' : "No WhatsApp"}</span>
                            </button>
                        )}
                    </div>
                </motion.div>

                {isOwner && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-gaming-800/40 border border-gaming-700/80 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Owner Controls</p>
                                <p className="text-[10px] text-gaming-muted">Manage your listing</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={() => navigate(`/edit-listing/${id}`)} className="btn-secondary text-blue-400 hover:text-blue-300 border-blue-900/50 hover:bg-blue-900/20 text-xs py-2">
                                Edit
                            </button>
                            <button onClick={handleBumpListing} className="btn-secondary text-emerald-400 hover:text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/20 text-xs py-2 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                Bump
                            </button>
                            <button 
                                onClick={async () => {
                                    if (window.confirm("Are you sure you want to completely DELETE this listing?")) {
                                        await listingService.deleteListing(id || '');
                                        navigate('/profile');
                                    }
                                }} 
                                className="btn-secondary text-red-400 hover:text-red-300 border-red-900/50 hover:bg-red-900/20 text-xs py-2"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* TABS */}
                <div className="flex items-center gap-1 mb-4 bg-gaming-800/40 border border-gaming-700/80 p-1 rounded-xl w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'overview'
                                ? 'bg-gaming-accent text-gaming-950 shadow-md'
                                : 'text-gaming-muted hover:text-white'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'comments'
                                ? 'bg-gaming-accent text-gaming-950 shadow-md'
                                : 'text-gaming-muted hover:text-white'
                        }`}
                    >
                        Comments
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                            activeTab === 'comments' ? 'bg-gaming-950 text-gaming-accent' : 'bg-gaming-700 text-white'
                        }`}>
                            {comments.length}
                        </span>
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3.5"
                        >
                            {/* CAUTION — placed near the top */}
                            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-400 text-xs mb-0.5">{t['details_caution']}</h4>
                                    <p className="text-amber-100/80 text-xs leading-relaxed">{t['details_caution_text']}</p>
                                </div>
                            </div>

                            {/* BENTO GRID */}
                            <div className="grid grid-cols-12 gap-3">
                                {/* Region card */}
                                <div className="col-span-12 sm:col-span-6 lg:col-span-4 relative bg-gradient-to-br from-cyan-500/15 via-gaming-800/60 to-gaming-900/80 border border-cyan-500/20 rounded-2xl p-4 overflow-hidden">
                                    <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl" />
                                    <Globe className="w-5 h-5 text-cyan-400 mb-2 relative" />
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-gaming-muted font-bold mb-1 relative">Region / Server</p>
                                    <p className="text-xl sm:text-2xl font-black text-white leading-tight relative">{displayServer}</p>
                                </div>

                                {/* Notes card */}
                                <div className="col-span-12 sm:col-span-6 lg:col-span-8 bg-gaming-800/40 border border-gaming-700/80 rounded-2xl p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-md bg-gaming-accent/15 border border-gaming-accent/30 flex items-center justify-center">
                                            <Info className="w-3 h-3 text-gaming-accent" />
                                        </div>
                                        <h4 className="font-bold text-white text-sm">Seller Notes</h4>
                                    </div>
                                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                        {displayDesc}
                                    </p>
                                </div>

                                {/* Stat strip */}
                                <div className="col-span-12">
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {stats.map((stat) => {
                                            const Icon = stat.icon;
                                            return (
                                                <div
                                                    key={stat.label}
                                                    className="relative bg-gaming-800/40 border border-gaming-700/80 rounded-xl p-2.5 sm:p-3 overflow-hidden hover:border-gaming-500 transition-colors"
                                                >
                                                    <div className={`w-6 h-6 rounded-md ${stat.bg} flex items-center justify-center mb-1.5`}>
                                                        <Icon className={`w-3 h-3 ${stat.accent}`} />
                                                    </div>
                                                    <p className="text-[9px] uppercase tracking-wider text-gaming-muted font-bold mb-0 truncate">{stat.label}</p>
                                                    <p className={`font-black text-sm sm:text-lg ${stat.accent} leading-tight truncate`}>{stat.value}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Evo guns */}
                                {displayEvos.length > 0 && (
                                    <div className="col-span-12 bg-gaming-800/40 border border-gaming-700/80 rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                                                    <Swords className="w-3 h-3 text-emerald-400" />
                                                </div>
                                                <h4 className="font-bold text-white text-sm">Featured Evo Guns</h4>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                                                {displayEvos.length}
                                            </span>
                                        </div>
                                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 ${
                                            !evosExpanded && displayEvos.length > 6 ? 'max-h-[170px] overflow-hidden relative' : ''
                                        }`}>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {displayEvos.map((gun: any, idx: number) => (
                                                <div key={idx} className="bg-gaming-900/50 border border-gaming-700/60 rounded-lg px-2.5 py-2 flex items-center justify-between gap-2 hover:border-emerald-500/40 transition-colors">
                                                    <span className="text-white font-medium text-xs truncate">{gun.name}</span>
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded uppercase tracking-wider flex-shrink-0">{gun.level}</span>
                                                </div>
                                            ))}
                                            {!evosExpanded && displayEvos.length > 6 && (
                                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gaming-800 to-transparent pointer-events-none rounded-b-2xl" />
                                            )}
                                        </div>
                                        {displayEvos.length > 6 && (
                                            <button
                                                onClick={() => setEvosExpanded(!evosExpanded)}
                                                className="mt-3 w-full py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                {evosExpanded ? 'Show Less' : `Show All (${displayEvos.length})`}
                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${evosExpanded ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Video */}
                                {embedUrl && (
                                    <div className="col-span-12 bg-gaming-800/40 border border-gaming-700/80 rounded-2xl overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gaming-700/80 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                                                <Play className="w-3 h-3 text-rose-400 fill-rose-400 ml-0.5" />
                                            </div>
                                            <p className="font-bold text-white text-xs">Account Showcase</p>
                                        </div>
                                        <div className="aspect-video w-full bg-black">
                                            <iframe
                                                src={embedUrl}
                                                title="Account Video"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                frameBorder="0"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="comments"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gaming-800/40 border border-gaming-700/80 rounded-3xl p-5 sm:p-7"
                        >
                            {user ? (
                                <form onSubmit={handleCommentSubmit} className="mb-7">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gaming-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gaming-600">
                                            {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Ask the seller a question..."
                                                className="glass-input mb-2 min-h-[80px] text-sm"
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={commenting || !newComment.trim()}
                                                    className="btn-primary py-2 px-5 text-xs disabled:opacity-50"
                                                >
                                                    {commenting ? t['details_posting'] : t['details_post_comment']}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-gaming-900/60 border border-gaming-700 p-5 rounded-2xl text-center mb-7">
                                    <p className="text-gray-400 mb-3 text-sm">Sign in to join the conversation.</p>
                                    <button onClick={signInWithGoogle} className="btn-secondary py-2 px-5 text-xs flex items-center justify-center gap-2 mx-auto">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Sign In / Sign Up
                                    </button>
                                </div>
                            )}

                            <div className="space-y-6">
                                {comments.length > 0 ? comments.map((comment) => (
                                    <div key={comment.id} className="group relative flex gap-3 sm:gap-4 bg-gaming-800/20 p-4 rounded-2xl border border-gaming-700/50 hover:border-gaming-600/50 transition-colors">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gaming-700 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-gaming-600 shadow-lg">
                                            {comment.userPhoto ? <img src={comment.userPhoto} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <div className="text-base font-bold text-white">{comment.userName.charAt(0)}</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className="font-bold text-white text-sm sm:text-base">{comment.userName}</span>
                                                <div className="flex flex-wrap items-center gap-1">
                                                    {comment.isSellerReply && (
                                                        <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                            <ShieldCheck className="w-2.5 h-2.5" /> Seller
                                                        </span>
                                                    )}
                                                    {comment.authorRole === 'main_admin' && (
                                                        <span className="bg-purple-500/15 text-purple-400 border border-purple-500/40 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                                            <Crown className="w-2.5 h-2.5" /> Main Admin
                                                        </span>
                                                    )}
                                                    {comment.authorRole === 'higher_admin' && (
                                                        <span className="bg-pink-400/15 text-pink-300 border border-pink-400/40 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(244,114,182,0.2)]">
                                                            <ShieldCheck className="w-2.5 h-2.5" /> Higher Admin
                                                        </span>
                                                    )}
                                                    {comment.authorRole === 'admin' && (
                                                        <span className="bg-pink-500/15 text-pink-400 border border-pink-500/40 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                            <ShieldAlert className="w-2.5 h-2.5" /> Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gaming-muted ml-auto whitespace-nowrap">
                                                    {formatTime(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-sm sm:text-[15px] whitespace-pre-wrap leading-relaxed">{comment.text}</p>
                                            
                                            <div className="flex items-center gap-4 mt-3">
                                                {user && (
                                                    <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-[11px] sm:text-xs text-gaming-muted hover:text-gaming-accent transition-colors font-medium flex items-center gap-1.5">
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                        {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                                                    </button>
                                                )}
                                                {(user?.uid === comment.userId || isOwner || isAdminUser) && (
                                                    <button onClick={() => handleDeleteComment(comment.id)} className="text-[11px] sm:text-xs text-gaming-muted hover:text-red-400 transition-colors font-medium">
                                                        Delete
                                                    </button>
                                                )}
                                            </div>

                                            {/* Reply Form */}
                                            <AnimatePresence>
                                                {user && replyingTo === comment.id && (
                                                    <motion.form 
                                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                        className="overflow-hidden"
                                                        onSubmit={(e) => handleReplySubmit(e, comment.id)}
                                                    >
                                                        <div className="flex gap-3 bg-gaming-900/50 p-3 sm:p-4 rounded-xl border border-gaming-700/60">
                                                            <div className="w-8 h-8 rounded-full bg-gaming-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gaming-600">
                                                                {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <div className="text-xs font-bold text-white">{user?.displayName?.charAt(0) || 'S'}</div>}
                                                            </div>
                                                            <div className="flex-1 flex flex-col items-end gap-2">
                                                                <textarea
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    placeholder={`Reply to ${comment.userName}...`}
                                                                    className="glass-input text-xs sm:text-sm py-2.5 px-3.5 w-full border-gaming-600 min-h-[60px] resize-none focus:bg-gaming-800"
                                                                    autoFocus
                                                                />
                                                                <button type="submit" disabled={replying || !replyText.trim()} className="btn-primary py-1.5 px-5 text-xs h-auto shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                                                    {replying ? 'Sending...' : 'Send Reply'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.form>
                                                )}
                                            </AnimatePresence>

                                            {/* Replies List */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
                                                    {comment.replies.map((reply, idx) => (
                                                        <div key={idx} className="flex gap-3 relative before:absolute before:left-[-15px] sm:before:left-[-19px] before:top-[-10px] before:w-[2px] before:h-[24px] before:bg-gaming-700 before:content-[''] after:absolute after:left-[-15px] sm:after:left-[-19px] after:top-[14px] after:w-[12px] after:h-[2px] after:bg-gaming-700 after:content-['']">
                                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gaming-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gaming-600 z-10">
                                                                {reply.userPhoto ? <img src={reply.userPhoto} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <div className="text-xs font-bold text-white">{reply.userName.charAt(0)}</div>}
                                                            </div>
                                                            <div className="flex-1 min-w-0 bg-gaming-900/40 p-3 rounded-xl border border-gaming-700/40">
                                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                    <span className="font-bold text-white text-[13px] sm:text-sm">{reply.userName}</span>
                                                                    <div className="flex flex-wrap items-center gap-1">
                                                                        {reply.isSellerReply && (
                                                                            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                                                <ShieldCheck className="w-2.5 h-2.5" /> Seller
                                                                            </span>
                                                                        )}
                                                                        {reply.authorRole === 'main_admin' && (
                                                                            <span className="bg-purple-500/15 text-purple-400 border border-purple-500/40 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                                                                <Crown className="w-2.5 h-2.5" /> Main Admin
                                                                            </span>
                                                                        )}
                                                                        {reply.authorRole === 'higher_admin' && (
                                                                            <span className="bg-pink-400/15 text-pink-300 border border-pink-400/40 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(244,114,182,0.2)]">
                                                                                <ShieldCheck className="w-2.5 h-2.5" /> Higher Admin
                                                                            </span>
                                                                        )}
                                                                        {reply.authorRole === 'admin' && (
                                                                            <span className="bg-pink-500/15 text-pink-400 border border-pink-500/40 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                                                <ShieldAlert className="w-2.5 h-2.5" /> Admin
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[10px] text-gaming-muted ml-auto whitespace-nowrap">
                                                                        {formatTime(reply.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-300 text-[13px] sm:text-sm whitespace-pre-wrap leading-relaxed">{reply.text}</p>
                                                                
                                                                <div className="flex gap-4 mt-2">
                                                                    {user && (
                                                                        <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-[10px] sm:text-[11px] text-gaming-muted hover:text-gaming-accent transition-colors font-medium">
                                                                            Reply
                                                                        </button>
                                                                    )}
                                                                    {(user?.uid === reply.userId || isOwner || isAdminUser) && (
                                                                        <button onClick={() => handleDeleteReply(comment.id, reply)} className="text-[10px] sm:text-[11px] text-gaming-muted hover:text-red-400 transition-colors font-medium">
                                                                            Delete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12">
                                        <MessageCircle className="w-10 h-10 text-gaming-700 mx-auto mb-3" />
                                        <p className="text-gaming-muted text-sm">{t['details_no_comments']}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile sticky CTA */}
            <div className="md:hidden fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 px-3 py-2.5 bg-gaming-900/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2.5">
                    <div className="flex-shrink-0">
                        <p className="text-[9px] uppercase tracking-wider text-gaming-muted font-bold leading-none mb-0.5">Price</p>
                        <p className="text-base font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-gaming-accent leading-none">{account.price}</p>
                    </div>
                    {account.status === 'sold' ? (
                        <div className="flex-1 bg-red-500/10 border border-red-500/40 text-red-400 font-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                            <AlertTriangle className="w-4 h-4" /> Sold
                        </div>
                    ) : (
                        <button
                            onClick={handleBuyNow}
                            disabled={!sellerWhatsapp}
                            className={`flex-1 ${sellerWhatsapp ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)]' : 'bg-gaming-700 text-gaming-muted opacity-50 cursor-not-allowed'} font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm active:scale-95`}
                        >
                            <WhatsAppIcon className="w-4 h-4" /> {sellerWhatsapp ? 'Contact Seller' : 'No WhatsApp'}
                        </button>
                    )}
                    <button
                        onClick={handleWishlistClick}
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors active:scale-95 flex-shrink-0 ${
                            isWishlisted ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-gaming-800 border-white/10 text-gray-400'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-xl"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <button
                            onClick={() => setLightboxOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-white z-50 bg-gaming-900/60 backdrop-blur-md p-2 rounded-full border border-white/10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1); }}
                            className="absolute left-4 md:left-6 text-white hover:text-gaming-accent z-50 bg-gaming-900/60 backdrop-blur-md p-2.5 md:p-3 rounded-full border border-white/10"
                        >
                            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1); }}
                            className="absolute right-4 md:right-6 text-white hover:text-gaming-accent z-50 bg-gaming-900/60 backdrop-blur-md p-2.5 md:p-3 rounded-full border border-white/10"
                        >
                            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        <div className="w-full max-w-6xl px-4 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                            <motion.img
                                key={lightboxIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={displayImages[lightboxIndex]}
                                alt={`Gallery ${lightboxIndex + 1}`}
                                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                            />
                            <div className="flex gap-2 mt-6 overflow-x-auto max-w-full pb-4 px-2 custom-scrollbar">
                                {displayImages.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setLightboxIndex(idx)}
                                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === lightboxIndex ? 'border-gaming-accent scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
