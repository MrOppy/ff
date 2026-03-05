import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import type { SellerReview } from '../services/reviewService';
import { Star, ShieldAlert, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

interface AdminReviewsSectionProps {
    sellerId: string;
}

export default function AdminReviewsSection({ sellerId }: AdminReviewsSectionProps) {
    const { isAdmin, user } = useAuth();
    const [reviews, setReviews] = useState<SellerReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');

    const fetchReviews = async () => {
        if (!sellerId) return;
        const data = await reviewService.getReviewsForSeller(sellerId);
        setReviews(data);
    };

    useEffect(() => {
        const loadInitial = async () => {
            if (sellerId) {
                setLoading(true);
                const data = await reviewService.getReviewsForSeller(sellerId);
                setReviews(data);
                setLoading(false);
            }
        };
        loadInitial();
    }, [sellerId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || (!isAdmin && !isEditing)) return;

        try {
            if (isEditing) {
                await reviewService.updateReview(isEditing, rating, text);
            } else {
                await reviewService.addReview(sellerId, user.uid, rating, text);
            }
            setIsFormOpen(false);
            setIsEditing(null);
            setRating(5);
            setText('');
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
        setIsFormOpen(true);
    };

    if (loading) return <div className="text-gaming-muted text-sm py-4">Loading reviews...</div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc: number, r: SellerReview) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "No Ratings";

    return (
        <div className="flex flex-col items-center md:items-start text-left w-full">
            {/* COMPACT VIEW FOR ALL USERS */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {reviews.length > 0 ? (
                    <StarRating rating={parseFloat(averageRating as string)} />
                ) : (
                    <span className="text-sm font-bold text-gray-400">No Ratings</span>
                )}
                <span className="text-xs text-gaming-muted whitespace-nowrap">({reviews.length} reviews)</span>

                {isAdmin && !isFormOpen && (
                    <button
                        onClick={() => { setIsEditing(null); setRating(5); setText(''); setIsFormOpen(true); }}
                        className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/30 rounded hover:bg-pink-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Edit2 className="w-3 h-3" /> Admin Add Review
                    </button>
                )}
            </div>

            {/* FULL REVIEW LIST & EDITING FORM - ADMIN ONLY */}
            {isAdmin && (
                <div className="w-full mt-4 max-w-md">
                    {isFormOpen && (
                        <form onSubmit={handleSubmit} className="bg-gaming-900 border border-gaming-700 p-4 rounded-xl mb-6">
                            <h4 className="font-bold text-white mb-4">{isEditing ? 'Edit Review' : 'New Review'}</h4>
                            <div className="mb-4">
                                <label className="block text-sm text-gaming-muted mb-2">Rating (1-5)</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="p-1 focus:outline-none"
                                        >
                                            <Star className={`w-6 h-6 ${rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gaming-700'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm text-gaming-muted mb-2">Review Text</label>
                                <textarea
                                    required
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    className="glass-input resize-none"
                                    placeholder="Write admin review..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn-primary flex-1">{isEditing ? 'Update Review' : 'Post Review'}</button>
                                <button type="button" onClick={() => { setIsFormOpen(false); setIsEditing(null); }} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white text-sm">Review History</h4>
                            {reviews.length > 0 && (
                                <button
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="text-xs text-gaming-accent hover:text-white transition-colors"
                                >
                                    {showAllReviews ? 'Hide Reviews' : `Show all reviews (${reviews.length})`}
                                </button>
                            )}
                        </div>

                        {reviews.length === 0 && !isFormOpen && (
                            <p className="text-gaming-muted text-center py-6 border border-dashed border-gaming-700 rounded-xl text-sm">This seller has no reviews yet.</p>
                        )}

                        {showAllReviews && reviews.map((review: SellerReview) => (
                            <div key={review.id} className="bg-gaming-900 border border-gaming-700 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <StarRating rating={review.rating} />
                                    <span className="text-xs text-gaming-muted">{review.createdAt.toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{review.text}</p>

                                <div className="mt-3 flex items-center justify-between text-xs border-t border-gaming-800 pt-3">
                                    <span className="text-gaming-accent flex items-center gap-1 font-bold">
                                        <ShieldAlert className="w-3 h-3" /> Verified by Admin
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(review)} className="text-blue-400 hover:text-blue-300 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(review.id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
