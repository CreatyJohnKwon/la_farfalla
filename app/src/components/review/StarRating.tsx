import React, { useState } from "react";
import { Star } from "lucide-react";

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    size = "md",
    readonly = false,
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    const renderStar = (index: number) => {
        const starValue = index + 1;
        const currentRating = hoverRating || rating;

        // 완전히 채워진 별
        if (currentRating >= starValue) {
            return (
                <Star
                    key={index}
                    className={`${sizeClasses[size]} cursor-pointer fill-current text-yellow-400 transition-all duration-200`}
                    onClick={() => !readonly && onRatingChange?.(starValue)}
                    onMouseEnter={() => !readonly && setHoverRating(starValue)}
                    onMouseLeave={() => !readonly && setHoverRating(0)}
                />
            );
        }

        // 반쪽 채워진 별
        if (currentRating >= starValue - 0.5) {
            return (
                <div key={index} className="relative">
                    <Star
                        className={`${sizeClasses[size]} cursor-pointer text-gray-300 transition-all duration-200`}
                        onClick={() => !readonly && onRatingChange?.(starValue)}
                        onMouseEnter={() =>
                            !readonly && setHoverRating(starValue)
                        }
                        onMouseLeave={() => !readonly && setHoverRating(0)}
                    />
                    <div
                        className="absolute inset-0 w-1/2 overflow-hidden"
                        onClick={() =>
                            !readonly && onRatingChange?.(starValue - 0.5)
                        }
                        onMouseEnter={() =>
                            !readonly && setHoverRating(starValue - 0.5)
                        }
                    >
                        <Star
                            className={`${sizeClasses[size]} fill-current text-yellow-400`}
                        />
                    </div>
                </div>
            );
        }

        // 빈 별
        return (
            <Star
                key={index}
                className={`${sizeClasses[size]} cursor-pointer text-gray-300 transition-all duration-200 hover:text-yellow-400`}
                onClick={() => !readonly && onRatingChange?.(starValue)}
                onMouseEnter={() => !readonly && setHoverRating(starValue)}
                onMouseLeave={() => !readonly && setHoverRating(0)}
            />
        );
    };

    return (
        <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4].map(renderStar)}
            {size !== "sm" && (
                <span className="ml-2 text-sm font-medium text-gray-600">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
