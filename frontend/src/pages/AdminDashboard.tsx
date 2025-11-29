import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { fetchComplaintsStart, fetchComplaintsSuccess, fetchComplaintsFailure } from '../store/slices/complaintSlice';
import { Button } from '../components/ui/Button';
import { AnalyticsCards } from '../components/admin/AnalyticsCards';
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

    // Filter complaints based on status or assignment
    const filteredComplaints = statusFilter === 'ALL'
        ? complaints
        : statusFilter === 'UNASSIGNED'
            ? complaints.filter(c => !(c as any).assignedTo)
            : complaints.filter(c => c.status === statusFilter);

    // Calculate stats
    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'PENDING').length,
        inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: complaints.filter(c => c.status === 'RESOLVED').length,
        unassigned: complaints.filter(c => !(c as any).assignedTo).length,
    };

    return (
        <div className="min-h-screen transition-colors duration-300">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">JanMat Admin</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <span className="text-gray-700">Welcome, {user?.name}</span>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0 space-y-6">
                    {/* Stats Cards with Filter */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className={`p-6 rounded-lg shadow transition-all ${statusFilter === 'ALL'
                                ? 'bg-blue-600 text-white ring-4 ring-blue-300'
                                : 'bg-white hover:shadow-lg'
                                }`}
                        >
                            <div className="text-sm font-semibold mb-1">Total Complaints</div>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </button>
                        <button
                            onClick={() => setStatusFilter('PENDING')}
                            className={`p-6 rounded-lg shadow transition-all ${statusFilter === 'PENDING'
                                ? 'bg-yellow-600 text-white ring-4 ring-yellow-300'
                                : 'bg-white hover:shadow-lg'
                                }`}
                        >
                            <div className="text-sm font-semibold mb-1">Pending</div>
                            <div className="text-3xl font-bold">{stats.pending}</div>
                        </button>
                        <button
                            onClick={() => setStatusFilter('IN_PROGRESS')}
                            className={`p-6 rounded-lg shadow transition-all ${statusFilter === 'IN_PROGRESS'
                                ? 'bg-purple-600 text-white ring-4 ring-purple-300'
                                : 'bg-white hover:shadow-lg'
                                }`}
                        >
                            <div className="text-sm font-semibold mb-1">In Progress</div>
                            <div className="text-3xl font-bold">{stats.inProgress}</div>
                        </button>
                        <button
                            onClick={() => setStatusFilter('RESOLVED')}
                            className={`p-6 rounded-lg shadow transition-all ${statusFilter === 'RESOLVED'
                                ? 'bg-green-600 text-white ring-4 ring-green-300'
                                : 'bg-white hover:shadow-lg'
                                }`}
                        >
                            <div className="text-sm font-semibold mb-1">Resolved</div>
                            <div className="text-3xl font-bold">{stats.resolved}</div>
                        </button>
                        <button
                            onClick={() => setStatusFilter('UNASSIGNED')}
                            className={`p-6 rounded-lg shadow transition-all ${statusFilter === 'UNASSIGNED'
                                ? 'bg-orange-600 text-white ring-4 ring-orange-300'
                                : 'bg-white hover:shadow-lg'
                                }`}
                        >
                            <div className="text-sm font-semibold mb-1">Unassigned</div>
                            <div className="text-3xl font-bold">{stats.unassigned}</div>
                        </button>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" onClick={() => handleExport('csv')}>Export CSV</Button>
                        <Button variant="outline" onClick={() => handleExport('pdf')}>Export PDF</Button>
                    </div>

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {statusFilter === 'ALL' ? 'All Complaints' : `${statusFilter.replace('_', ' ')} Complaints`}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Showing {filteredComplaints.length} of {complaints.length} complaints
                                </p>
                            </div>
                            {statusFilter !== 'ALL' && (
                                <Button size="sm" variant="outline" onClick={() => setStatusFilter('ALL')}>
                                    Clear Filter
                                </Button>
                            )}
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {filteredComplaints.map((complaint) => (
                                <li key={complaint.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-bold text-gray-900 truncate">{complaint.title}</h4>
                                            <p className="text-sm text-gray-500">{complaint.description}</p>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                    complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {complaint.status}
                                                </span>
                                                <span>Urgency: {complaint.urgency}</span>
                                                {(complaint as any).assignedOfficer && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        👤 {(complaint as any).assignedOfficer.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <Button size="sm" onClick={() => handleAssignClick(complaint.id, complaint.title)}>
                                                {(complaint as any).assignedTo ? 'Reassign' : 'Assign'}
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>

            {selectedComplaintId && (
                <AssignmentModal
                    isOpen={!!selectedComplaintId}
                    onClose={() => {
                        setSelectedComplaintId(null);
                        setSelectedComplaintTitle('');
                    }}
                    complaintId={selectedComplaintId}
                    complaintTitle={selectedComplaintTitle}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
};
