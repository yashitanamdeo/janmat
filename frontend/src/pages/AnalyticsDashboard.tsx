import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { OfficersListModal } from '../components/analytics/OfficersListModal';
import { DepartmentComplaintsModal } from '../components/analytics/DepartmentComplaintsModal';

interface DepartmentStats {
    departmentId: string;
    departmentName: string;
    totalComplaints: number;
    resolved: number;
    pending: number;
    avgResolutionTime: number;
    satisfactionScore: number;
    activeOfficers: number;
}

export const AnalyticsDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    // Modal states
    const [officersModal, setOfficersModal] = useState<{ isOpen: boolean; deptId: string; deptName: string }>({ isOpen: false, deptId: '', deptName: '' });
    const [complaintsModal, setComplaintsModal] = useState<{ isOpen: boolean; deptId: string; deptName: string }>({ isOpen: false, deptId: '', deptName: '' });

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Fetch department performance
            const deptResponse = await axios.get('https://janmat-backend-r51g.onrender.com/api/analytics/department-performance', {
                headers: { Authorization: `Bearer ${token}` },
                params: { timeRange }
            });

            // Transform backend response to match frontend interface
            const transformedData = deptResponse.data.map((dept: any) => ({
                departmentId: dept.departmentId,
                departmentName: dept.name, // Backend sends 'name', we need 'departmentName'
                totalComplaints: dept.total, // Backend sends 'total', we need 'totalComplaints'
                resolved: dept.resolved,
                pending: dept.pending,
                avgResolutionTime: dept.avgResolutionTime,
                satisfactionScore: dept.satisfactionScore,
                activeOfficers: dept.activeOfficers
            }));

            setDepartmentStats(transformedData);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getPerformanceBg = (score: number) => {
        if (score >= 80) return 'from-green-500/20 to-emerald-500/20';
        if (score >= 60) return 'from-yellow-500/20 to-orange-500/20';
        return 'from-red-500/20 to-pink-500/20';
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="modern-card" style={{ borderRadius: '0', borderLeft: '0', borderRight: '0', borderTop: '0' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-primary)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    📊 Analytics Dashboard
                                </h1>
                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    Comprehensive performance insights and trends
                                </p>
                            </div>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            {(['7d', '30d', '90d'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    style={timeRange !== range ? { color: 'var(--text-secondary)' } : {}}
                                >
                                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Top Performers */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                🏆 Top Performing Departments
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {departmentStats
                                    .sort((a, b) => b.satisfactionScore - a.satisfactionScore)
                                    .slice(0, 6)
                                    .map((dept, index) => (
                                        <div
                                            key={dept.departmentId}
                                            className="modern-card hover-lift relative overflow-hidden"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${getPerformanceBg(dept.satisfactionScore)} opacity-50`}></div>
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                                                    'bg-gradient-to-br from-blue-400 to-blue-600'
                                                            } shadow-lg`}>
                                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                                {dept.departmentName}
                                                            </h3>
                                                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                                {dept.activeOfficers} Active Officers
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`text-3xl font-bold ${getPerformanceColor(dept.satisfactionScore)}`}>
                                                        {dept.satisfactionScore}%
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                                        <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                                            {dept.totalComplaints}
                                                        </div>
                                                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total</div>
                                                    </div>
                                                    <div className="text-center p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                                            {dept.resolved}
                                                        </div>
                                                        <div className="text-xs text-green-600 dark:text-green-400">Resolved</div>
                                                    </div>
                                                    <div className="text-center p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                                        <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                                            {dept.pending}
                                                        </div>
                                                        <div className="text-xs text-orange-600 dark:text-orange-400">Pending</div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span style={{ color: 'var(--text-secondary)' }}>Avg Resolution Time</span>
                                                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                            {(dept.avgResolutionTime || 0).toFixed(1)} days
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* All Departments Table */}
                        <div className="modern-card overflow-hidden">
                            <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    📈 All Departments Performance
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead style={{ background: 'var(--bg-secondary)' }}>
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Department</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Officers</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Resolved</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Pending</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Avg Time</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]">
                                        {departmentStats
                                            .sort((a, b) => b.satisfactionScore - a.satisfactionScore)
                                            .map((dept) => (
                                                <tr key={dept.departmentId} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                            {dept.departmentName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => setOfficersModal({ isOpen: true, deptId: dept.departmentId, deptName: dept.departmentName })}
                                                            className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all cursor-pointer hover:scale-110"
                                                        >
                                                            {dept.activeOfficers}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => setComplaintsModal({ isOpen: true, deptId: dept.departmentId, deptName: dept.departmentName })}
                                                            className="font-semibold hover:underline cursor-pointer transition-all hover:scale-110"
                                                            style={{ color: 'var(--primary)' }}
                                                        >
                                                            {dept.totalComplaints}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-green-600 dark:text-green-400 font-semibold">
                                                            {dept.resolved}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-orange-600 dark:text-orange-400 font-semibold">
                                                            {dept.pending}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                                                        {(dept.avgResolutionTime || 0).toFixed(1)}d
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full bg-gradient-to-r ${dept.satisfactionScore >= 80 ? 'from-green-500 to-emerald-600' :
                                                                        dept.satisfactionScore >= 60 ? 'from-yellow-500 to-orange-500' :
                                                                            'from-red-500 to-pink-600'
                                                                        }`}
                                                                    style={{ width: `${dept.satisfactionScore}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className={`font-bold ${getPerformanceColor(dept.satisfactionScore)}`}>
                                                                {dept.satisfactionScore}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Modals */}
            <OfficersListModal
                isOpen={officersModal.isOpen}
                onClose={() => setOfficersModal({ isOpen: false, deptId: '', deptName: '' })}
                departmentId={officersModal.deptId}
                departmentName={officersModal.deptName}
            />

            <DepartmentComplaintsModal
                isOpen={complaintsModal.isOpen}
                onClose={() => setComplaintsModal({ isOpen: false, deptId: '', deptName: '' })}
                departmentId={complaintsModal.deptId}
                departmentName={complaintsModal.deptName}
            />
        </div>
    );
};
