import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number; // between 0 and 5
}

export default function StarRating({ rating }: StarRatingProps) {
    // Round to nearest 0.5 for standardized display
    const normalizedRating = Math.round(rating * 2) / 2;

    return (
        <div className="flex items-center gap-0.5" title={`${rating.toFixed(1)} Stars`}>
            {[1, 2, 3, 4, 5].map((starValue) => {
                if (normalizedRating >= starValue) {
                    return <Star key={starValue} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />;
                } else if (normalizedRating >= starValue - 0.5) {
                    return (
                        <div key={starValue} className="relative w-3.5 h-3.5">
                            <Star className="absolute top-0 left-0 w-3.5 h-3.5 text-gray-500 fill-gray-500" />
                            <div className="absolute top-0 left-0 h-full overflow-hidden w-[50%]">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            </div>
                        </div>
                    );
                } else {
                    return <Star key={starValue} className="w-3.5 h-3.5 text-gray-500 fill-gray-500" />;
                }
            })}
        </div>
    );
}
