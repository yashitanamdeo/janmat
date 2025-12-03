import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Leave {
    id: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    reason: string;
    days: number;
    comments?: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        department?: {
            id: string;
            name: string;
        };
    };
}

interface Department {
    id: string;
    name: string;
}

export const AdminLeavePage: React.FC = () => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [comments, setComments] = useState('');
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchLeaves();
    }, [statusFilter, departmentFilter]);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(response.data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (departmentFilter) params.append('departmentId', departmentFilter);

            const response = await axios.get(`http://localhost:3000/api/leaves/all?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaves(response.data);
        } catch (error) {
            console.error('Failed to fetch leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedLeave || !actionType) return;

        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = actionType === 'approve' ? 'approve' : 'reject';

            await axios.post(
                `http://localhost:3000/api/leaves/${selectedLeave.id}/${endpoint}`,
                { comments },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSelectedLeave(null);
            setActionType(null);
            setComments('');
            fetchLeaves();
            alert(`Leave ${actionType}d successfully!`);
        } catch (error: any) {
            alert(error.response?.data?.message || `Failed to ${actionType} leave`);
        } finally {
            setProcessing(false);
        }
    };

    const getLeaveTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            SICK: '🏥', CASUAL: '🌴', EARNED: '🎯',
            MATERNITY: '👶', PATERNITY: '👨‍👶', UNPAID: '💼'
        };
        return icons[type] || '📋';
    };

    const getLeaveTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            SICK: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            CASUAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            EARNED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            MATERNITY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            PATERNITY: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            UNPAID: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        };
        return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    const stats = {
        pending: leaves.filter(l => l.status === 'PENDING').length,
        approved: leaves.filter(l => l.status === 'APPROVED').length,
        rejected: leaves.filter(l => l.status === 'REJECTED').length,
        total: leaves.length
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Leave Management</h1>
                        <p className="text-[var(--text-secondary)] mt-1">Review and manage leave requests</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold hover:scale-105 transition-all shadow-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="modern-card p-6 border-l-4 border-yellow-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">Pending Requests</div>
                        <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.pending}</div>
                    </div>
                    <div className="modern-card p-6 border-l-4 border-green-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">Approved</div>
                        <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.approved}</div>
                    </div>
                    <div className="modern-card p-6 border-l-4 border-red-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">Rejected</div>
                        <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.rejected}</div>
                    </div>
                    <div className="modern-card p-6 border-l-4 border-blue-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">Total</div>
                        <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.total}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="modern-card p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex gap-2 flex-wrap flex-1">
                            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status === 'ALL' ? '' : status)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${(status === 'ALL' && !statusFilter) || statusFilter === status
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="modern-input py-2 px-4"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Leave Requests Table */}
                <div className="modern-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Officer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Department</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Leave Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Duration</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                                            No leave requests found
                                        </td>
                                    </tr>
                                ) : (
                                    leaves.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                        {leave.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[var(--text-primary)]">{leave.user.name}</div>
                                                        <div className="text-xs text-[var(--text-secondary)]">{leave.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-[var(--text-secondary)]">
                                                    {leave.user.department?.name || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLeaveTypeColor(leave.type)}`}>
                                                    {getLeaveTypeIcon(leave.type)} {leave.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-semibold text-[var(--text-primary)]">{leave.days} day(s)</div>
                                                    <div className="text-xs text-[var(--text-tertiary)]">
                                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {leave.status === 'PENDING' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLeave(leave);
                                                                setActionType('approve');
                                                            }}
                                                            className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold hover:scale-105 transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLeave(leave);
                                                                setActionType('reject');
                                                            }}
                                                            className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold hover:scale-105 transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[var(--text-tertiary)]">
                                                        {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {selectedLeave && actionType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => { setSelectedLeave(null); setActionType(null); setComments(''); }}>
                    <div className="modern-card max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                                {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div className="p-4 rounded-xl bg-[var(--bg-secondary)]">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Officer</div>
                                            <div className="font-semibold text-[var(--text-primary)]">{selectedLeave.user.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Department</div>
                                            <div className="font-semibold text-[var(--text-primary)]">{selectedLeave.user.department?.name || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Leave Type</div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getLeaveTypeColor(selectedLeave.type)}`}>
                                                {getLeaveTypeIcon(selectedLeave.type)} {selectedLeave.type}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Duration</div>
                                            <div className="font-semibold text-[var(--text-primary)]">{selectedLeave.days} day(s)</div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Period</div>
                                        <div className="font-semibold text-[var(--text-primary)]">
                                            {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Reason</div>
                                        <div className="text-sm text-[var(--text-secondary)]">{selectedLeave.reason}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                        Comments {actionType === 'reject' && <span className="text-red-500">*</span>}
                                    </label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        className="modern-input"
                                        rows={4}
                                        placeholder={`Add comments for ${actionType}...`}
                                        required={actionType === 'reject'}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAction}
                                    disabled={processing || (actionType === 'reject' && !comments.trim())}
                                    className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${actionType === 'approve'
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                                            : 'bg-gradient-to-r from-red-600 to-rose-600'
                                        }`}
                                >
                                    {processing ? 'Processing...' : `${actionType === 'approve' ? 'Approve' : 'Reject'} Leave`}
                                </button>
                                <button
                                    onClick={() => { setSelectedLeave(null); setActionType(null); setComments(''); }}
                                    className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold hover:scale-105 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
