import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

interface Complaint {
    id: string;
    title: string;
    description: string;
    status: string;
    urgency: string;
    createdAt: string;
    assignedOfficer?: { name: string };
}

interface DepartmentComplaintsModalProps {
    isOpen: boolean;
    onClose: () => void;
    departmentId: string;
    departmentName: string;
    onComplaintClick?: (complaint: Complaint) => void;
}

import { EnhancedComplaintDetailsModal } from '../complaint/EnhancedComplaintDetailsModal';

export const DepartmentComplaintsModal: React.FC<DepartmentComplaintsModalProps> = ({
    isOpen,
    onClose,
    departmentId,
    departmentName,
    onComplaintClick
}) => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
    const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && departmentId) {
            loadComplaints();
        }
    }, [isOpen, departmentId]);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://janmat-backend-r51g.onrender.com/api/admin/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter complaints by department
            const filteredComplaints = response.data.filter((c: any) => c.departmentId === departmentId);
            setComplaints(filteredComplaints);
        } catch (error) {
            console.error('Failed to load complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    const getUrgencyIcon = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return '🔥';
            case 'MEDIUM': return '⚡';
            default: return '📋';
        }
    };

    const filteredComplaints = complaints.filter(c => {
        if (filter === 'pending') return c.status === 'PENDING' || c.status === 'IN_PROGRESS';
        if (filter === 'resolved') return c.status === 'RESOLVED';
        return true;
    });

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length,
        resolved: complaints.filter(c => c.status === 'RESOLVED').length
    };

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    📋 Department Complaints
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {departmentName}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setFilter('all')}
                                className={`p-3 rounded-xl transition-all ${filter === 'all' ? 'ring-2 ring-blue-500 bg-white dark:bg-slate-800' : 'bg-white/50 dark:bg-slate-800/50'}`}
                            >
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`p-3 rounded-xl transition-all ${filter === 'pending' ? 'ring-2 ring-yellow-500 bg-white dark:bg-slate-800' : 'bg-white/50 dark:bg-slate-800/50'}`}
                            >
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
                            </button>
                            <button
                                onClick={() => setFilter('resolved')}
                                className={`p-3 rounded-xl transition-all ${filter === 'resolved' ? 'ring-2 ring-green-500 bg-white dark:bg-slate-800' : 'bg-white/50 dark:bg-slate-800/50'}`}
                            >
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Resolved</div>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredComplaints.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Complaints Found</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {filter === 'all' ? 'This department has no complaints.' : `No ${filter} complaints found.`}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredComplaints.map((complaint, index) => (
                                    <div
                                        key={complaint.id}
                                        className="p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            borderColor: 'var(--border-color)',
                                            animationDelay: `${index * 30}ms`
                                        }}
                                        onClick={() => setSelectedComplaintId(complaint.id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xl">{getUrgencyIcon(complaint.urgency)}</span>
                                                    <h3 className="font-bold text-lg truncate" style={{ color: 'var(--text-primary)' }}>
                                                        {complaint.title}
                                                    </h3>
                                                </div>
                                                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                                    {complaint.description}
                                                </p>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(complaint.status)}`}>
                                                        {complaint.status}
                                                    </span>
                                                    {complaint.assignedOfficer && (
                                                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {complaint.assignedOfficer.name}
                                                        </span>
                                                    )}
                                                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && filteredComplaints.length > 0 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between text-sm">
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    Showing <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>{filteredComplaints.length}</strong> of {complaints.length} complaints
                                </span>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                                    style={{ background: 'var(--primary)', color: 'white' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedComplaintId && (
                <EnhancedComplaintDetailsModal
                    isOpen={!!selectedComplaintId}
                    onClose={() => setSelectedComplaintId(null)}
                    complaintId={selectedComplaintId}
                    onUpdate={loadComplaints}
                />
            )}
        </>,
        document.body
    );
};
