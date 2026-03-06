import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, MessageCircle, Heart, Info, ShieldAlert, Loader2, User, X, ChevronLeft, ChevronRight, Trophy, AlertTriangle, Globe } from 'lucide-react';
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

// Fallback details if no extra data is found
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
    const { user, profile, toggleWishlist, signInWithGoogle } = useAuth(); // for comments and wishlist

    const [account, setAccount] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(true);

    const [sellerRating, setSellerRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);

    const [comments, setComments] = useState<CommentData[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commenting, setCommenting] = useState(false);

    // Reply states
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [replying, setReplying] = useState(false);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Auth and Context Checks
    const isOwner = Boolean(user && account && user.displayName === account.seller);
    const isWishlisted = Boolean(profile?.wishlist?.includes(id || ''));

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

                // Fetch ratings if we have a seller
                const currentAccount = data || MOCK_ACCOUNTS.find(a => a.id === id) || MOCK_ACCOUNTS[0];
                const reviewKey = (currentAccount as AccountData)?.seller;
                if (reviewKey) {
                    const reviews = await reviewService.getReviewsForSeller(reviewKey);
                    if (reviews.length > 0) {
                        const avg = reviews.reduce((acc: number, r: SellerReview) => acc + r.rating, 0) / reviews.length;
                        setSellerRating(avg);
                        setReviewCount(reviews.length);
                    }
                }

                // Fetch comments
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
            // Check if current user is the seller of this account
            const isSeller = account?.seller === user.displayName;
            const newCommentId = await commentService.addComment(
                id,
                user.uid,
                user.displayName || 'Anonymous User',
                user.photoURL,
                newComment,
                isSeller,
                profile?.role === 'admin'
            );

            // Optimistically update UI
            const newCommentData: CommentData = {
                id: newCommentId,
                listingId: id,
                userId: user.uid,
                userName: user.displayName || 'Anonymous User',
                userPhoto: user.photoURL,
                text: newComment,
                createdAt: new Date(),
                isSellerReply: isSeller,
                isAdminReply: profile?.role === 'admin'
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
            await commentService.replyToComment(commentId, {
                userId: user.uid,
                userName: user.displayName || 'Seller',
                userPhoto: user.photoURL,
                text: replyText.trim(),
                isAdminReply: profile?.role === 'admin'
            });
            setReplyText('');
            setReplyingTo(null);

            // Refresh comments manually
            const commentsData = await commentService.getCommentsByListing(account.id);
            setComments(commentsData);
        } catch (error) {
            console.error("Failed to post reply", error);
        } finally {
            setReplying(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await commentService.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment', error);
            alert('Failed to delete comment.');
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
        } catch (error) {
            console.error('Failed to delete reply', error);
            alert('Failed to delete reply.');
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="w-10 h-10 text-gaming-accent animate-spin" /></div>;
    }

    if (!account) return <div className="pt-32 text-center text-white text-2xl">Account not found</div>;

    const displayImages = account.imageGallery && account.imageGallery.length > 0 ? account.imageGallery :
        ((account as any).images ? (account as any).images : [account.image || FALLBACK_DETAILS.images[0]]);

    const displayAge = account.accountAge || FALLBACK_DETAILS.accountAge;
    const displayVault = account.totalVault || FALLBACK_DETAILS.totalVault;
    const displayMaxEvosCount = account.maxEvosCount || FALLBACK_DETAILS.maxEvosCount;
    const displayEvos = account.evoGuns || FALLBACK_DETAILS.evoGuns;
    const displayDesc = account.description || FALLBACK_DETAILS.description;
    const displayServer = account.server || 'Unknown';

    const handleBuyNow = () => {
        const text = `Hi Admin, I'm interested in buying this account:\n\n*ID*: ${account.id}\n*Title*: ${account.title}\n*Price*: ${account.price}\n*Seller Username*: ${account.sellerUsername || account.seller}\n*Link*: ${window.location.href}\n\nPlease help me proceed securely.`;
        const whatsappUrl = `https://wa.me/8801764696964?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    // Helper to get embed URL
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

    return (
        <div className="pt-28 sm:pt-32 pb-28 sm:pb-24 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gaming-muted hover:text-white transition-colors mb-4 sm:mb-6 font-medium group text-sm sm:text-base"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" /> {t['details_back_to_shop']}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">

                    {/* Left Column - Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {/* Main Image */}
                        <div
                            className="aspect-[4/3] rounded-2xl overflow-hidden border border-gaming-700 bg-gaming-800 cursor-pointer group relative"
                            onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                        >
                            <img src={displayImages[0]} alt={account.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-bold tracking-widest bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md">CLICK TO ENLARGE</span>
                            </div>
                        </div>

                        {/* Thumbnails (Swipeable on Mobile) */}
                        <div className="flex overflow-x-auto gap-4 custom-scrollbar pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-4 sm:pb-0 sm:snap-none">
                            {displayImages.slice(1, 4).map((img: string, i: number) => (
                                <div
                                    key={i}
                                    onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
                                    className="aspect-square w-24 sm:w-auto flex-shrink-0 snap-center rounded-xl overflow-hidden border border-gaming-700 cursor-pointer hover:border-gaming-accent transition-colors bg-gaming-800"
                                >
                                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                            {displayImages.length > 4 && (
                                <div
                                    onClick={() => { setLightboxIndex(4); setLightboxOpen(true); }}
                                    className="aspect-square w-24 sm:w-auto flex-shrink-0 snap-center rounded-xl overflow-hidden border border-gaming-700 bg-gaming-800 flex items-center justify-center cursor-pointer hover:bg-gaming-700 transition-colors"
                                >
                                    <span className="text-sm font-bold text-gaming-accent text-center">+{displayImages.length - 4}<br />View All</span>
                                </div>
                            )}
                        </div>

                        {/* Video Embed */}
                        {embedUrl && (
                            <div className="mt-8">
                                <h4 className="font-bold text-white mb-3">Account Video</h4>
                                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-gaming-700 bg-gaming-900 shadow-xl relative">
                                    <iframe
                                        src={embedUrl}
                                        title="Account Video"
                                        className="w-full h-full absolute top-0 left-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        frameBorder="0"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column - Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
                                {account.title}
                            </h1>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                            {account.tags && account.tags.map((tag: string) => (
                                <span key={tag} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gaming-800 border border-gaming-600 rounded-lg text-xs sm:text-sm font-bold text-gaming-accent">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 text-gaming-muted border-b border-gaming-700 pb-4 sm:pb-6">
                            <button
                                onClick={() => navigate(`/seller/${account.sellerUsername || account.sellerId || account.seller}`)}
                                className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-gaming-800 p-2 -ml-2 rounded-xl transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gaming-700 flex items-center justify-center text-white font-bold text-lg overflow-hidden border border-gaming-600">
                                    {account.sellerPhoto ? (
                                        <img src={account.sellerPhoto} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    ) : (
                                        account.seller.charAt(0)
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm">Seller</p>
                                    <div className="flex flex-col">
                                        <p className="text-white font-bold">{account.seller} <ShieldCheck className="w-4 h-4 inline text-emerald-500" /></p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {sellerRating !== null ? (
                                                <StarRating rating={sellerRating} />
                                            ) : (
                                                <span className="text-xs font-bold text-white">New Seller</span>
                                            )}
                                            <span className="text-[10px] text-gaming-muted">({reviewCount})</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                            <div className="h-6 sm:h-8 w-px bg-gaming-700" />
                            <div>
                                <p className="text-xs sm:text-sm">Account ID</p>
                                <p className="text-sm sm:text-base text-white font-mono">{account.id}</p>
                            </div>
                        </div>



                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-gaming-accent mb-1 sm:mb-2">
                                {account.price}
                            </h3>
                            <p className="text-xs sm:text-sm text-gaming-muted flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t['details_secure_tx']}
                            </p>
                        </div>

                        <div className="fixed md:static bottom-[calc(60px+env(safe-area-inset-bottom,0px))] md:bottom-auto left-0 w-full md:w-auto px-4 py-2.5 md:p-0 bg-gaming-900/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-t border-white/10 md:border-none z-40 mb-0 md:mb-8 flex flex-row gap-2 sm:gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:shadow-none">
                            {account.status === 'sold' ? (
                                <div className="flex-1 bg-red-500/10 border border-red-500/50 text-red-500 font-black py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                    <AlertTriangle className="w-6 h-6 md:w-8 md:h-8" /> Account Sold
                                </div>
                            ) : (
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 md:py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg active:scale-95"
                                >
                                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" /> {t['details_buy_btn']}
                                </button>
                            )}
                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    onClick={handleWishlistClick}
                                    className={`w-11 h-11 md:w-14 md:h-14 rounded-xl border flex items-center justify-center transition-colors active:scale-95 ${isWishlisted ? 'bg-pink-500/10 border-pink-500/50 text-pink-500' : 'bg-gaming-800 border-white/10 text-gray-400 hover:text-pink-500 hover:border-pink-500'}`}
                                >
                                    <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isWishlisted ? 'fill-pink-500' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Warning Box */}
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 flex items-start gap-2 sm:gap-3">
                            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-amber-100/70">
                                <strong className="text-amber-500">{t['details_caution']}</strong> {t['details_caution_text']}
                            </p>
                        </div>

                        {/* Account Details & Stats */}
                        <div className="space-y-6 sm:space-y-8">

                            {/* Seller Notes Section */}
                            <div className="bg-gaming-800/30 rounded-2xl border border-gaming-700 p-5 sm:p-6 backdrop-blur-sm">
                                <h4 className="flex items-center gap-2 font-bold mb-4 text-white text-lg">
                                    <Info className="w-5 h-5 text-gaming-accent" /> Seller Notes
                                </h4>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gaming-accent rounded-l-md"></div>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap pl-4 sm:pl-5 py-1">
                                        {displayDesc}
                                    </p>
                                </div>
                            </div>

                            {/* Account Statistics Grid */}
                            <div>
                                <h4 className="font-bold text-white text-lg mb-4 flex items-center gap-2 px-1">
                                    <Trophy className="w-5 h-5 text-yellow-500" /> Account Highlights
                                </h4>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="bg-gaming-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gaming-700/50 hover:bg-gaming-800/80 hover:border-gaming-500/50 transition-all group">
                                        <p className="text-[10px] sm:text-xs text-gaming-muted uppercase font-bold tracking-wider mb-1">Level</p>
                                        <p className="font-bold text-2xl sm:text-3xl text-white group-hover:text-white transition-colors">{account.level}</p>
                                    </div>
                                    <div className="bg-gaming-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gaming-700/50 hover:bg-gaming-800/80 hover:border-gaming-500/50 transition-all group">
                                        <p className="text-[10px] sm:text-xs text-gaming-muted uppercase font-bold tracking-wider mb-1">Likes</p>
                                        <p className="font-bold text-2xl sm:text-3xl text-purple-400 group-hover:text-purple-300 transition-colors">{account.likes || 0}</p>
                                    </div>
                                    <div className="bg-gaming-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gaming-700/50 hover:bg-gaming-800/80 hover:border-gaming-500/50 transition-all group">
                                        <p className="text-[10px] sm:text-xs text-gaming-muted uppercase font-bold tracking-wider mb-1">Prime Level</p>
                                        <p className="font-bold text-2xl sm:text-3xl text-blue-400 group-hover:text-blue-300 transition-colors">{account.primeLevel || 0}</p>
                                    </div>
                                    <div className="bg-gaming-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gaming-700/50 hover:bg-gaming-800/80 hover:border-gaming-500/50 transition-all group">
                                        <p className="text-[10px] sm:text-xs text-gaming-muted uppercase font-bold tracking-wider mb-1">Total Vault</p>
                                        <p className="font-bold text-2xl sm:text-3xl text-yellow-400 group-hover:text-yellow-300 transition-colors">{displayVault}</p>
                                    </div>
                                    <div className="bg-gaming-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gaming-700/50 hover:bg-gaming-800/80 hover:border-gaming-500/50 transition-all group">
                                        <p className="text-[10px] sm:text-xs text-gaming-muted uppercase font-bold tracking-wider mb-1">Max Evos</p>
                                        <p className="font-bold text-2xl sm:text-3xl text-emerald-400 group-hover:text-emerald-300 transition-colors">{displayMaxEvosCount}</p>
                                    </div>
                                    <div className="bg-gaming-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gaming-700/50 hover:bg-gaming-800/80 hover:border-gaming-500/50 transition-all group">
                                        <p className="text-[10px] sm:text-xs text-gaming-muted uppercase font-bold tracking-wider mb-1">Age (Years)</p>
                                        <p className="font-bold text-2xl sm:text-3xl text-pink-400 group-hover:text-pink-300 transition-colors">{displayAge}</p>
                                    </div>
                                    <div className="bg-gaming-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gaming-700/50 hover:bg-gaming-800/80 hover:border-gaming-500/50 transition-all group col-span-2 sm:col-span-1">
                                        <p className="text-[10px] sm:text-xs text-gaming-muted uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Server</p>
                                        <p className="font-bold text-xl sm:text-2xl text-cyan-400 group-hover:text-cyan-300 transition-colors">{displayServer}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Evo Guns */}
                            {displayEvos.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-white text-lg mb-4 flex items-center gap-2 px-1">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" /> Featured Evo Guns
                                    </h4>
                                    <div className="flex flex-wrap gap-2 lg:gap-3">
                                        {displayEvos.map((gun: any, idx: number) => (
                                            <div key={idx} className="bg-gaming-800/80 border border-gaming-600 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm flex gap-2.5 items-center shadow-lg shadow-black/20 hover:border-gaming-accent transition-colors">
                                                <span className="text-white font-medium">{gun.name}</span>
                                                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-gaming-900 border border-gaming-500/50 text-gaming-accent rounded uppercase tracking-wider">{gun.level}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>



                        {/* Comments Section */}
                        <div className="bg-gaming-800/50 rounded-2xl border border-gaming-700 p-4 sm:p-6 mb-8 lg:mb-0 mt-8 sm:mt-12">
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-gaming-accent" /> Questions & Comments
                            </h3>

                            {/* Comment Form */}
                            {user ? (
                                <form onSubmit={handleCommentSubmit} className="mb-8">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gaming-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <User className="w-5 h-5 text-gray-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Ask the seller a question..."
                                                className="glass-input mb-2 min-h-[80px]"
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={commenting || !newComment.trim()}
                                                    className="btn-primary py-2 px-6 text-sm disabled:opacity-50"
                                                >
                                                    {commenting ? t['details_posting'] : t['details_post_comment']}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-gaming-900 border border-gaming-700 p-4 rounded-xl text-center mb-8">
                                    <p className="text-gray-400 mb-3">You must be signed in to comment.</p>
                                    <button onClick={signInWithGoogle} className="btn-secondary py-2 px-6 text-sm flex items-center justify-center gap-2 mx-auto">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Sign In / Sign Up
                                    </button>
                                </div>
                            )}

                            {/* Comments List */}
                            <div className="space-y-6">
                                {comments.length > 0 ? comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gaming-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gaming-600">
                                            {comment.userPhoto ? <img src={comment.userPhoto} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <div className="text-sm font-bold text-white">{comment.userName.charAt(0)}</div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-white text-sm">{comment.userName}</span>
                                                {comment.isSellerReply && (
                                                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                        <ShieldCheck className="w-3 h-3" /> Seller
                                                    </span>
                                                )}
                                                {comment.isAdminReply && (
                                                    <span className="bg-pink-500/20 text-pink-400 border border-pink-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                        <ShieldAlert className="w-3 h-3" /> Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.text}</p>

                                            {/* Action bar for Comment */}
                                            <div className="flex gap-4 mt-2">
                                                {user && (
                                                    <button
                                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                        className="text-xs text-gaming-accent hover:underline focus:outline-none transition-colors"
                                                    >
                                                        {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                                                    </button>
                                                )}
                                                {(user?.uid === comment.userId || isOwner) && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-xs text-red-500 hover:text-red-400 hover:underline focus:outline-none transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>

                                            {/* Reply Form */}
                                            {user && replyingTo === comment.id && (
                                                <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-4 flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gaming-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gaming-600">
                                                        {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <div className="text-sm font-bold text-white">{user?.displayName?.charAt(0) || 'S'}</div>}
                                                    </div>
                                                    <div className="flex-1 flex flex-col items-end gap-2">
                                                        <input
                                                            type="text"
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder={`Reply to ${comment.userName}...`}
                                                            className="glass-input text-sm py-2 px-3 w-full border-gaming-600 focus:border-gaming-accent/50"
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={replying || !replyText.trim()}
                                                            className="btn-primary py-1 px-4 text-xs h-auto cursor-pointer"
                                                        >
                                                            {replying ? 'Sending...' : 'Send Reply'}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            {/* Render Replies */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-4 pl-4 border-l-2 border-gaming-700 space-y-4">
                                                    {comment.replies.map((reply, idx) => (
                                                        <div key={idx} className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gaming-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-emerald-500/50">
                                                                {reply.userPhoto ? <img src={reply.userPhoto} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <div className="text-sm font-bold text-emerald-400">{reply.userName.charAt(0)}</div>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-bold text-white text-sm">{reply.userName}</span>
                                                                    {reply.userName === account.seller && (
                                                                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                                            <ShieldCheck className="w-3 h-3" /> Seller
                                                                        </span>
                                                                    )}
                                                                    {reply.isAdminReply && (
                                                                        <span className="bg-pink-500/20 text-pink-400 border border-pink-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                                            <ShieldAlert className="w-3 h-3" /> Admin
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-400 text-sm whitespace-pre-wrap">{reply.text}</p>
                                                                <div className="flex gap-4 mt-1">
                                                                    {user && (
                                                                        <button
                                                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                                            className="text-[10px] text-gaming-accent hover:underline focus:outline-none transition-colors"
                                                                        >
                                                                            Reply
                                                                        </button>
                                                                    )}
                                                                    {(user?.uid === reply.userId || isOwner) && (
                                                                        <button
                                                                            onClick={() => handleDeleteReply(comment.id, reply)}
                                                                            className="text-[10px] text-red-500 hover:text-red-400 hover:underline focus:outline-none transition-colors"
                                                                        >
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
                                    <p className="text-center text-gaming-muted text-sm pb-4">{t['details_no_comments']}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-xl">
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-50 bg-gaming-900/50 p-2 rounded-full"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1) }}
                        className="absolute left-6 text-white hover:text-gaming-accent transition-colors z-50 bg-gaming-900/50 p-3 rounded-full hidden md:block"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1) }}
                        className="absolute right-6 text-white hover:text-gaming-accent transition-colors z-50 bg-gaming-900/50 p-3 rounded-full hidden md:block"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div className="w-full max-w-5xl px-4 flex flex-col items-center">
                        <img
                            src={displayImages[lightboxIndex]}
                            alt={`Gallery image ${lightboxIndex + 1}`}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="flex gap-2 mt-6 overflow-x-auto max-w-full pb-4 px-2 custom-scrollbar">
                            {displayImages.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${idx === lightboxIndex ? 'border-gaming-accent opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
