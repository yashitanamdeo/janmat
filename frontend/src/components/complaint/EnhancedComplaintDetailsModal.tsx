import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface EnhancedComplaintDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaintId: string;
    onUpdate?: () => void;
}

interface TimelineEvent {
    id: string;
    status: string;
    comment: string;
    updatedBy: string;
    createdAt?: string;
    timestamp?: string;
}

interface Attachment {
    id: string;
    url: string;
    type: string;
}

interface Complaint {
    id: string;
    title: string;
    description: string;
    status: string;
    urgency: string;
    category: string;
    location: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    assignedOfficer?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    department?: {
        id: string;
        name: string;
    };
    timeline: TimelineEvent[];
    attachments: Attachment[];
}

export const EnhancedComplaintDetailsModal: React.FC<EnhancedComplaintDetailsModalProps> = ({ isOpen, onClose, complaintId, onUpdate }) => {
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'attachments'>('details');
    const [newComment, setNewComment] = useState('');
    const [updating, setUpdating] = useState(false);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isOpen && complaintId) {
            fetchComplaintDetails();
        }
    }, [isOpen, complaintId]);

    const fetchComplaintDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://janmat-backend-r51g.onrender.com/api/complaints/${complaintId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaint(response.data);
        } catch (error) {
            console.error('Failed to fetch complaint details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to update status to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`https://janmat-backend-r51g.onrender.com/api/officer/complaints/${complaintId}/status`, {
                status: newStatus,
                comment: newComment || `Status updated to ${newStatus}`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewComment('');
            fetchComplaintDetails();
            if (onUpdate) onUpdate();
            alert('Status updated successfully');
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return 'N/A';
        }
    };

    if (!isOpen) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
            case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[110]" onClick={onClose}>
            <div className="modern-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : complaint ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-start bg-[var(--bg-secondary)]">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(complaint.status)}`}>
                                        {complaint.status}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(complaint.urgency)}`}>
                                        {complaint.urgency} Priority
                                    </span>
                                    <span className="text-sm text-[var(--text-tertiary)]">
                                        {formatDate(complaint.createdAt)}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{complaint.title}</h2>
                                <p className="text-[var(--text-secondary)] text-sm mt-1">ID: #{complaint.id}</p>
                            </div>
                            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-4 overflow-y-auto hidden md:block">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase mb-3">Citizen Details</h3>
                                        {complaint.user ? (
                                            <>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                                                        {complaint.user.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm text-[var(--text-primary)]">{complaint.user.name}</div>
                                                        <div className="text-xs text-[var(--text-secondary)]">{complaint.user.email}</div>
                                                    </div>
                                                </div>
                                                {complaint.user.phone && (
                                                    <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {complaint.user.phone}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-sm text-[var(--text-secondary)] italic">No user data</div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase mb-3">Assigned Officer</h3>
                                        {complaint.assignedOfficer ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                                    {complaint.assignedOfficer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-[var(--text-primary)]">{complaint.assignedOfficer.name}</div>
                                                    <div className="text-xs text-[var(--text-secondary)]">{complaint.department?.name}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-[var(--text-secondary)] italic">Not assigned yet</div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase mb-3">Location</h3>
                                        <div className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {complaint.location}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Tabs */}
                                <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                                    {['details', 'timeline', 'attachments'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`flex-1 py-3 font-semibold capitalize transition-all ${activeTab === tab
                                                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    {activeTab === 'details' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Description</h3>
                                                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                                                    {complaint.description}
                                                </p>
                                            </div>

                                            {user?.role !== 'CITIZEN' && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Update Status</h3>
                                                    <div className="space-y-4">
                                                        <textarea
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                            placeholder="Add a comment about this update..."
                                                            className="modern-input w-full"
                                                            rows={3}
                                                        />
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => handleStatusUpdate('IN_PROGRESS')}
                                                                disabled={updating || complaint.status === 'IN_PROGRESS'}
                                                                className="flex-1 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 disabled:opacity-50"
                                                            >
                                                                In Progress
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate('RESOLVED')}
                                                                disabled={updating || complaint.status === 'RESOLVED'}
                                                                className="flex-1 py-2 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200 disabled:opacity-50"
                                                            >
                                                                Resolve
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate('REJECTED')}
                                                                disabled={updating || complaint.status === 'REJECTED'}
                                                                className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'timeline' && (
                                        <div className="space-y-6">
                                            {complaint.timeline.map((event, index) => (
                                                <div key={event.id} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                                                        {index !== complaint.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                                                    </div>
                                                    <div className="pb-6">
                                                        <div className="text-sm text-[var(--text-tertiary)] mb-1">
                                                            {formatDate(event.timestamp || event.createdAt)}
                                                        </div>
                                                        <div className="font-semibold text-[var(--text-primary)]">
                                                            Status updated to {event.status}
                                                        </div>
                                                        <div className="text-sm text-[var(--text-secondary)] mt-1">
                                                            {event.comment}
                                                        </div>
                                                        <div className="text-xs text-[var(--text-tertiary)] mt-1">
                                                            Updated by: {event.updatedBy}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'attachments' && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {complaint.attachments.length === 0 ? (
                                                <div className="col-span-full text-center py-12 text-[var(--text-secondary)]">
                                                    No attachments found
                                                </div>
                                            ) : (
                                                complaint.attachments.map((att) => (
                                                    <div key={att.id} className="relative group rounded-lg overflow-hidden border border-[var(--border-color)] aspect-square">
                                                        {att.type === 'IMAGE' ? (
                                                            <img src={`https://janmat-backend-r51g.onrender.com/${att.url}`} alt="Attachment" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <a
                                                                href={`https://janmat-backend-r51g.onrender.com/${att.url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-4 py-2 bg-white rounded-full text-sm font-bold text-gray-900 shadow-lg transform scale-90 group-hover:scale-100 transition-all"
                                                            >
                                                                View
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center text-[var(--text-secondary)]">
                        Complaint not found
                    </div>
                )}
            </div>
        </div>
    );
};
