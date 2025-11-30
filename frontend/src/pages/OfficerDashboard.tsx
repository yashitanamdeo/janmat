import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import axios from 'axios';
import { ThemeToggle } from '../components/ui/ThemeToggle';

interface Complaint {
    id: string;
    title: string;
    description: string;
    status: string;
    urgency: string;
    location?: string;
    createdAt: string;
    updatedAt: string;
}

export const OfficerDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [assignedComplaints, setAssignedComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:3000/api/officer/assigned-complaints',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAssignedComplaints(response.data || []);
        } catch (err) {
            console.error('Failed to load complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (complaintId: string, status: string, comment: string) => {
        setUpdatingId(complaintId);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:3000/api/officer/complaints/${complaintId}/status`,
                { status, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await loadComplaints();
            setSelectedComplaint(null);
            setNewStatus('');
            setComment('');
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const filteredComplaints = statusFilter === 'ALL'
        ? assignedComplaints
        : assignedComplaints.filter(c => c.status === statusFilter);

    const stats = [
        {
            name: 'Total Assigned',
            value: assignedComplaints.length,
            icon: '📋',
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            darkBg: 'from-blue-900/20 to-blue-800/20',
            filter: 'ALL'
        },
        {
            name: 'Pending',
            value: assignedComplaints.filter(c => c.status === 'PENDING').length,
            icon: '⏳',
            gradient: 'from-yellow-500 to-orange-500',
            bgGradient: 'from-yellow-50 to-orange-100',
            darkBg: 'from-yellow-900/20 to-orange-800/20',
            filter: 'PENDING'
        },
        {
            name: 'In Progress',
            value: assignedComplaints.filter(c => c.status === 'IN_PROGRESS').length,
            icon: '🔄',
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-100',
            darkBg: 'from-purple-900/20 to-pink-800/20',
            filter: 'IN_PROGRESS'
        },
        {
            name: 'Resolved',
            value: assignedComplaints.filter(c => c.status === 'RESOLVED').length,
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
                                style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    JanMat
                                </h1>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Officer Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={() => navigate('/profile')}
                                className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl transition-all hover:scale-105"
                                style={{ background: 'var(--bg-secondary)' }}
                            >
                                <div className="text-right">
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Officer</p>
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                                    style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
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
                    style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Welcome, Officer {user?.name?.split(' ')[0]}! 👮
                        </h2>
                        <p className="text-white text-opacity-90">
                            Manage and resolve assigned complaints efficiently
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
                                ringColor: statusFilter === stat.filter ? 'var(--primary)' : 'transparent'
                            }}
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {statusFilter === 'ALL' ? 'All Assigned Complaints' : `${statusFilter.replace('_', ' ')} Complaints`}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Showing {filteredComplaints.length} of {assignedComplaints.length} complaints
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter('ALL')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === 'ALL'
                                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter('PENDING')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setStatusFilter('IN_PROGRESS')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === 'IN_PROGRESS'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                In Progress
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="spinner"></div>
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--bg-secondary)' }}>
                                <svg className="w-12 h-12" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                No complaints found
                            </h4>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {statusFilter === 'ALL' ? 'No complaints assigned to you yet' : `No ${statusFilter.toLowerCase().replace('_', ' ')} complaints`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredComplaints.map((complaint) => (
                                <div
                                    key={complaint.id}
                                    className="p-5 rounded-xl transition-all hover-lift"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                {complaint.title}
                                            </h4>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                {complaint.description}
                                            </p>
                                        </div>
                                        <span className={`badge badge-${complaint.status.toLowerCase().replace('_', '-')} ml-4`}>
                                            {complaint.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 flex-wrap mt-4">
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className={`px-3 py-1 rounded-full font-semibold ${complaint.urgency === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                complaint.urgency === 'MEDIUM' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {complaint.urgency} Priority
                                            </span>
                                            {complaint.location && (
                                                <span className="flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    </svg>
                                                    {complaint.location}
                                                </span>
                                            )}
                                            <span style={{ color: 'var(--text-tertiary)' }}>
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSelectedComplaint(complaint);
                                                setNewStatus(complaint.status);
                                            }}
                                            disabled={updatingId === complaint.id}
                                            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
                                            style={{ background: 'var(--primary)', color: 'white' }}
                                        >
                                            {updatingId === complaint.id ? (
                                                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Update Status
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Status Update Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedComplaint(null)}>
                    <div className="modern-card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Update Complaint Status
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                            {selectedComplaint.title}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    New Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="modern-input"
                                    style={{ paddingLeft: '16px' }}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Comment (Optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment about this status update..."
                                    className="modern-input"
                                    style={{ paddingLeft: '16px', minHeight: '100px' }}
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedComplaint(null)}
                                    className="flex-1 px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedComplaint.id, newStatus, comment)}
                                    disabled={updatingId === selectedComplaint.id}
                                    className="flex-1 px-4 py-2 rounded-xl font-semibold text-white transition-all hover:scale-105"
                                    style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                                >
                                    {updatingId === selectedComplaint.id ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
