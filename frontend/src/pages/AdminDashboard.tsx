import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { fetchComplaintsStart, fetchComplaintsSuccess, fetchComplaintsFailure } from '../store/slices/complaintSlice';
import { AssignmentModal } from '../components/admin/AssignmentModal';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const AdminDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { complaints } = useSelector((state: RootState) => state.complaints);
    const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
    const [selectedComplaintTitle, setSelectedComplaintTitle] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        loadData();
    }, [dispatch]);

    const loadData = async () => {
        dispatch(fetchComplaintsStart());
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/complaints', {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(fetchComplaintsSuccess(response.data));
        } catch (err: any) {
            dispatch(fetchComplaintsFailure(err.message));
        }
    };

    const handleExport = async (format: 'csv' | 'pdf') => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/reports?format=${format}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `complaints_report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed', err);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleAssignClick = (complaintId: string, complaintTitle: string) => {
        setSelectedComplaintId(complaintId);
        setSelectedComplaintTitle(complaintTitle);
    };

    const filteredComplaints = statusFilter === 'ALL'
        ? complaints
        : statusFilter === 'UNASSIGNED'
            ? complaints.filter(c => !(c as any).assignedTo)
            : complaints.filter(c => c.status === statusFilter);

    const stats = [
        {
            name: 'Total Complaints',
            value: complaints.length,
            icon: '📋',
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            darkBg: 'from-blue-900/20 to-blue-800/20',
            filter: 'ALL'
        },
        {
            name: 'Unassigned',
            value: complaints.filter(c => !(c as any).assignedTo).length,
            icon: '⚠️',
            gradient: 'from-red-500 to-red-600',
            bgGradient: 'from-red-50 to-red-100',
            darkBg: 'from-red-900/20 to-red-800/20',
            filter: 'UNASSIGNED'
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
                                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    JanMat
                                </h1>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Admin Dashboard</p>
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
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Administrator</p>
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
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
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Dashboard Overview
                            </h2>
                            <p className="text-white text-opacity-90">
                                Monitor system performance and manage complaints
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={loadData}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-white bg-opacity-20 hover:bg-opacity-30 transition-all hover:scale-105 flex items-center gap-2 border border-white border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="px-4 py-2 rounded-xl font-semibold text-blue-600 bg-white transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export CSV
                            </button>
                            <button
                                onClick={() => handleExport('pdf')}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-blue-700 bg-opacity-50 hover:bg-opacity-70 transition-all hover:scale-105 flex items-center gap-2 border border-blue-400 border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export PDF
                            </button>
                        </div>
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

                {/* Complaints Table */}
                <div className="modern-card overflow-hidden">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {statusFilter === 'ALL' ? 'All Complaints' :
                                statusFilter === 'UNASSIGNED' ? 'Unassigned Complaints' :
                                    `${statusFilter.replace('_', ' ')} Complaints`}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Showing {filteredComplaints.length} of {complaints.length} complaints
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Complaint</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Urgency</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Assigned To</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
                                {filteredComplaints.map((complaint: any) => (
                                    <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{complaint.title}</div>
                                                <div className="text-xs mt-1 truncate max-w-xs" style={{ color: 'var(--text-secondary)' }}>{complaint.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge badge-${complaint.status.toLowerCase().replace('_', '-')}`}>
                                                {complaint.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${complaint.urgency === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                complaint.urgency === 'MEDIUM' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {complaint.urgency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {complaint.assignedOfficer ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                                                        {(complaint.assignedOfficer.name || 'U').charAt(0)}
                                                    </div>
                                                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                                        {complaint.assignedOfficer.name || 'Unknown Officer'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAssignClick(complaint.id, complaint.title)}
                                                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                                                    style={{ background: 'var(--primary)', color: 'white' }}
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleAssignClick(complaint.id, complaint.title)}
                                                className="text-sm font-medium hover:underline transition-all"
                                                style={{ color: 'var(--primary)' }}
                                            >
                                                {complaint.assignedOfficer ? 'Reassign' : 'Assign'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredComplaints.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No complaints found matching this filter.</p>
                        </div>
                    )}
                </div>
            </main>

            <AssignmentModal
                isOpen={!!selectedComplaintId}
                onClose={() => {
                    setSelectedComplaintId(null);
                    loadData();
                }}
                complaintId={selectedComplaintId || ''}
                complaintTitle={selectedComplaintTitle}
            />
        </div>
    );
};
