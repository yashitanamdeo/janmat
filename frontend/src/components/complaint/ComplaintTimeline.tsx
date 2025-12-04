import React from 'react';

interface TimelineEvent {
    id: string;
    status: string;
    comment?: string;
    updatedBy?: string;
    timestamp: string;
}

interface ComplaintTimelineProps {
    events: TimelineEvent[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ events }) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'IN_PROGRESS':
                return (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                );
            case 'RESOLVED':
                return (
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'REJECTED':
                return (
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 dark:text-yellow-400';
            case 'IN_PROGRESS': return 'text-blue-600 dark:text-blue-400';
            case 'RESOLVED': return 'text-green-600 dark:text-green-400';
            case 'REJECTED': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No timeline events yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📅 Activity Timeline
            </h3>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>

                {/* Timeline events */}
                <div className="space-y-6">
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            className="relative flex gap-4 animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Icon */}
                            <div className="relative z-10 flex-shrink-0">
                                {getStatusIcon(event.status)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-6">
                                <div className="p-4 rounded-xl transition-all hover:shadow-md" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <span className={`font-bold text-sm ${getStatusColor(event.status)}`}>
                                                {event.status.replace('_', ' ')}
                                            </span>
                                            {event.updatedBy && (
                                                <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>
                                                    by {event.updatedBy}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            {formatDate(event.timestamp)}
                                        </span>
                                    </div>

                                    {event.comment && (
                                        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                                            {event.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Total Events: {events.length}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Last updated {formatDate(events[0]?.timestamp || new Date().toISOString())}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
