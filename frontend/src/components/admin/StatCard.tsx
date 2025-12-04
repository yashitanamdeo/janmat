import React from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    gradient: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, trend, onClick }) => {
    const isClickable = !!onClick;

    return (
        <div
            onClick={onClick}
            className={`modern-card relative overflow-hidden group ${isClickable ? 'cursor-pointer hover-lift' : ''}`}
            style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

            {/* Animated Background Circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: gradient.split(' ')[1] }}></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: gradient.split(' ')[3] }}></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                            {title}
                        </p>
                        <h3 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {value}
                        </h3>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${gradient} transform group-hover:scale-110 transition-transform`}>
                        {icon}
                    </div>
                </div>

                {trend && (
                    <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trend.isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {trend.isPositive ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                )}
                            </svg>
                            {Math.abs(trend.value)}%
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>vs last month</span>
                    </div>
                )}

                {isClickable && (
                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: gradient.split(' ')[1].replace('from-', '').replace('to-', '') }}>
                        <span>View Details</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};
