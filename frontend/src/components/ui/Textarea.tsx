import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`block w-full px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 
                        bg-white/50 backdrop-blur-sm
                        transition-all duration-300 ease-in-out
                        placeholder:text-gray-400
                        hover:border-gray-300 hover:bg-white
                        focus:outline-none focus:border-transparent focus:ring-4 focus:ring-blue-500/20 focus:bg-white
                        resize-none
                        ${error ? 'border-red-400 focus:ring-red-500/20' : ''}
                        ${className}`}
                    {...props}
                />
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

Textarea.displayName = 'Textarea';
