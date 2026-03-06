import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldAlert, Trash2, Calendar, Loader2, MessageCircle, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { publicReviewService, type PublicReview } from '../services/publicReviewService';
import ImageUploader from '../components/ImageUploader';
import { useLanguage } from '../context/LanguageContext';

export default function PublicReviews() {
    const { user, isAdmin, signInWithGoogle } = useAuth();
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<PublicReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form state
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState('');

    // Admin override form state
    const [adminOverrideName, setAdminOverrideName] = useState('');
    const [adminOverridePhoto, setAdminOverridePhoto] = useState('');

    const getRandomColorClasses = (name: string) => {
        const colors = [
            'bg-red-500/10 border-red-500/30 text-red-500',
            'bg-blue-500/10 border-blue-500/30 text-blue-500',
            'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
            'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
            'bg-purple-500/10 border-purple-500/30 text-purple-500',
            'bg-pink-500/10 border-pink-500/30 text-pink-500',
            'bg-indigo-500/10 border-indigo-500/30 text-indigo-500',
            'bg-teal-500/10 border-teal-500/30 text-teal-500',
            'bg-orange-500/10 border-orange-500/30 text-orange-500',
            'bg-cyan-500/10 border-cyan-500/30 text-cyan-500',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    useEffect(() => {
        const checkCooldown = async () => {
            if (user) {
                if (isAdmin) {
                    setCanReview(true);
                } else {
                    const status = await publicReviewService.canUserReview(user.uid);
                    setCanReview(status);
                }
            }
        };
        checkCooldown();
    }, [user, isAdmin]);

    const fetchReviews = async () => {
        try {
            const data = await publicReviewService.getReviews();
            setReviews(data);
        } catch (error) {
            console.error("Error fetching reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !message.trim()) return;
        setSubmitting(true);

        try {
            const reviewData = {
                userId: user.uid,
                userName: (isAdmin && adminOverrideName.trim()) ? adminOverrideName.trim() : (user.displayName || 'Anonymous Player'),
                userPhoto: (isAdmin && adminOverridePhoto.trim()) ? adminOverridePhoto.trim() : user.photoURL,
                rating,
                message: message.trim(),
                isAdminReview: isAdmin
            };

            const newlyAddedId = await publicReviewService.addReview(reviewData);

            // Optimistic Update
            setReviews([{
                id: newlyAddedId,
                ...reviewData,
                createdAt: new Date()
            }, ...reviews]);

            // Reset form
            setMessage('');
            setRating(5);
            setAdminOverrideName('');
            setAdminOverridePhoto('');
            setIsFormOpen(false);

            if (!isAdmin) {
                setCanReview(false);
            }
            alert("Review posted successfully!");

        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to post review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await publicReviewService.deleteReview(id);
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Failed to delete review");
        }
    };

    return (
        <div className="pt-24 pb-20 md:pb-0">
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                {/* Header Sequence */}
                <div className="text-center mb-10 mt-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block p-4 rounded-full bg-gaming-800/50 border border-gaming-700/50 mb-4"
                    >
                        <MessageCircle className="w-10 h-10 text-gaming-accent" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-heading font-extrabold text-white mb-4"
                    >
                        {t['pub_rev_title'] || 'Community '} <span className="text-gaming-accent">{t['pub_rev_title_highlight'] || 'Reviews'}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gaming-muted max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
                    >
                        {t['pub_rev_desc'] || 'Read what other players say about their experience with FF MARKET BD. Safe trades, instant deliveries, and trusted admins.'}
                    </motion.p>
                </div>

                {/* Review Form Component */}
                {user ? (
                    <div className="mb-12">
                        {canReview ? (
                            !isFormOpen ? (
                                <button
                                    onClick={() => { setRating(5); setMessage(''); setIsFormOpen(true); }}
                                    className={`w-full md:w-auto flex items-center justify-center gap-2 transition-all px-4 py-3 rounded-xl font-bold text-sm mx-auto
                                        ${isAdmin
                                            ? 'bg-pink-500/10 hover:bg-pink-500 border border-pink-500/30 text-pink-400 hover:text-white shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                                            : 'bg-gaming-800 hover:bg-gaming-700 border border-gaming-600 text-white shadow-lg'
                                        }`}
                                >
                                    <Edit2 className="w-4 h-4" /> {isAdmin ? (t['pub_rev_btn_admin'] || 'Add Official Admin Review') : (t['pub_rev_btn_write'] || 'Write a Review')}
                                </button>
                            ) : (
                                <form onSubmit={handleSubmit} className={`p-6 rounded-2xl md:max-w-3xl mx-auto
                                    ${isAdmin
                                        ? 'bg-gaming-800 border border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.05)]'
                                        : 'bg-gaming-800/50 backdrop-blur-sm border border-gaming-700/50 shadow-lg'
                                    }`}>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        {isAdmin ? <ShieldAlert className="w-5 h-5 text-pink-500" /> : <MessageCircle className="w-5 h-5 text-gaming-accent" />}
                                        {isAdmin ? 'Official Admin Review' : 'Share Your Experience'}
                                    </h3>

                                    <div className="mb-4">
                                        <label className="block text-sm text-gaming-muted mb-2 font-bold">Rating (1-5)</label>
                                        <div className="flex gap-1 bg-gaming-900 p-3 rounded-xl border border-gaming-700 w-fit">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className="p-1 focus:outline-none hover:scale-110 transition-transform"
                                                >
                                                    <Star className={`w-8 h-8 ${rating >= star ? 'fill-yellow-500 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-gaming-700'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm text-gaming-muted mb-2 font-bold uppercase tracking-wider">Admin Override Name (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={adminOverrideName}
                                                    onChange={(e) => setAdminOverrideName(e.target.value)}
                                                    placeholder="Custom Display Name"
                                                    className="w-full glass-input text-white bg-gaming-900 focus:border-pink-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <ImageUploader
                                                    onImageUploaded={(url) => setAdminOverridePhoto(url)}
                                                    label="Admin Override Photo (Optional)"
                                                    description="Upload via ImgBB"
                                                />
                                                {adminOverridePhoto && (
                                                    <div className="mt-2 text-xs text-green-400 break-all select-all">
                                                        Uploaded: {adminOverridePhoto}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <label className="block text-sm text-gaming-muted mb-2 font-bold">Review Description</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Detail your experience with the market..."
                                            className={`w-full glass-input resize-none h-32 text-white bg-gaming-900 transition-colors ${isAdmin ? 'focus:border-pink-500' : 'focus:border-gaming-accent'}`}
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={submitting || !message.trim()}
                                            className={`flex-1 font-bold py-3 rounded-xl transition-colors
                                                ${isAdmin
                                                    ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] disabled:opacity-50 disabled:shadow-none'
                                                    : 'bg-gaming-accent hover:bg-[color:var(--color-gaming-accent-hover)] text-white disabled:opacity-50'
                                                }`}
                                        >
                                            {submitting ? 'Submitting...' : 'Post Review'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsFormOpen(false)}
                                            className="flex-1 btn-secondary py-3 rounded-xl disabled:opacity-50"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <div className="bg-gaming-800/50 backdrop-blur-sm border border-gaming-700/50 rounded-2xl p-6 text-center md:max-w-3xl mx-auto">
                                <span className="inline-block p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4">
                                    <Calendar className="w-6 h-6" />
                                </span>
                                <h3 className="text-xl font-bold text-white mb-2">You're on cooldown!</h3>
                                <p className="text-gaming-muted text-sm max-w-md mx-auto">
                                    To prevent spam, you can only post one review every 24 hours. Please come back later to share your thoughts again.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gaming-800/50 backdrop-blur-sm border border-gaming-700/50 rounded-2xl p-8 mb-12 text-center"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">{t['pub_rev_login_title'] || 'Want to leave a review?'}</h3>
                        <p className="text-gaming-muted text-sm mb-6">{t['pub_rev_login_desc'] || 'Sign in to share your experience with the community.'}</p>
                        <button onClick={signInWithGoogle} className="btn-secondary py-2 px-6 flex items-center justify-center gap-2 mx-auto">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {t['nav_signin'] || 'Sign In / Sign Up'}
                        </button>
                    </motion.div>
                )}

                {/* Reviews Grid */}
                <div className="mb-20">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-10 h-10 text-gaming-accent animate-spin" />
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="max-w-4xl mx-auto space-y-4">
                            {reviews.map((review) => {
                                const initial = review.userName.charAt(0).toUpperCase();
                                const colorClasses = getRandomColorClasses(review.userName);

                                return (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gaming-800 border border-gaming-700 hover:border-gaming-600 transition-colors rounded-2xl p-6 pb-5"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                {review.userPhoto ? (
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gaming-600 shrink-0">
                                                        <img src={review.userPhoto} alt={review.userName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold shrink-0 ${colorClasses}`}>
                                                        {initial}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-white text-base">{review.userName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-gaming-muted flex items-center gap-1">
                                                            {(review.createdAt as Date).toLocaleDateString('en-US')}
                                                        </span>
                                                        {review.isAdminReview && (
                                                            <span className="text-[10px] font-bold text-pink-400 bg-pink-500/20 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                                <ShieldAlert className="w-3 h-3" /> Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="bg-gaming-900 px-3 py-1.5 rounded-lg border border-gaming-700 flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                                                    ))}
                                                </div>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(review.id!)}
                                                        className="text-gray-500 hover:text-red-500 p-1 transition-colors"
                                                        title="Delete Review"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap pl-1">{review.message}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gaming-800/30 rounded-2xl border border-gaming-700 border-dashed">
                            <Star className="w-12 h-12 text-gaming-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">{t['pub_rev_no_reviews'] || 'No reviews yet!'}</h3>
                            <p className="text-gaming-muted text-sm">{t['pub_rev_be_first'] || 'Be the first to share your FF MARKET BD experience.'}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
