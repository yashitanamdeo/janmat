import React, { useState } from 'react';
import axios from 'axios';

interface QuickActionsPanelProps {
    onActionComplete?: () => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onActionComplete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const quickActions = [
        {
            id: 'assign-urgent',
            title: 'Auto-Assign Urgent',
            description: 'Automatically assign all urgent complaints',
            icon: '⚡',
            color: 'from-red-500 to-pink-600',
            action: async () => {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:3000/api/admin/quick-actions/assign-urgent', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        },
        {
            id: 'balance-load',
            title: 'Balance Workload',
            description: 'Redistribute complaints evenly among officers',
            icon: '⚖️',
            color: 'from-blue-500 to-cyan-600',
            action: async () => {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:3000/api/admin/quick-actions/balance-workload', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        },
        {
            id: 'send-reminders',
            title: 'Send Reminders',
            description: 'Notify officers about pending complaints',
            icon: '🔔',
            color: 'from-yellow-500 to-orange-600',
            action: async () => {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:3000/api/admin/quick-actions/send-reminders', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        },
        {
            id: 'escalate-overdue',
            title: 'Escalate Overdue',
            description: 'Mark overdue complaints as high priority',
            icon: '🚨',
            color: 'from-purple-500 to-indigo-600',
            action: async () => {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:3000/api/admin/quick-actions/escalate-overdue', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        },
        {
            id: 'generate-report',
            title: 'Weekly Report',
            description: 'Generate and download weekly summary',
            icon: '📊',
            color: 'from-green-500 to-emerald-600',
            action: async () => {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/api/admin/reports/weekly', {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `weekly-report-${new Date().toISOString().split('T')[0]}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        },
        {
            id: 'cleanup-resolved',
            title: 'Archive Resolved',
            description: 'Archive complaints resolved >30 days ago',
            icon: '🗄️',
            color: 'from-gray-500 to-slate-600',
            action: async () => {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:3000/api/admin/quick-actions/archive-resolved', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        }
    ];

    const handleAction = async (action: typeof quickActions[0]) => {
        setLoading(true);
        try {
            await action.action();
            alert(`✅ ${action.title} completed successfully!`);
            onActionComplete?.();
        } catch (error: any) {
            alert(`❌ Failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all hover:scale-110 z-50"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
                title="Quick Actions"
            >
                {isOpen ? '✕' : '⚡'}
            </button>

            {/* Quick Actions Panel */}
            {isOpen && (
                <div className="fixed bottom-28 right-8 w-96 modern-card shadow-2xl z-50 animate-slide-up">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                ⚡ Quick Actions
                            </h3>
                            <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 font-semibold">
                                Admin Tools
                            </span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {quickActions.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleAction(action)}
                                    disabled={loading}
                                    className="w-full p-4 rounded-xl text-left transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                                    style={{ background: 'var(--bg-secondary)' }}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                    <div className="relative z-10 flex items-start gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${action.color} shadow-lg flex-shrink-0`}>
                                            {action.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                                                {action.title}
                                            </h4>
                                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                {action.description}
                                            </p>
                                        </div>
                                        <svg className="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {loading && (
                            <div className="mt-4 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    Processing action...
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
                    }
                    50% {
                        box-shadow: 0 0 0 20px rgba(102, 126, 234, 0);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: var(--bg-secondary);
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--text-tertiary);
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--text-secondary);
                }
            `}</style>
        </>
    );
};
