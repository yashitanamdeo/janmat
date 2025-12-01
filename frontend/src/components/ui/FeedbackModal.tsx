import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import axios from 'axios';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaintId: string;
    complaintTitle: string;
    existingFeedback?: {
        rating: number;
        comment?: string;
    };
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    isOpen,
    onClose,
    complaintId,
    complaintTitle,
    existingFeedback,
}) => {
    const [rating, setRating] = useState(existingFeedback?.rating || 0);
    const [comment, setComment] = useState(existingFeedback?.comment || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (existingFeedback) {
            setRating(existingFeedback.rating);
            setComment(existingFeedback.comment || '');
        }
    }, [existingFeedback]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const method = existingFeedback ? 'put' : 'post';

            await axios[method](
                `http://localhost:3000/api/complaints/${complaintId}/feedback`,
                { rating, comment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess(true);
            setTimeout(() => {
                onClose();
                window.location.reload(); // Refresh to show updated feedback
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="modern-card max-w-md w-full" style={{ background: 'var(--card-bg)' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {existingFeedback ? 'Update Feedback' : 'Provide Feedback'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Complaint
                    </p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {complaintTitle}
                    </p>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            Feedback {existingFeedback ? 'Updated' : 'Submitted'} Successfully!
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                                How would you rate the resolution?
                            </label>
                            <div className="flex justify-center">
                                <StarRating
                                    rating={rating}
                                    onRatingChange={setRating}
                                    size="lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Additional Comments (Optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                rows={4}
                                className="modern-input w-full resize-none"
                                style={{
                                    background: 'var(--input-bg)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                }}
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg flex items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={loading || rating === 0}
                            >
                                {loading ? (
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                ) : (
                                    existingFeedback ? 'Update Feedback' : 'Submit Feedback'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
