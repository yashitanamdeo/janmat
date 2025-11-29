import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`block w-full ${icon ? 'pl-11' : 'px-4'} py-3.5 text-base rounded-xl border-2 border-gray-200 dark:border-slate-700
                            bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm
                            text-gray-900 dark:text-white
                            transition-all duration-300 ease-in-out
                            placeholder:text-gray-400 dark:placeholder:text-gray-500
                            hover:border-gray-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800
                            focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:bg-white dark:focus:bg-slate-800
                            ${error ? 'border-red-400 focus:ring-red-500/20' : ''}
                            ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
