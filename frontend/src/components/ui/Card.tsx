import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    variant?: 'default' | 'glass' | 'gradient';
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    variant = 'default',
    hoverable = false
}) => {
    const variants = {
        default: 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800',
        glass: 'glass', // Uses the updated glass class from index.css
        gradient: 'bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-800/50 border border-blue-100 dark:border-slate-700',
    };

    const hoverClass = hoverable ? 'hover-lift cursor-pointer' : '';

    return (
        <div className={`
            ${variants[variant]} 
            shadow-lg rounded-2xl overflow-hidden 
            transition-all duration-300
            ${hoverClass}
            ${className}
        `}>
            {title && (
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
            )}
            <div className="px-6 py-6">{children}</div>
        </div>
    );
};
