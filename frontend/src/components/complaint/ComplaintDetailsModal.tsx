import React from 'react';
import { createPortal } from 'react-dom';
import { ComplaintTimeline } from './ComplaintTimeline';
import { ReadOnlyMap } from '../common/ReadOnlyMap';

interface Attachment {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
}

interface Complaint {
    id: string;
    title: string;
    description: string;
    status: string;
    urgency: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    attachments: Attachment[];
    department?: { name: string };
    assignedOfficer?: { name: string };
    timeline?: any[];
}

interface ComplaintDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaint: Complaint | null;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({ isOpen, onClose, complaint }) => {
    if (!isOpen || !complaint) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return 'text-red-600';
            case 'MEDIUM': return 'text-orange-500';
            default: return 'text-gray-500';
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50 dark:bg-slate-800/50">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${getStatusColor(complaint.status)}`}>
                                {complaint.status}
                            </span>
                            <span className={`flex items-center gap-1 text-xs font-bold ${getUrgencyColor(complaint.urgency)}`}>
                                {complaint.urgency === 'HIGH' && '🔥'}
                                {complaint.urgency} PRIORITY
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {complaint.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ID: {complaint.id} • {new Date(complaint.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {complaint.description}
                                </p>
                            </div>

                            {/* Attachments */}
                            {complaint.attachments && complaint.attachments.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Attachments</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {complaint.attachments.map((att) => (
                                            <a
                                                key={att.id}
                                                href={`http://localhost:3000/${att.url.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                                            >
                                                {att.type === 'IMAGE' ? (
                                                    <img
                                                        src={`http://localhost:3000/${att.url.replace(/\\/g, '/')}`}
                                                        alt="Attachment"
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <span className="text-white font-semibold text-sm drop-shadow-md">View</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Location Map Placeholder */}
                            {complaint.location && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Location</h3>
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{complaint.location}</span>
                                        </div>
                                        {complaint.latitude && complaint.longitude && (
                                            <ReadOnlyMap lat={complaint.latitude} lng={complaint.longitude} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Timeline */}
                            {complaint.timeline && complaint.timeline.length > 0 && (
                                <div>
                                    <ComplaintTimeline events={complaint.timeline} />
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Assignment Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-semibold">Department</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {complaint.department?.name || 'Not Assigned'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-semibold">Assigned Officer</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {complaint.assignedOfficer?.name || 'Pending Assignment'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
