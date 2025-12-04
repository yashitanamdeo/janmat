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
}

export const OfficerLeavePage: React.FC = () => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        type: 'CASUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLeaves();
    }, [statusFilter]);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
            const response = await axios.get(`https://janmat-backend.onrender.com/api/leaves/my-leaves${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaves(response.data);
        } catch (error) {
            console.error('Failed to fetch leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post('https://janmat-backend.onrender.com/api/leaves/apply', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Reset form and refresh
            setFormData({ type: 'CASUAL', startDate: '', endDate: '', reason: '' });
            setShowForm(false);
            fetchLeaves();
            alert('Leave application submitted successfully!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit leave application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (leaveId: string) => {
        if (!confirm('Are you sure you want to cancel this leave request?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://janmat-backend.onrender.com/api/leaves/${leaveId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeaves();
            alert('Leave request cancelled successfully');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to cancel leave');
        }
    };

    const calculateDays = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return days > 0 ? days : 0;
        }
        return 0;
    };

    const getLeaveTypeIcon = (type: string) => {
        switch (type) {
            case 'SICK': return '🏥';
            case 'CASUAL': return '🌴';
            case 'EARNED': return '🎯';
            case 'MATERNITY': return '👶';
            case 'PATERNITY': return '👨‍👶';
            case 'UNPAID': return '💼';
            default: return '📋';
        }
    };

    const getLeaveTypeColor = (type: string) => {
        switch (type) {
            case 'SICK': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'CASUAL': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'EARNED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'MATERNITY': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'PATERNITY': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'UNPAID': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const stats = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === 'PENDING').length,
        approved: leaves.filter(l => l.status === 'APPROVED').length,
        rejected: leaves.filter(l => l.status === 'REJECTED').length
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Leave Management</h1>
                        <p className="text-[var(--text-secondary)] mt-1">Apply for leave and track your requests</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold hover:scale-105 transition-all shadow-sm"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Apply for Leave
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="modern-card p-6 border-l-4 border-blue-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">Total Requests</div>
                        <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.total}</div>
                    </div>
                    <div className="modern-card p-6 border-l-4 border-yellow-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">Pending</div>
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
                </div>

                {/* Leave Application Form */}
                {showForm && (
                    <div className="modern-card p-6 mb-8 animate-fade-in">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Apply for Leave</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                        Leave Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="modern-input"
                                        required
                                    >
                                        <option value="CASUAL">🌴 Casual Leave</option>
                                        <option value="SICK">🏥 Sick Leave</option>
                                        <option value="EARNED">🎯 Earned Leave</option>
                                        <option value="MATERNITY">👶 Maternity Leave</option>
                                        <option value="PATERNITY">👨‍👶 Paternity Leave</option>
                                        <option value="UNPAID">💼 Unpaid Leave</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                        Duration: {calculateDays()} day(s)
                                    </label>
                                    <div className="text-sm text-[var(--text-secondary)]">
                                        Calculated automatically
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="modern-input"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        className="modern-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                    Reason
                                </label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="modern-input"
                                    rows={4}
                                    placeholder="Please provide a reason for your leave request..."
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting || calculateDays() <= 0}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold hover:scale-105 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="modern-card p-4 mb-6">
                    <div className="flex gap-2 flex-wrap">
                        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${statusFilter === status
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leave Requests List */}
                <div className="modern-card">
                    <div className="p-6 border-b border-[var(--border-color)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">Leave History</h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            Showing {leaves.length} request(s)
                        </p>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            </div>
                        ) : leaves.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-[var(--text-secondary)] font-medium">No leave requests found</p>
                                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                                    {statusFilter === 'ALL' ? 'Apply for your first leave' : `No ${statusFilter.toLowerCase()} requests`}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leaves.map((leave) => (
                                    <div
                                        key={leave.id}
                                        className="p-5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all border border-[var(--border-color)] hover:shadow-lg"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getLeaveTypeColor(leave.type)}`}>
                                                        {getLeaveTypeIcon(leave.type)} {leave.type}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(leave.status)}`}>
                                                        {leave.status}
                                                    </span>
                                                    <span className="text-sm text-[var(--text-tertiary)]">
                                                        {leave.days} day{leave.days > 1 ? 's' : ''}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                    <div>
                                                        <div className="text-xs text-[var(--text-tertiary)] uppercase">Start Date</div>
                                                        <div className="font-semibold text-[var(--text-primary)]">
                                                            {new Date(leave.startDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-[var(--text-tertiary)] uppercase">End Date</div>
                                                        <div className="font-semibold text-[var(--text-primary)]">
                                                            {new Date(leave.endDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-2">
                                                    <div className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Reason</div>
                                                    <div className="text-sm text-[var(--text-secondary)]">{leave.reason}</div>
                                                </div>

                                                {leave.comments && (
                                                    <div className="mt-3 p-3 rounded-lg bg-[var(--bg-primary)] border-l-4 border-purple-500">
                                                        <div className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Admin Comments</div>
                                                        <div className="text-sm text-[var(--text-secondary)]">{leave.comments}</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {leave.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleCancel(leave.id)}
                                                        className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold hover:scale-105 transition-all"
                                                    >
                                                        Cancel Request
                                                    </button>
                                                )}
                                                <div className="text-xs text-[var(--text-tertiary)] text-right">
                                                    Applied {new Date(leave.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
