import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
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

    const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
        setUpdatingId(complaintId);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:3000/api/officer/update-status/${complaintId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadComplaints();
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

    // Filter complaints
    const filteredComplaints = statusFilter === 'ALL'
        ? assignedComplaints
        : assignedComplaints.filter(c => c.status === statusFilter);

    // Calculate stats
    const stats = {
        total: assignedComplaints.length,
        pending: assignedComplaints.filter(c => c.status === 'PENDING').length,
        inProgress: assignedComplaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: assignedComplaints.filter(c => c.status === 'RESOLVED').length,
    };

    const statusOptions = [
        { value: 'PENDING', label: 'Pending' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'RESOLVED', label: 'Resolved' },
        { value: 'REJECTED', label: 'Rejected' },
    ];

    return (
        <div className="min-h-screen transition-colors duration-300">
            {/* Navigation */}
            <nav className="glass shadow-lg border-b border-gray-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gradient-primary">JanMat</h1>
                                <p className="text-xs text-gray-600">Officer Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <div className="hidden md:flex flex-col items-end">
                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-600">Officer</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Stats Cards with Filter */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${statusFilter === 'ALL'
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white ring-4 ring-blue-300 scale-105'
                            : 'glass hover:shadow-xl hover:scale-102'
                            }`}
                    >
                        <div className="text-sm font-semibold mb-2 opacity-90">Total Assigned</div>
                        <div className="text-4xl font-bold">{stats.total}</div>
                    </button>
                    <button
                        onClick={() => setStatusFilter('PENDING')}
                        className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${statusFilter === 'PENDING'
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white ring-4 ring-yellow-300 scale-105'
                            : 'glass hover:shadow-xl hover:scale-102'
                            }`}
                    >
                        <div className="text-sm font-semibold mb-2 opacity-90">Pending</div>
                        <div className="text-4xl font-bold">{stats.pending}</div>
                    </button>
                    <button
                        onClick={() => setStatusFilter('IN_PROGRESS')}
                        className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${statusFilter === 'IN_PROGRESS'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white ring-4 ring-blue-300 scale-105'
                            : 'glass hover:shadow-xl hover:scale-102'
                            }`}
                    >
                        <div className="text-sm font-semibold mb-2 opacity-90">In Progress</div>
                        <div className="text-4xl font-bold">{stats.inProgress}</div>
                    </button>
                    <button
                        onClick={() => setStatusFilter('RESOLVED')}
                        className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${statusFilter === 'RESOLVED'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white ring-4 ring-green-300 scale-105'
                            : 'glass hover:shadow-xl hover:scale-102'
                            }`}
                    >
                        <div className="text-sm font-semibold mb-2 opacity-90">Resolved</div>
                        <div className="text-4xl font-bold">{stats.resolved}</div>
                    </button>
                </div>

                {/* Complaints List */}
                <div className="glass rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {statusFilter === 'ALL' ? 'All Assigned Complaints' : `${statusFilter.replace('_', ' ')} Complaints`}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Showing {filteredComplaints.length} of {assignedComplaints.length} complaints
                            </p>
                        </div>
                        {statusFilter !== 'ALL' && (
                            <Button size="sm" variant="outline" onClick={() => setStatusFilter('ALL')}>
                                Clear Filter
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600 text-lg">No complaints found</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {filteredComplaints.map((complaint) => (
                                <li key={complaint.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">{complaint.title}</h4>
                                            <p className="text-sm text-gray-600 mb-3">{complaint.description}</p>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                    complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {complaint.status}
                                                </span>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${complaint.urgency === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                    complaint.urgency === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {complaint.urgency} Priority
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Created: {new Date(complaint.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Select
                                                value={complaint.status}
                                                onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                                                options={statusOptions}
                                                disabled={updatingId === complaint.id}
                                            />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};
