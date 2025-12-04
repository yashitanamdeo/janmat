import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess } from '../store/slices/authSlice';
import axios from 'axios';
import logo from '../assets/Janmat-logo-main.png';
import { PasswordInput } from '../components/ui/PasswordInput';
import { OAuthButtons } from '../components/auth/OAuthButtons';

export const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const calculatePasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 8) strength++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
        if (/\d/.test(pass)) strength++;
        if (/[^a-zA-Z\d]/.test(pass)) strength++;
        return strength;
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setPasswordStrength(calculatePasswordStrength(value));
    };

    const getStrengthColor = () => {
        if (passwordStrength === 0) return '#E2E8F0';
        if (passwordStrength === 1) return '#EF4444';
        if (passwordStrength === 2) return '#F59E0B';
        if (passwordStrength === 3) return '#10B981';
        return '#059669';
    };

    const getStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength === 1) return 'Weak';
        if (passwordStrength === 2) return 'Fair';
        if (passwordStrength === 3) return 'Good';
        return 'Strong';
    };

    const calculateAge = (dob: string): number => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Age validation
        if (!dateOfBirth) {
            setError('Please enter your date of birth');
            return;
        }

        const age = calculateAge(dateOfBirth);
        if (age < 18) {
            setError('You must be at least 18 years old to register');
            return;
        }

        if (!agreeTerms) {
            setError('Please agree to the terms and conditions');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('https://janmat-backend-r51g.onrender.com/api/auth/register', {
                name,
                email,
                phone,
                dateOfBirth,
                password,
                role: 'CITIZEN'
            });

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            {/* Animated Background Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left Side - Illustration */}
                <div className="hidden md:flex flex-col items-center justify-center text-white slide-in">
                    <div className="relative">
                        {/* Phone Mockup with User Icon */}
                        <div className="w-64 h-96 bg-white bg-opacity-20 rounded-3xl backdrop-blur-lg p-6 flex flex-col items-center justify-center">
                            <div className="w-full h-full bg-gradient-to-br from-white to-transparent opacity-30 rounded-2xl flex flex-col items-center justify-center gap-4">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-16 h-16" style={{ color: '#f5576c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="space-y-2 w-full px-4">
                                    <div className="h-3 bg-white rounded-full opacity-50"></div>
                                    <div className="h-3 bg-white rounded-full opacity-40 w-3/4"></div>
                                    <div className="h-3 bg-white rounded-full opacity-30 w-1/2"></div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-300 rounded-2xl transform rotate-12 shadow-2xl"></div>
                        <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-purple-400 rounded-xl transform -rotate-12 shadow-2xl"></div>
                        <div className="absolute top-1/2 -right-8 w-12 h-12 bg-blue-300 rounded-lg transform rotate-45 shadow-xl"></div>
                        <div className="absolute bottom-1/4 -left-8 w-10 h-10 bg-green-300 rounded-lg transform -rotate-12 shadow-xl"></div>
                    </div>
                    <h2 className="text-4xl font-bold mt-12 mb-4">Join JanMat Today!</h2>
                    <p className="text-center text-white text-opacity-90 max-w-sm text-lg">
                        Create your account and start managing your complaints efficiently
                    </p>
                </div>

                {/* Right Side - Register Form */}
                <div className="fade-in">
                    <div className="modern-card" style={{ background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="text-center mb-6">
                            <img src={logo} alt="JanMat" className="h-32 mx-auto object-contain" />
                            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1E293B' }}>
                                Create Account
                            </h1>
                            <p className="text-sm" style={{ color: '#64748B' }}>Sign up to get started with JanMat</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>Full Name</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="modern-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>Email Address</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="modern-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>Phone Number</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="modern-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Date of Birth Input */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>Date of Birth</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        className="modern-input"
                                        max={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                {dateOfBirth && calculateAge(dateOfBirth) < 18 && (
                                    <p className="text-xs text-red-600 mt-1">
                                        You must be at least 18 years old to register
                                    </p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <PasswordInput
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    placeholder="••••••••"
                                    label="Password"
                                    required
                                    autoComplete="new-password"
                                />
                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        background: level <= passwordStrength ? getStrengthColor() : '#E2E8F0'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs font-semibold" style={{ color: getStrengthColor() }}>
                                            {getStrengthText()} {getStrengthText() && 'Password'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Input */}
                            <PasswordInput
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                label="Confirm Password"
                                required
                                autoComplete="new-password"
                                name="confirmPassword"
                            />

                            {/* Terms & Conditions */}
                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="w-5 h-5 mt-0.5 rounded"
                                    style={{ accentColor: '#f5576c' }}
                                />
                                <span className="text-sm" style={{ color: '#64748B' }}>
                                    I agree to the{' '}
                                    <a href="#" className="font-semibold" style={{ color: '#f5576c' }}>
                                        Terms and Conditions
                                    </a>
                                    {' '}and{' '}
                                    <a href="#" className="font-semibold" style={{ color: '#f5576c' }}>
                                        Privacy Policy
                                    </a>
                                </span>
                            </label>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 rounded-lg flex items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all transform hover:scale-105 hover:shadow-xl"
                                style={{ background: loading ? '#94A3B8' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                            >
                                {loading ? (
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: 'white transparent white transparent' }}></div>
                                ) : (
                                    <>
                                        <span>Create Account</span>
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
                                    <span className="px-4 bg-white" style={{ color: '#94A3B8' }}>Or sign up with</span>
                                </div>
                            </div>

                            {/* Social Signup Buttons */}
                            <OAuthButtons />
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center p-4 rounded-lg" style={{ background: '#FEF3F4' }}>
                            <p className="text-sm" style={{ color: '#64748B' }}>
                                Already have an account?{' '}
                                <Link to="/login" className="font-bold" style={{ color: '#f5576c' }}>
                                    Sign in instead →
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
