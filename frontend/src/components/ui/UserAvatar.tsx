import React from 'react';

interface UserAvatarProps {
    user: {
        name: string;
        profilePicture?: string;
    };
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg'
    };

    const sizeClass = sizeClasses[size];

    if (user.profilePicture) {
        return (
            <img
                src={user.profilePicture}
                alt={user.name}
                className={`${sizeClass} rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm ${className}`}
                onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                }}
            />
        );
    }

    // Default avatar with initials
    return (
        <div
            className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm ${className}`}
        >
            {user.name.charAt(0).toUpperCase()}
        </div>
    );
};
