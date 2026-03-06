import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../services/reviewService';
import type { SellerReview } from '../services/reviewService';
import { Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

interface AdminReviewsSectionProps {
    sellerId: string;
}

export default function AdminReviewsSection({ sellerId }: AdminReviewsSectionProps) {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<SellerReview[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="text-gaming-muted text-sm py-4">Loading reviews...</div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc: number, r: SellerReview) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "No Ratings";

    return (
        <button
            onClick={() => navigate(`/seller/${encodeURIComponent(sellerId)}/reviews`)}
            className="flex flex-wrap items-center justify-center md:justify-start gap-2 bg-gaming-900/50 hover:bg-gaming-800 border border-gaming-700 hover:border-gaming-600 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm group"
        >
            {reviews.length > 0 ? (
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white group-hover:text-gaming-accent transition-colors">{averageRating}</span>
                    <StarRating rating={parseFloat(averageRating as string)} />
                </div>
            ) : (
                <span className="text-sm font-bold text-gaming-muted group-hover:text-white transition-colors">No Ratings</span>
            )}
            <span className="text-xs text-gaming-muted whitespace-nowrap px-1">({reviews.length} reviews)</span>

            {isAdmin && (
                <span className="ml-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/30 rounded flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-3 h-3" /> Manage
                </span>
            )}
        </button>
    );
}
