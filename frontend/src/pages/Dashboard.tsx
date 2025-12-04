import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { fetchComplaintsStart, fetchComplaintsSuccess, fetchComplaintsFailure } from '../store/slices/complaintSlice';
import { CreateComplaintModal } from '../components/complaint/CreateComplaintModal';
import { EditComplaintModal } from '../components/complaint/EditComplaintModal';
import { FeedbackModal } from '../components/ui/FeedbackModal';
import { FeedbackDisplay } from '../components/ui/FeedbackDisplay';
import { HelpModal } from '../components/ui/HelpModal';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { NotificationCenter } from '../components/common/NotificationCenter';
import { EnhancedComplaintDetailsModal } from '../components/complaint/EnhancedComplaintDetailsModal';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';

export const Dashboard: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { complaints } = useSelector((state: RootState) => state.complaints);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const [viewComplaint, setViewComplaint] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // Enable real-time updates
    useRealTimeUpdates();

    useEffect(() => {
        const loadComplaints = async () => {
            dispatch(fetchComplaintsStart());
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://janmat-backend.onrender.com/api/complaints/my-complaints', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                dispatch(fetchComplaintsSuccess(response.data));
            } catch (err: any) {
                dispatch(fetchComplaintsFailure(err.message));
            }
        };

        loadComplaints();
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleComplaintUpdate = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://janmat-backend.onrender.com/api/complaints/my-complaints', {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(fetchComplaintsSuccess(response.data));
        setIsEditModalOpen(false);
        setSelectedComplaint(null);
    };

    const filteredComplaints = statusFilter
        ? complaints.filter(c => c.status === statusFilter)
        : complaints;

    const stats = [
        {
            name: 'Total Complaints',
            value: complaints.length,
            icon: '📋',
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            darkBg: 'from-blue-900/20 to-blue-800/20',
            filter: null
        },
        {
            name: 'Pending',
            value: complaints.filter(c => c.status === 'PENDING').length,
            icon: '⏳',
            gradient: 'from-yellow-500 to-orange-500',
            bgGradient: 'from-yellow-50 to-orange-100',
            darkBg: 'from-yellow-900/20 to-orange-800/20',
            filter: 'PENDING'
        },
        {
            name: 'In Progress',
            value: complaints.filter(c => c.status === 'IN_PROGRESS').length,
            icon: '🔄',
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-100',
            darkBg: 'from-purple-900/20 to-pink-800/20',
            filter: 'IN_PROGRESS'
        },
        {
            name: 'Resolved',
            value: complaints.filter(c => c.status === 'RESOLVED').length,
            icon: '✅',
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-100',
            darkBg: 'from-green-900/20 to-emerald-800/20',
            filter: 'RESOLVED'
        },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Modern Navigation */}
            <nav className="modern-card" style={{ borderRadius: '0', borderLeft: '0', borderRight: '0', borderTop: '0', position: 'sticky', top: 0, zIndex: 50 }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    JanMat
                                </h1>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Citizen Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationCenter />
                            <ThemeToggle />
                            <button
                                onClick={() => setIsHelpModalOpen(true)}
                                className="p-2 rounded-xl transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="Help & Support"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl transition-all hover:scale-105"
                                style={{ background: 'var(--bg-secondary)' }}
                            >
                                <div className="text-right">
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Welcome Banner */}
                <div className="mb-8 p-8 rounded-2xl relative overflow-hidden fade-in"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                        </h2>
                        <p className="text-white text-opacity-90">
                            Here's an overview of your complaints and their current status
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <button
                            key={stat.name}
                            onClick={() => setStatusFilter(stat.filter)}
                            className={`modern-card hover-lift transition-all duration-300 text-left relative overflow-hidden ${statusFilter === stat.filter ? 'ring-4 ring-offset-2' : ''
                                }`}
                            style={{
                                animationDelay: `${index * 100}ms`,
                                '--tw-ring-color': statusFilter === stat.filter ? 'var(--primary)' : 'transparent'
                            } as React.CSSProperties}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} dark:bg-gradient-to-br dark:${stat.darkBg} opacity-50`}></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            {stat.name}
                                        </p>
                                        <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                {statusFilter === stat.filter && (
                                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Active Filter
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Complaints Section */}
                <div className="modern-card">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {statusFilter ? `${statusFilter.replace('_', ' ')} Complaints` : 'My Complaints'}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                {statusFilter
                                    ? `Showing ${filteredComplaints.length} of ${complaints.length} complaints`
                                    : 'Track and manage all your submitted complaints'
                                }
                            </p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            {statusFilter && (
                                <button
                                    onClick={() => setStatusFilter(null)}
                                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 flex items-center justify-center gap-2"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Filter
                                </button>
                            )}
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex-1 sm:flex-none px-6 py-2 rounded-xl font-semibold text-white text-sm transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Complaint
                            </button>
                        </div>
                    </div>

                    {filteredComplaints.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--bg-secondary)' }}>
                                <svg className="w-12 h-12" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                {statusFilter ? `No ${statusFilter.toLowerCase().replace('_', ' ')} complaints found` : 'No complaints yet'}
                            </h4>
                            {!statusFilter && (
                                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                                    Click "New Complaint" to submit your first complaint
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredComplaints.map((complaint: any) => (
                                <div
                                    key={complaint.id}
                                    className="p-5 rounded-xl transition-all hover-lift cursor-pointer"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                                    onClick={() => setViewComplaint(complaint)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="text-lg font-bold flex-1" style={{ color: 'var(--text-primary)' }}>
                                            {complaint.title}
                                        </h4>
                                        <span className={`badge badge-${complaint.status.toLowerCase().replace('_', '-')}`}>
                                            {complaint.status}
                                        </span>
                                    </div>

                                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                                        {complaint.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm mb-4">
                                        {complaint.location && (
                                            <span className="flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {complaint.location}
                                            </span>
                                        )}
                                        {complaint.department && (
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-semibold">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                {complaint.department.name}
                                            </span>
                                        )}
                                        <span style={{ color: 'var(--text-tertiary)' }}>
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Timeline */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${complaint.status === 'PENDING' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded">
                                                <div
                                                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded transition-all"
                                                    style={{
                                                        width: complaint.status === 'PENDING' ? '33%' :
                                                            complaint.status === 'IN_PROGRESS' ? '66%' : '100%'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${complaint.status === 'RESOLVED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        </div>
                                        <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            <span>Submitted</span>
                                            <span>In Progress</span>
                                            <span>Resolved</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        {complaint.status === 'PENDING' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedComplaint(complaint);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
                                                style={{ background: 'var(--primary)', color: 'white' }}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                        )}
                                        {complaint.status === 'RESOLVED' && !complaint.feedback && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedComplaint(complaint);
                                                    setIsFeedbackModalOpen(true);
                                                }}
                                                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2 bg-yellow-500 text-white hover:bg-yellow-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                                Rate Resolution
                                            </button>
                                        )}
                                    </div>

                                    {complaint.feedback && (
                                        <div className="mt-4">
                                            <FeedbackDisplay feedback={complaint.feedback} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <CreateComplaintModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditComplaintModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedComplaint(null);
                }}
                complaint={selectedComplaint}
                onUpdate={handleComplaintUpdate}
            />

            {selectedComplaint && (
                <FeedbackModal
                    isOpen={isFeedbackModalOpen}
                    onClose={() => {
                        setIsFeedbackModalOpen(false);
                        setSelectedComplaint(null);
                    }}
                    complaintId={selectedComplaint.id}
                    complaintTitle={selectedComplaint.title}
                    existingFeedback={selectedComplaint.feedback}
                />
            )}

            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                role="CITIZEN"
            />

            <EnhancedComplaintDetailsModal
                complaintId={viewComplaint?.id}
                isOpen={!!viewComplaint}
                onClose={() => setViewComplaint(null)}
                onUpdate={() => {
                    // Refresh complaints list
                    const token = localStorage.getItem('token');
                    axios.get('https://janmat-backend.onrender.com/api/complaints/my-complaints', {
                        headers: { Authorization: `Bearer ${token}` },
                    }).then(response => {
                        dispatch(fetchComplaintsSuccess(response.data));
                    });
                }}
            />
        </div>
    );
};
