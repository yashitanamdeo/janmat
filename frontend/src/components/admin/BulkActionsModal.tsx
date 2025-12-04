import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

interface BulkActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedComplaintIds: string[];
    onSuccess: () => void;
}

export const BulkActionsModal: React.FC<BulkActionsModalProps> = ({ isOpen, onClose, selectedComplaintIds, onSuccess }) => {
    const [action, setAction] = useState<'assign' | 'status' | 'department' | null>(null);
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [officers, setOfficers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            loadOfficersAndDepartments();
        }
    }, [isOpen]);

    const loadOfficersAndDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const [officersRes, deptsRes] = await Promise.all([
                axios.get('https://janmat-backend.onrender.com/api/admin/officers', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('https://janmat-backend.onrender.com/api/departments', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setOfficers(officersRes.data);
            setDepartments(deptsRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleBulkAction = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (action === 'assign' && selectedOfficer) {
                // Assign all selected complaints to officer
                await Promise.all(
                    selectedComplaintIds.map(id =>
                        axios.post(`https://janmat-backend.onrender.com/api/admin/complaints/${id}/assign`,
                            { officerId: selectedOfficer },
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    )
                );
                alert(`✅ Successfully assigned ${selectedComplaintIds.length} complaints!`);
            } else if (action === 'status' && selectedStatus) {
                // Update status for all selected complaints
                await Promise.all(
                    selectedComplaintIds.map(id =>
                        axios.patch(`https://janmat-backend.onrender.com/api/complaints/${id}/status`,
                            { status: selectedStatus, comment: 'Bulk status update' },
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    )
                );
                alert(`✅ Successfully updated status for ${selectedComplaintIds.length} complaints!`);
            } else if (action === 'department' && selectedDepartment) {
                // Update department for all selected complaints
                await Promise.all(
                    selectedComplaintIds.map(id =>
                        axios.patch(`https://janmat-backend.onrender.com/api/admin/complaints/${id}/department`,
                            { departmentId: selectedDepartment },
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    )
                );
                alert(`✅ Successfully updated department for ${selectedComplaintIds.length} complaints!`);
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            alert(`❌ Failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                ⚡ Bulk Actions
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Apply actions to {selectedComplaintIds.length} selected complaint{selectedComplaintIds.length > 1 ? 's' : ''}
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
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Action Selection */}
                    <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                            Select Action
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setAction('assign')}
                                className={`p-4 rounded-xl border-2 transition-all ${action === 'assign'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">👤</div>
                                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Assign Officer</div>
                            </button>
                            <button
                                onClick={() => setAction('status')}
                                className={`p-4 rounded-xl border-2 transition-all ${action === 'status'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">🔄</div>
                                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Update Status</div>
                            </button>
                            <button
                                onClick={() => setAction('department')}
                                className={`p-4 rounded-xl border-2 transition-all ${action === 'department'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">🏢</div>
                                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Set Department</div>
                            </button>
                        </div>
                    </div>

                    {/* Action-specific inputs */}
                    {action === 'assign' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Select Officer
                            </label>
                            <select
                                value={selectedOfficer}
                                onChange={(e) => setSelectedOfficer(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <option value="">Choose an officer...</option>
                                {officers.map(officer => (
                                    <option key={officer.id} value={officer.id}>
                                        {officer.name} - {officer.department?.name || 'No Department'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {action === 'status' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Select Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-green-500"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <option value="">Choose a status...</option>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    )}

                    {action === 'department' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Select Department
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-purple-500"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <option value="">Choose a department...</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBulkAction}
                        disabled={!action || loading ||
                            (action === 'assign' && !selectedOfficer) ||
                            (action === 'status' && !selectedStatus) ||
                            (action === 'department' && !selectedDepartment)
                        }
                        className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{ background: 'var(--primary)', color: 'white' }}
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        Apply to {selectedComplaintIds.length} Complaint{selectedComplaintIds.length > 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
