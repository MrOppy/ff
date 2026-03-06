import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Star, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewService, type SellerReview } from '../services/reviewService';
import { userService } from '../services/userService';
import StarRating from '../components/StarRating';
import ImageUploader from '../components/ImageUploader';

export default function SellerReviews() {
    const { sellerName } = useParams<{ sellerName: string }>();
    const navigate = useNavigate();
    const { isAdmin, user } = useAuth();

    const [reviews, setReviews] = useState<SellerReview[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [reviewerPhoto, setReviewerPhoto] = useState('');

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

    const fetchReviews = async () => {
        if (!sellerName) return;
        const data = await reviewService.getReviewsForSeller(sellerName);
        setReviews(data);
    };

    useEffect(() => {
        async function loadData() {
            if (!sellerName) return;
            setLoading(true);
            try {
                // Fetch user data for the header
                let userInfo = await userService.getUserByUsername(sellerName);
                if (!userInfo) {
                    // Fallback for older display name routing
                    userInfo = await userService.getUserByUsername(sellerName);
                    // (Simplified since we already query uniquely, but leaving space if needed)
                }
                setUserData(userInfo);

                // Fetch reviews
                const data = await reviewService.getReviewsForSeller(sellerName);
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [sellerName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || (!isAdmin && !isEditing)) return;
        if (!sellerName) return;

        try {
            if (isEditing) {
                await reviewService.updateReview(isEditing, rating, text, reviewerName, reviewerPhoto);
            } else {
                await reviewService.addReview(sellerName, user.uid, rating, text, reviewerName || 'Verified Buyer', reviewerPhoto);
            }
            setIsFormOpen(false);
            setIsEditing(null);
            setRating(5);
            setText('');
            setReviewerName('');
            setReviewerPhoto('');
            fetchReviews();
        } catch (error) {
            console.error(error);
            alert("Failed to save review.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            await reviewService.deleteReview(id);
            fetchReviews();
        } catch (error) {
            console.error(error);
            alert("Failed to delete review.");
        }
    };

    const startEdit = (review: SellerReview) => {
        setIsEditing(review.id);
        setRating(review.rating);
        setText(review.text);
        setReviewerName(review.reviewerName || 'Verified Buyer');
        setReviewerPhoto(review.reviewerPhoto || '');
        setIsFormOpen(true);
    };

    if (loading) {
        return <div className="min-h-screen pt-32 text-center text-white">Loading reviews...</div>;
    }

    if (!sellerName) {
        return <div className="min-h-screen pt-32 text-center text-white">Seller not found.</div>;
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc: number, r: SellerReview) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const displayName = userData?.displayName || sellerName;

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <button
                    onClick={() => navigate(`/seller/${sellerName}`)}
                    className="flex items-center gap-2 text-gaming-muted hover:text-white transition-colors mb-6 font-bold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Profile
                </button>

                {/* Header */}
                <div className="bg-gaming-800 border border-gaming-700 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                        <div className="w-16 h-16 rounded-full bg-gaming-700 border-2 border-gaming-600 flex flex-shrink-0 items-center justify-center text-2xl font-bold text-white overflow-hidden">
                            {userData?.photoURL ? (
                                <img src={userData.photoURL} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                {displayName} <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            </h1>
                            <p className="text-gaming-accent text-sm font-mono mt-0.5">@{sellerName}</p>
                        </div>
                    </div>

                    <div className="bg-gaming-900/50 border border-gaming-700 p-4 rounded-xl flex items-center gap-4 w-full md:w-auto relative z-10">
                        <div className="text-center">
                            <p className="text-3xl font-extrabold text-white mb-1">{averageRating}</p>
                            <div className="flex justify-center">
                                <StarRating rating={parseFloat(averageRating)} />
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gaming-700" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white mb-0.5">{reviews.length}</p>
                            <p className="text-xs text-gaming-muted uppercase tracking-wider font-bold">Reviews</p>
                        </div>
                    </div>
                </div>

                {/* Admin Add Review Form */}
                {isAdmin && (
                    <div className="mb-8">
                        {!isFormOpen ? (
                            <button
                                onClick={() => { setIsEditing(null); setRating(5); setText(''); setReviewerName(''); setReviewerPhoto(''); setIsFormOpen(true); }}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-pink-500/10 hover:bg-pink-500 border border-pink-500/30 text-pink-400 hover:text-white transition-all px-4 py-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(236,72,153,0.1)]"
                            >
                                <Edit2 className="w-4 h-4" /> Add Admin Review
                            </button>
                        ) : (
                            <form onSubmit={handleSubmit} className="bg-gaming-800 border border-pink-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.05)]">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-pink-500" />
                                    {isEditing ? 'Edit Admin Review' : 'Add Official Admin Review'}
                                </h3>

                                <div className="mb-4">
                                    <label className="block text-sm text-gaming-muted mb-2 font-bold">Rating (1-5)</label>
                                    <div className="flex gap-1 bg-gaming-900 p-3 rounded-xl border border-gaming-700 w-fit">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="p-1 focus:outline-none hover:scale-110 transition-transform"
                                            >
                                                <Star className={`w-8 h-8 ${rating >= star ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-gaming-700'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-gaming-muted mb-2 font-bold">Reviewer Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={reviewerName}
                                            onChange={e => setReviewerName(e.target.value)}
                                            className="w-full glass-input text-white bg-gaming-900 focus:border-pink-500 transition-colors"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <ImageUploader
                                            onImageUploaded={setReviewerPhoto}
                                            label="Reviewer Photo (Optional)"
                                            description="Upload via ImgBB"
                                        />
                                        {reviewerPhoto && (
                                            <div className="mt-2 text-xs text-green-400 break-all select-all">
                                                Uploaded: {reviewerPhoto}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm text-gaming-muted mb-2 font-bold">Review Description</label>
                                    <textarea
                                        required
                                        value={text}
                                        onChange={e => setText(e.target.value)}
                                        className="w-full glass-input resize-none h-32 text-white bg-gaming-900 focus:border-pink-500 transition-colors"
                                        placeholder="Detail the transaction process, safety, and seller behavior..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                                        {isEditing ? 'Update Review' : 'Publish Review'}
                                    </button>
                                    <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 btn-secondary py-3 rounded-xl">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Reviews List */}
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Review History
                </h3>

                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="bg-gaming-800/50 border border-dashed border-gaming-600 rounded-2xl p-12 text-center">
                            <Star className="w-12 h-12 text-gaming-700 mx-auto mb-4" />
                            <p className="text-gaming-muted font-medium">No reviews have been published for this seller yet.</p>
                        </div>
                    ) : (
                        reviews.map((review: SellerReview) => {
                            const displayName = review.reviewerName || 'Verified Buyer';
                            const initial = displayName.charAt(0).toUpperCase();
                            const colorClasses = getRandomColorClasses(displayName);

                            return (
                                <div key={review.id} className="bg-gaming-800 border border-gaming-700 hover:border-gaming-600 transition-colors rounded-2xl p-6 pb-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            {review.reviewerPhoto ? (
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gaming-600 shrink-0">
                                                    <img src={review.reviewerPhoto} alt={displayName} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold shrink-0 ${colorClasses}`}>
                                                    {initial}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-white text-base">{displayName}</p>
                                                <span className="text-xs text-gaming-muted flex items-center gap-1 mt-0.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified Review • {review.createdAt.toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="bg-gaming-900 px-3 py-1.5 rounded-lg border border-gaming-700">
                                            <StarRating rating={review.rating} />
                                        </div>
                                    </div>

                                    <p className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap pl-1">{review.text}</p>

                                    {isAdmin && (
                                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-gaming-700/50 pt-3">
                                            <button
                                                onClick={() => startEdit(review)}
                                                className="text-white hover:bg-gaming-700 bg-gaming-900 border border-gaming-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                                            >
                                                <Edit2 className="w-3 h-3" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="text-red-400 hover:bg-red-500/10 bg-gaming-900 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                                            >
                                                <Trash2 className="w-3 h-3 border border-transparent" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
}
