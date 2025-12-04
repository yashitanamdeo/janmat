import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StarRating } from '../components/ui/StarRating';
import { UserAvatar } from '../components/ui/UserAvatar';

interface Feedback {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    complaint: {
        id: string;
        title: string;
        status: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };
}

export const FeedbackDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://janmat-backend.onrender.com/api/admin/feedback', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFeedbacks(response.data);
        } catch (err) {
            console.error('Failed to load feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredFeedbacks = filterRating === 'ALL'
        ? feedbacks
        : feedbacks.filter(f => f.rating === filterRating);

    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : '0';

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: feedbacks.filter(f => f.rating === rating).length,
        percentage: feedbacks.length > 0
            ? ((feedbacks.filter(f => f.rating === rating).length / feedbacks.length) * 100).toFixed(0)
            : '0',
    }));

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="modern-card mb-6" style={{ borderRadius: '0' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Citizen Feedback
                                </h1>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    View all feedback and ratings from citizens
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="modern-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    Total Feedback
                                </p>
                                <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {feedbacks.length}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                                💬
                            </div>
                        </div>
                    </div>

                    <div className="modern-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    Average Rating
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {averageRating}
                                    </p>
                                    <span className="text-2xl">⭐</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                                ⭐
                            </div>
                        </div>
                    </div>

                    <div className="modern-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    Positive Feedback
                                </p>
                                <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {feedbacks.filter(f => f.rating >= 4).length}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                                👍
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="modern-card p-6 mb-8">
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Rating Distribution
                    </h3>
                    <div className="space-y-3">
                        {ratingDistribution.map(({ rating, count, percentage }) => (
                            <div key={rating} className="flex items-center gap-4">
                                <span className="text-sm font-semibold w-12" style={{ color: 'var(--text-primary)' }}>
                                    {rating} ⭐
                                </span>
                                <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-semibold w-16 text-right" style={{ color: 'var(--text-secondary)' }}>
                                    {count} ({percentage}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter */}
                <div className="modern-card mb-6 p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Filter by rating:</span>
                        <button
                            onClick={() => setFilterRating('ALL')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterRating === 'ALL'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            All
                        </button>
                        {[5, 4, 3, 2, 1].map(rating => (
                            <button
                                key={rating}
                                onClick={() => setFilterRating(rating)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterRating === rating
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {rating} ⭐
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback List */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="spinner"></div>
                    </div>
                ) : filteredFeedbacks.length === 0 ? (
                    <div className="modern-card p-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl"
                            style={{ background: 'var(--bg-secondary)' }}>
                            💬
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            No Feedback Yet
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Citizens haven't submitted any feedback yet
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFeedbacks.map(feedback => (
                            <div key={feedback.id} className="modern-card p-6 hover-lift">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <UserAvatar user={feedback.user} size="md" />
                                            <div>
                                                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                                    {feedback.user.name}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                    {feedback.user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                            Complaint: <span className="font-semibold">{feedback.complaint.title}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <StarRating rating={feedback.rating} readonly size="sm" />
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                            {new Date(feedback.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {feedback.comment && (
                                    <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                        <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>
                                            "{feedback.comment}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
