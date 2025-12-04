import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = `inline-flex items-center justify-center rounded-xl font-semibold 
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        active:scale-95`;

    const variants = {
        primary: `bg-gradient-to-r from-blue-600 to-blue-700 text-white 
            hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:-translate-y-0.5
            focus:ring-blue-500/50 shadow-md`,
        secondary: `bg-gradient-to-r from-gray-600 to-gray-700 text-white 
            hover:from-gray-700 hover:to-gray-800 hover:shadow-lg hover:-translate-y-0.5
            focus:ring-gray-500/50 shadow-md`,
        danger: `bg-gradient-to-r from-red-600 to-red-700 text-white 
            hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:-translate-y-0.5
            focus:ring-red-500/50 shadow-md`,
        outline: `border-2 border-gray-300 bg-white text-gray-700 
            hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md hover:-translate-y-0.5
            focus:ring-blue-500/50`,
        gradient: `bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white 
            hover:shadow-xl hover:-translate-y-0.5 hover:shadow-purple-500/50
            focus:ring-purple-500/50 shadow-lg
            bg-[length:200%_auto] hover:bg-right-bottom
            animate-gradient`,
    };

    const sizes = {
        sm: 'px-4 py-2.5 text-sm',
        md: 'px-6 py-3.5 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Loading...
                </>
            ) : children}
        </button>
    );
};
