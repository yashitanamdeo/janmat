import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { fetchComplaintsStart, fetchComplaintsSuccess, fetchComplaintsFailure } from '../store/slices/complaintSlice';
import { Button } from '../components/ui/Button';
import { CreateComplaintModal } from '../components/complaint/CreateComplaintModal';
import { EditComplaintModal } from '../components/complaint/EditComplaintModal';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const Dashboard: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { complaints } = useSelector((state: RootState) => state.complaints);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    useEffect(() => {
        const loadComplaints = async () => {
            dispatch(fetchComplaintsStart());
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/api/complaints/my-complaints', {
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
        const response = await axios.get('http://localhost:3000/api/complaints/my-complaints', {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(fetchComplaintsSuccess(response.data));
        setIsEditModalOpen(false);
        setSelectedComplaint(null);
    };

    // Filter complaints based on status
    const filteredComplaints = statusFilter
        ? complaints.filter(c => c.status === statusFilter)
        : complaints;

    const stats = [
        { name: 'Total Complaints', value: complaints.length, icon: '📋', color: 'from-blue-500 to-blue-600', filter: null },
        { name: 'Pending', value: complaints.filter(c => c.status === 'PENDING').length, icon: '⏳', color: 'from-yellow-500 to-yellow-600', filter: 'PENDING' },
        { name: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length, icon: '🔄', color: 'from-purple-500 to-purple-600', filter: 'IN_PROGRESS' },
        { name: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, icon: '✅', color: 'from-green-500 to-green-600', filter: 'RESOLVED' },
    ];

    return (
        <div className="min-h-screen transition-colors duration-300">
            {/* Modern Navigation */}
            <nav className="glass shadow-lg border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gradient-primary">JanMat</h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Citizen Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={() => navigate('/profile')}
                                className="hidden md:flex items-center gap-3 text-right hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl p-2 transition-colors cursor-pointer"
                            >
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="md:hidden w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-shadow"
                                title="View Profile"
                            >
                                {user?.name?.charAt(0).toUpperCase()}
                            </button>
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
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8 fade-in">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Here's an overview of your complaints and their current status.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-in-bottom">
                    {stats.map((stat, index) => (
                        <button
                            key={stat.name}
                            onClick={() => setStatusFilter(stat.filter)}
                            className={`glass rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 text-left ${statusFilter === stat.filter
                                ? 'border-blue-500 dark:border-blue-400 ring-4 ring-blue-200 dark:ring-blue-900/50 scale-105'
                                : 'border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:scale-102'
                                }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{stat.name}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Complaints Section */}
                <div className="glass rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6 scale-in">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {statusFilter ? `${statusFilter.replace('_', ' ')} Complaints` : 'My Complaints'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {statusFilter
                                    ? `Showing ${filteredComplaints.length} of ${complaints.length} complaints`
                                    : 'Track and manage all your submitted complaints'
                                }
                            </p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            {statusFilter && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStatusFilter(null)}
                                    className="flex-1 sm:flex-none"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Filter
                                </Button>
                            )}
                            <Button onClick={() => setIsCreateModalOpen(true)} className="flex-1 sm:flex-none">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Complaint
                            </Button>
                        </div>
                    </div>

                    {filteredComplaints.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                {statusFilter ? `No ${statusFilter.toLowerCase().replace('_', ' ')} complaints found` : 'No complaints yet'}
                            </p>
                            {!statusFilter && (
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                                    Click "New Complaint" to submit your first complaint
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredComplaints.map((complaint: any) => (
                                <div
                                    key={complaint.id}
                                    className="glass rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-slate-700"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{complaint.title}</h4>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                complaint.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {complaint.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{complaint.description}</p>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                            <span className={`px-2 py-1 rounded-full ${complaint.urgency === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                complaint.urgency === 'MEDIUM' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {complaint.urgency} Priority
                                            </span>
                                            {complaint.location && (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {complaint.location}
                                                </span>
                                            )}
                                            <span>
                                                Created: {new Date(complaint.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {complaint.status === 'PENDING' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedComplaint(complaint);
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Button>
                                        )}
                                    </div>
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
        </div>
    );
};
