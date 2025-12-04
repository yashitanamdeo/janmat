import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

interface AllOfficersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AllOfficersModal: React.FC<AllOfficersModalProps> = ({ isOpen, onClose }) => {
    const [officers, setOfficers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadOfficers();
        }
    }, [isOpen]);

    const loadOfficers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://janmat-backend-r51g.onrender.com/api/admin/officers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOfficers(response.data);
        } catch (error) {
            console.error('Failed to load officers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOfficers = officers.filter(officer =>
        officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="modern-card max-w-5xl w-full max-h-[90vh] overflow-hidden animate-scale-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                👮 All Officers
                            </h2>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                Total: {officers.length} officers
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

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="modern-input pl-10"
                        />
                        <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredOfficers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg" style={{ color: 'var(--text-tertiary)' }}>No officers found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredOfficers.map((officer) => (
                                <div
                                    key={officer.id}
                                    className="modern-card hover-lift"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md bg-gradient-to-br from-blue-500 to-purple-600">
                                            {officer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                                {officer.name}
                                            </h3>
                                            <p className="text-xs truncate mb-2" style={{ color: 'var(--text-tertiary)' }}>
                                                {officer.email}
                                            </p>
                                            {officer.department && (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {officer.department.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-center" style={{ borderColor: 'var(--border-color)' }}>
                                        <div>
                                            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                                {officer._count?.assignedComplaints || 0}
                                            </div>
                                            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Assigned</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {officer._count?.resolvedComplaints || 0}
                                            </div>
                                            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Resolved</div>
                                        </div>
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
