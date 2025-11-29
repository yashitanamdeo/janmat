import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import axios from 'axios';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showMFA, setShowMFA] = useState(false);
    const [otp, setOtp] = useState('');
    const [mfaEmail, setMfaEmail] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', { email, password });

            // Check if MFA is required
            if (response.data.mfaRequired) {
                setShowMFA(true);
                setMfaEmail(email);
                dispatch(loginFailure(''));
                return;
            }

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

            // Redirect based on role
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else if (user.role === 'OFFICER') {
                navigate('/officer');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
        }
    };

    const handleMFASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const response = await axios.post('http://localhost:3000/api/auth/verify', {
                email: mfaEmail,
                otp
            });
            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

            // Redirect based on role
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else if (user.role === 'OFFICER') {
                navigate('/officer');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            dispatch(loginFailure(err.response?.data?.message || 'Invalid OTP'));
        }
    };

    // If MFA is required, show OTP input screen
    if (showMFA) {
        return (
            <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                {/* Content */}
                <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 fade-in">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        {/* Logo/Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl float">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-center text-4xl font-bold text-gradient-primary mb-2">
                            Enter OTP
                        </h2>
                        <p className="text-center text-gray-600 text-lg">
                            Check your console for the 6-digit code
                        </p>
                        <p className="text-center text-sm text-gray-500 mt-2">
                            (In development, OTP is logged to backend console)
                        </p>
                    </div>

                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md slide-in-bottom">
                        <Card variant="glass" className="shadow-2xl">
                            <form className="space-y-6" onSubmit={handleMFASubmit}>
                                <Input
                                    label="6-Digit OTP"
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                        </svg>
                                    }
                                />

                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-red-700 font-medium">{error}</span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Button type="submit" className="w-full" isLoading={loading}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Verify OTP
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowMFA(false)}
                                        className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        ← Back to login
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>

                <style>{`
                    @keyframes blob {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(30px, -50px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.9); }
                    }
                    .animate-blob {
                        animation: blob 7s infinite;
                    }
                    .animation-delay-2000 {
                        animation-delay: 2s;
                    }
                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Content */}
            <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md fade-in">
                    {/* Logo/Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl float">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-center text-4xl font-bold text-gradient-primary mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-center text-gray-600 text-lg">
                        Sign in to continue to JanMat
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md slide-in-bottom">
                    <Card variant="glass" className="shadow-2xl">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input
                                label="Email address"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-red-700 font-medium">{error}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Button type="submit" className="w-full" isLoading={loading}>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Sign in
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 glass text-gray-600 dark:text-gray-300 font-medium">
                                        New to JanMat?
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <Link
                                    to="/register"
                                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors inline-flex items-center gap-2"
                                >
                                    Create an account
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};
