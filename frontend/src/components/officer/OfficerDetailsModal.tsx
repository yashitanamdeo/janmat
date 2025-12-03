import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface OfficerDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    officerId: string;
    onUpdate?: () => void;
}

interface Officer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    departmentId: string;
    department?: {
        id: string;
        name: string;
    };
    designation?: string;
    assignedComplaints: {
        id: string;
        status: string;
    }[];
    attendance?: {
        status: string;
        date: string;
    }[];
}

export const OfficerDetailsModal: React.FC<OfficerDetailsModalProps> = ({ isOpen, onClose, officerId, onUpdate }) => {
    const [officer, setOfficer] = useState<Officer | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'performance' | 'complaints'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        designation: ''
    });

    useEffect(() => {
        if (isOpen && officerId) {
            fetchOfficerDetails();
        }
    }, [isOpen, officerId]);

    const fetchOfficerDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/officers/${officerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOfficer(response.data);
            setEditForm({
                name: response.data.name,
                phone: response.data.phone || '',
                designation: response.data.designation || ''
            });
        } catch (error) {
            console.error('Failed to fetch officer details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/admin/officers/${officerId}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditing(false);
            fetchOfficerDetails();
            if (onUpdate) onUpdate();
            alert('Officer details updated successfully');
        } catch (error) {
            console.error('Failed to update officer:', error);
            alert('Failed to update officer details');
        }
    };

    if (!isOpen) return null;

    const stats = officer ? {
        total: officer.assignedComplaints.length,
        resolved: officer.assignedComplaints.filter(c => c.status === 'RESOLVED').length,
        pending: officer.assignedComplaints.filter(c => c.status === 'PENDING').length,
        inProgress: officer.assignedComplaints.filter(c => c.status === 'IN_PROGRESS').length
    } : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[110]" onClick={onClose}>
            <div className="modern-card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : officer ? (
                    <div>
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative">
                            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-white text-purple-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                                    {officer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{officer.name}</h2>
                                    <p className="opacity-90">{officer.designation || 'Officer'} • {officer.department?.name || 'Unassigned'}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                                            {stats?.resolved} Resolved
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                                            {stats?.pending} Pending
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[var(--border-color)]">
                            {['profile', 'performance', 'complaints'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`flex-1 py-3 font-semibold capitalize transition-all ${activeTab === tab
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {activeTab === 'profile' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Personal Information</h3>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                                            >
                                                Edit Details
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleUpdate}
                                                    className="text-green-600 hover:text-green-700 font-semibold text-sm"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="text-red-600 hover:text-red-700 font-semibold text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs text-[var(--text-tertiary)] uppercase mb-1">Full Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="modern-input py-1 px-2 text-sm"
                                                />
                                            ) : (
                                                <div className="font-medium text-[var(--text-primary)]">{officer.name}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--text-tertiary)] uppercase mb-1">Email Address</label>
                                            <div className="font-medium text-[var(--text-primary)]">{officer.email}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--text-tertiary)] uppercase mb-1">Phone Number</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.phone}
                                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                    className="modern-input py-1 px-2 text-sm"
                                                />
                                            ) : (
                                                <div className="font-medium text-[var(--text-primary)]">{officer.phone || 'N/A'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--text-tertiary)] uppercase mb-1">Designation</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.designation}
                                                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                                                    className="modern-input py-1 px-2 text-sm"
                                                />
                                            ) : (
                                                <div className="font-medium text-[var(--text-primary)]">{officer.designation || 'N/A'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--text-tertiary)] uppercase mb-1">Department</label>
                                            <div className="font-medium text-[var(--text-primary)]">{officer.department?.name || 'Unassigned'}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--text-tertiary)] uppercase mb-1">Role</label>
                                            <div className="font-medium text-[var(--text-primary)]">{officer.role}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'performance' && stats && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                                            <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Assigned</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div>
                                            <div className="text-sm text-green-600/80 dark:text-green-400/80">Resolved</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</div>
                                            <div className="text-sm text-yellow-600/80 dark:text-yellow-400/80">In Progress</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.pending}</div>
                                            <div className="text-sm text-red-600/80 dark:text-red-400/80">Pending</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-[var(--text-primary)] mb-3">Resolution Rate</h4>
                                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 transition-all duration-500"
                                                style={{ width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-right text-sm text-[var(--text-secondary)] mt-1">
                                            {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}% Completed
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'complaints' && (
                                <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {officer.assignedComplaints.length === 0 ? (
                                        <div className="text-center text-[var(--text-secondary)] py-8">
                                            No complaints assigned yet
                                        </div>
                                    ) : (
                                        officer.assignedComplaints.map((complaint) => (
                                            <div key={complaint.id} className="p-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors flex justify-between items-center">
                                                <span className="font-mono text-sm text-[var(--text-secondary)]">#{complaint.id.slice(0, 8)}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                                    ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                                        complaint.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-blue-100 text-blue-700'}`}>
                                                    {complaint.status}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-[var(--text-secondary)]">
                        Officer not found
                    </div>
                )}
            </div>
        </div>
    );
};
