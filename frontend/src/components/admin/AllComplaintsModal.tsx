import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

interface AllComplaintsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplaintClick: (complaint: any) => void;
}

export const AllComplaintsModal: React.FC<AllComplaintsModalProps> = ({ isOpen, onClose, onComplaintClick }) => {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('ALL');

    useEffect(() => {
        if (isOpen) {
            loadComplaints();
        }
    }, [isOpen]);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://janmat-backend-r51g.onrender.com/api/admin/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(response.data);
        } catch (error) {
            console.error('Failed to load complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const filteredComplaints = filter === 'ALL'
        ? complaints
        : complaints.filter(c => c.status === filter);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="modern-card max-w-6xl w-full max-h-[90vh] overflow-hidden animate-scale-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                📋 All Complaints
                            </h2>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                Total: {complaints.length} complaints
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === status
                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                style={filter !== status ? { color: 'var(--text-secondary)' } : {}}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg" style={{ color: 'var(--text-tertiary)' }}>No complaints found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredComplaints.map((complaint) => (
                                <div
                                    key={complaint.id}
                                    onClick={() => {
                                        onComplaintClick(complaint);
                                        onClose();
                                    }}
                                    className="modern-card hover-lift cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-bold text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                                            {complaint.title}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-2 ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </div>
                                    <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                                        {complaint.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                        <span className={`px-2 py-1 rounded ${complaint.urgency === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            complaint.urgency === 'MEDIUM' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                            }`}>
                                            {complaint.urgency}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
