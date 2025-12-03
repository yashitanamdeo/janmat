import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

interface Officer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    department?: { name: string };
}

interface OfficersListModalProps {
    isOpen: boolean;
    onClose: () => void;
    departmentId: string;
    departmentName: string;
}

import { OfficerDetailsModal } from '../officer/OfficerDetailsModal';

export const OfficersListModal: React.FC<OfficersListModalProps> = ({ isOpen, onClose, departmentId, departmentName }) => {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && departmentId) {
            loadOfficers();
        }
    }, [isOpen, departmentId]);

    const loadOfficers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/officers', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter officers by department
            const filteredOfficers = response.data.filter((o: any) => o.departmentId === departmentId);
            setOfficers(filteredOfficers);
        } catch (error) {
            console.error('Failed to load officers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-up max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    👥 Officers
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
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : officers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Officers Found</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    This department doesn't have any assigned officers yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {officers.map((officer, index) => (
                                    <div
                                        key={officer.id}
                                        onClick={() => setSelectedOfficerId(officer.id)}
                                        className="p-5 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group"
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            borderColor: 'var(--border-color)',
                                            animationDelay: `${index * 50}ms`
                                        }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                                                {officer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg mb-1 group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                                    {officer.name}
                                                </h3>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="truncate">{officer.email}</span>
                                                    </div>
                                                    {officer.phone && (
                                                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            <span>{officer.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && officers.length > 0 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between text-sm">
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    Total Officers: <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>{officers.length}</strong>
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

            {selectedOfficerId && (
                <OfficerDetailsModal
                    isOpen={!!selectedOfficerId}
                    onClose={() => setSelectedOfficerId(null)}
                    officerId={selectedOfficerId}
                    onUpdate={loadOfficers}
                />
            )}
        </>,
        document.body
    );
};
