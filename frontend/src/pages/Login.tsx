import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import axios from 'axios';
import logo from '../assets/Janmat-logo-main.png';
import { PasswordInput } from '../components/ui/PasswordInput';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
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

            if (response.data.mfaRequired) {
                setShowMFA(true);
                setMfaEmail(email);
                dispatch(loginFailure(''));
                return;
            }

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

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
            const response = await axios.post('http://localhost:3000/api/auth/verify-mfa', {
                email: mfaEmail,
                otp
            });

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

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

    if (showMFA) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                {/* Animated Background Shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center relative z-10">
                    {/* Left Side - Illustration */}
                    <div className="hidden md:flex flex-col items-center justify-center text-white">
                        <div className="relative">
                            <div className="w-64 h-64 bg-white bg-opacity-20 rounded-3xl backdrop-blur-lg p-8 flex items-center justify-center">
                                <svg className="w-48 h-48 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-2xl transform rotate-12"></div>
                            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-400 rounded-xl transform -rotate-12"></div>
                        </div>
                        <h2 className="text-3xl font-bold mt-8 mb-4">Secure Verification</h2>
                        <p className="text-center text-white text-opacity-90 max-w-sm">
                            We've sent a verification code to your email to ensure your account security
                        </p>
                    </div>

                    {/* Right Side - Form */}
                    <div className="fade-in">
                        <div className="modern-card" style={{ background: 'white' }}>
                            <div className="text-center mb-8">
                                <img src={logo} alt="JanMat" className="h-32 mx-auto object-contain" />
                                <h2 className="text-2xl font-bold mb-2" style={{ color: '#1E293B' }}>Two-Factor Authentication</h2>
                                <p className="text-sm" style={{ color: '#64748B' }}>
                                    Enter the 6-digit code sent to<br />
                                    <span className="font-semibold text-blue-600">{mfaEmail}</span>
                                </p>
                            </div>

                            <form onSubmit={handleMFASubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>Verification Code</label>
                                    <div className="input-with-icon">
                                        <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="modern-input text-center text-2xl tracking-widest font-bold"
                                            maxLength={6}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="btn-primary w-full h-12 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <>
                                            Verify & Login
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowMFA(false)}
                                    className="btn-secondary w-full h-12"
                                >
                                    Back to Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {/* Animated Background Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left Side - Illustration */}
                <div className="hidden md:flex flex-col items-center justify-center text-white slide-in">
                    <div className="relative">
                        {/* Phone Mockup */}
                        <div className="w-64 h-96 bg-white bg-opacity-20 rounded-3xl backdrop-blur-lg p-6 flex flex-col items-center justify-center">
                            <div className="w-full h-full bg-gradient-to-br from-white to-transparent opacity-30 rounded-2xl flex items-center justify-center">
                                <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400 rounded-2xl transform rotate-12 shadow-2xl"></div>
                        <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-pink-400 rounded-xl transform -rotate-12 shadow-2xl"></div>
                        <div className="absolute top-1/2 -right-8 w-12 h-12 bg-blue-300 rounded-lg transform rotate-45 shadow-xl"></div>
                    </div>
                    <h2 className="text-4xl font-bold mt-12 mb-4">Welcome Back!</h2>
                    <p className="text-center text-white text-opacity-90 max-w-sm text-lg">
                        Sign in to access your dashboard and manage complaints efficiently
                    </p>
                </div>

                {/* Right Side - Login Form */}
                <div className="fade-in">
                    <div className="modern-card" style={{ background: 'white' }}>
                        <div className="text-center mb-8">
                            <img src={logo} alt="JanMat" className="h-32 mx-auto object-contain" />
                            <p className="text-sm" style={{ color: '#64748B' }}>Citizen Complaint Management System</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>Email</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    <input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="modern-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <PasswordInput
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                label="Password"
                                required
                                autoComplete="current-password"
                            />

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded"
                                        style={{ accentColor: '#667eea' }}
                                    />
                                    <span className="text-sm font-medium" style={{ color: '#64748B' }}>Remember me</span>
                                </label>
                                <a href="#" className="text-sm font-semibold" style={{ color: '#667eea' }}>
                                    Forgot password?
                                </a>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 rounded-lg flex items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all transform hover:scale-105 hover:shadow-xl"
                                style={{ background: loading ? '#94A3B8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                            >
                                {loading ? (
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: 'white transparent white transparent' }}></div>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t" style={{ borderColor: '#E2E8F0' }}></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white" style={{ color: '#94A3B8' }}>Or continue with</span>
                                </div>
                            </div>

                            {/* Social Login Buttons */}
                            <div className="grid grid-cols-3 gap-3">
                                <button type="button" className="social-btn hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </button>
                                <button type="button" className="social-btn hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                    </svg>
                                </button>
                                <button type="button" className="social-btn hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </button>
                            </div>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center p-4 rounded-lg" style={{ background: '#F8FAFC' }}>
                            <p className="text-sm" style={{ color: '#64748B' }}>
                                Don't have an account?{' '}
                                <Link to="/register" className="font-bold" style={{ color: '#667eea' }}>
                                    Create one now →
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
