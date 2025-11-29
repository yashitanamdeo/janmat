import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { logout, updateUser } from '../store/slices/authSlice';
import axios from 'axios';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const Profile: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:3000/api/auth/profile',
                { name, email },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data) {
                setSuccess('Profile updated successfully!');
                // Update user in Redux store
                dispatch(updateUser(response.data));

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const getDashboardPath = () => {
        if (user?.role === 'ADMIN') return '/admin';
        if (user?.role === 'OFFICER') return '/officer';
        return '/dashboard';
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'OFFICER':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CITIZEN':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen transition-colors duration-300">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(getDashboardPath())}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gradient-primary">JanMat</h1>
                                    <p className="text-xs text-gray-600">Back to Dashboard</p>
                                </div>
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 fade-in">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h2>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <Card variant="glass" className="shadow-xl">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{user?.name}</h3>
                                <p className="text-gray-600 mb-4">{user?.email}</p>
                                <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border ${getRoleBadgeColor(user?.role || '')}`}>
                                    {user?.role}
                                </span>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Account Active</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <Card variant="glass" className="shadow-xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    label="Full Name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    }
                                />

                                <Input
                                    label="Email Address"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                    <div className="px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600">
                                        {user?.role} (Cannot be changed)
                                    </div>
                                </div>

                                {success && (
                                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-700 font-medium">{success}</span>
                                        </div>
                                    </div>
                                )}

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

                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" isLoading={loading} className="flex-1">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Changes
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setName(user?.name || '');
                                            setEmail(user?.email || '');
                                            setError('');
                                            setSuccess('');
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};
