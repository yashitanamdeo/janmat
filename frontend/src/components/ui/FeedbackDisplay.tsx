import React from 'react';
import { StarRating } from './StarRating';

interface FeedbackDisplayProps {
    feedback: {
        rating: number;
        comment?: string;
        user?: {
            name: string;
        };
        createdAt?: string;
    };
    compact?: boolean;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, compact = false }) => {
    if (!feedback) return null;

    return (
        <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg ${compact ? 'p-3' : 'p-4'} border border-gray-100 dark:border-gray-700`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Rating:
                    </span>
                    <StarRating rating={feedback.rating} readonly size="sm" />
                </div>
                {feedback.createdAt && (
                    <span className="text-xs text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                )}
            </div>

            {feedback.comment && (
                <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "{feedback.comment}"
                    </p>
                </div>
            )}

            {!compact && feedback.user && (
                <div className="mt-2 text-xs text-gray-500 text-right">
                    - {feedback.user.name}
                </div>
            )}
        </div>
    );
};
