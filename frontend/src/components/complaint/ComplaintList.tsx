import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { EditComplaintModal } from './EditComplaintModal';
import { removeComplaint } from '../../store/slices/complaintSlice';
import axios from 'axios';

export const ComplaintList: React.FC = () => {
    const dispatch = useDispatch();
    const { complaints, loading, error } = useSelector((state: RootState) => state.complaints);
    const [editingComplaint, setEditingComplaint] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleEdit = (complaint: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingComplaint(complaint);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (complaintId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
            return;
        }

        setDeletingId(complaintId);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:3000/api/complaints/${complaintId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            dispatch(removeComplaint(complaintId));
        } catch (err) {
            console.error('Failed to delete complaint:', err);
            alert('Failed to delete complaint. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdate = () => {
        // Refresh will happen via Redux
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading complaints...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl">
                <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 font-semibold">{error}</span>
                </div>
            </div>
        );
    }

    if (complaints.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No complaints yet</h3>
                <p className="text-gray-600">Click "New Complaint" to submit your first complaint</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'HIGH':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'LOW':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return '✅';
            case 'IN_PROGRESS':
                return '🔄';
            case 'PENDING':
                return '⏳';
            default:
                return '📋';
        }
    };

    return (
        <>
            <div className="space-y-4">
                {complaints.map((complaint, index) => (
                    <div
                        key={complaint.id}
                        onClick={() => handleEdit(complaint)}
                        className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative group"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => handleEdit(complaint, e)}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="Edit complaint"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => handleDelete(complaint.id, e)}
                                disabled={deletingId === complaint.id}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete complaint"
                            >
                                {deletingId === complaint.id ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="text-2xl mt-1">{getStatusIcon(complaint.status)}</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 pr-20">{complaint.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{complaint.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(complaint.status)}`}>
                                        {complaint.status.replace('_', ' ')}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getUrgencyColor(complaint.urgency)}`}>
                                        {complaint.urgency} PRIORITY
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                    {complaint.location && (
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Location
                                        </span>
                                    )}
                                    {complaint.attachments && complaint.attachments.length > 0 && (
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            {complaint.attachments.length} {complaint.attachments.length === 1 ? 'File' : 'Files'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Click to edit hint */}
                        <div className="mt-4 pt-4 border-t border-gray-100 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-gray-500">Click anywhere to edit this complaint</p>
                        </div>
                    </div>
                ))}
            </div>

            <EditComplaintModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingComplaint(null);
                }}
                complaint={editingComplaint}
                onUpdate={handleUpdate}
            />
        </>
    );
};
