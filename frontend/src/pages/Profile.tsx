import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import { logout, updateUser } from '../store/slices/authSlice';
import axios from 'axios';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const Profile: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user?.gender || '',
        address: user?.address || '',
        emergencyContact: user?.emergencyContact || '',
        aadharNumber: user?.aadharNumber || '',
        designation: user?.designation || '',
        profilePicture: user?.profilePicture || '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                address: user.address || '',
                emergencyContact: user.emergencyContact || '',
                aadharNumber: user.aadharNumber || '',
                designation: user.designation || '',
                profilePicture: user.profilePicture || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500000) { // 500KB limit
                setError('File size too large. Max 500KB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    profilePicture: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:3000/api/auth/profile',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data) {
                setSuccess('Profile updated successfully!');
                dispatch(updateUser(response.data));
                setIsEditing(false);
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

    const getGradient = () => {
        if (user?.role === 'ADMIN') return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
        if (user?.role === 'OFFICER') return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Navigation */}
            <nav className="modern-card" style={{ borderRadius: '0', borderLeft: '0', borderRight: '0', borderTop: '0', position: 'sticky', top: 0, zIndex: 50 }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(getDashboardPath())}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                                style={{ background: getGradient() }}
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ background: getGradient(), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    My Profile
                                </h1>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Manage your account</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 fade-in">
                {/* Profile Header */}
                <div className="relative mb-24">
                    <div className="h-48 rounded-3xl w-full absolute top-0" style={{ background: getGradient() }}>
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                    </div>
                    <div className="relative pt-32 px-8 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-4xl font-bold text-white z-10"
                            style={{ background: getGradient() }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="mt-4 text-center">
                            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                                    {user?.role}
                                </span>
                                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="modern-card">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Personal Information</h3>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--primary)' }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Profile Picture */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Profile Picture</label>
                                <div className="flex items-center gap-4">
                                    {formData.profilePicture && (
                                        <img src={formData.profilePicture} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={!isEditing}
                                        className="modern-input p-2"
                                        style={{ opacity: isEditing ? 1 : 0.7 }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Max size 500KB</p>
                            </div>
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="modern-input"
                                        style={{ opacity: isEditing ? 1 : 0.7 }}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address *</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="modern-input"
                                        style={{ opacity: isEditing ? 1 : 0.7 }}
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="modern-input"
                                        style={{ opacity: isEditing ? 1 : 0.7 }}
                                    />
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Date of Birth</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="modern-input"
                                        style={{ opacity: isEditing ? 1 : 0.7 }}
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Gender</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="modern-input"
                                        style={{ opacity: isEditing ? 1 : 0.7 }}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Emergency Contact</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <input
                                        type="tel"
                                        name="emergencyContact"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="modern-input"
                                        style={{ opacity: isEditing ? 1 : 0.7 }}
                                        placeholder="Emergency contact number"
                                    />
                                </div>
                            </div>

                            {/* Aadhar Number (Optional) */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Aadhar Number (Optional)</label>
                                <div className="input-with-icon">
                                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                    <input
                                        type="text"
                                        name="aadharNumber"
                                        value={formData.aadharNumber}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="modern-input"
                                        style={{ opacity: isEditing ? 1 : 0.7 }}
                                        placeholder="XXXX-XXXX-XXXX"
                                        maxLength={14}
                                    />
                                </div>
                            </div>

                            {/* Designation (For Officers) */}
                            {user?.role === 'OFFICER' && (
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Designation</label>
                                    <div className="input-with-icon">
                                        <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="modern-input"
                                            style={{ opacity: isEditing ? 1 : 0.7 }}
                                            placeholder="e.g., Senior Officer, Inspector"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Address (Full Width) */}
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Address</label>
                            <div className="input-with-icon">
                                <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="modern-input min-h-[100px]"
                                    style={{ opacity: isEditing ? 1 : 0.7 }}
                                    placeholder="Enter your complete address"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl flex items-center gap-3 animate-fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 rounded-xl flex items-center gap-3 animate-fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {success}
                            </div>
                        )}

                        {isEditing && (
                            <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user?.name || '',
                                            email: user?.email || '',
                                            phone: user?.phone || '',
                                            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                                            gender: user?.gender || '',
                                            address: user?.address || '',
                                            emergencyContact: user?.emergencyContact || '',
                                            aadharNumber: user?.aadharNumber || '',
                                            designation: user?.designation || '',
                                            profilePicture: user?.profilePicture || '',
                                        });
                                        setError('');
                                    }}
                                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 shadow-lg"
                                    style={{ background: getGradient() }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
};
