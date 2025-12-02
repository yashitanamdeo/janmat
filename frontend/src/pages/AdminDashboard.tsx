import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { fetchComplaintsStart, fetchComplaintsSuccess, fetchComplaintsFailure } from '../store/slices/complaintSlice';
import { AssignmentModal } from '../components/admin/AssignmentModal';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { TrendsChart } from '../components/analytics/TrendsChart';
import { PerformanceChart } from '../components/analytics/PerformanceChart';
import { HelpModal } from '../components/ui/HelpModal';
import { NotificationCenter } from '../components/common/NotificationCenter';
import { QuickActionsPanel } from '../components/admin/QuickActionsPanel';
import { AdvancedSearch } from '../components/admin/AdvancedSearch';
import { ComplaintDetailsModal } from '../components/complaint/ComplaintDetailsModal';
import { StatCard } from '../components/admin/StatCard';
import { AllComplaintsModal } from '../components/admin/AllComplaintsModal';
import { AllOfficersModal } from '../components/admin/AllOfficersModal';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';



export const AdminDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { complaints } = useSelector((state: RootState) => state.complaints);
    const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
    const [selectedComplaintTitle, setSelectedComplaintTitle] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [trendsData, setTrendsData] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [viewComplaint, setViewComplaint] = useState<any>(null);
    const [showAllComplaintsModal, setShowAllComplaintsModal] = useState(false);
    const [showAllOfficersModal, setShowAllOfficersModal] = useState(false);
    const [stats, setStats] = useState({
        totalComplaints: 0,
        pendingComplaints: 0,
        resolvedComplaints: 0,
        totalOfficers: 0,
        totalDepartments: 0,
        avgResolutionTime: 0
    });

    // Enable real-time updates
    useRealTimeUpdates();

    useEffect(() => {
        loadData();
    }, [dispatch]);

    const loadData = async () => {
        dispatch(fetchComplaintsStart());
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/complaints', {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(fetchComplaintsSuccess(response.data));

            // Load analytics
            const trendsRes = await axios.get('http://localhost:3000/api/analytics/trends', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTrendsData(trendsRes.data);

            const perfRes = await axios.get('http://localhost:3000/api/analytics/department-performance', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPerformanceData(perfRes.data);

            // Calculate stats
            const officersRes = await axios.get('http://localhost:3000/api/admin/officers', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const departmentsRes = await axios.get('http://localhost:3000/api/admin/departments', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const complaints = response.data;
            const pendingCount = complaints.filter((c: any) => c.status === 'PENDING').length;
            const resolvedCount = complaints.filter((c: any) => c.status === 'RESOLVED').length;

            // Calculate average resolution time
            const resolvedComplaints = complaints.filter((c: any) => c.status === 'RESOLVED' && c.resolvedAt);
            const avgTime = resolvedComplaints.length > 0
                ? resolvedComplaints.reduce((sum: number, c: any) => {
                    const created = new Date(c.createdAt).getTime();
                    const resolved = new Date(c.resolvedAt).getTime();
                    return sum + (resolved - created) / (1000 * 60 * 60 * 24); // Convert to days
                }, 0) / resolvedComplaints.length
                : 0;

            setStats({
                totalComplaints: complaints.length,
                pendingComplaints: pendingCount,
                resolvedComplaints: resolvedCount,
                totalOfficers: officersRes.data.length,
                totalDepartments: departmentsRes.data.length,
                avgResolutionTime: avgTime
            });
        } catch (err: any) {
            dispatch(fetchComplaintsFailure(err.message));
        }
    };

    const handleExport = async (format: 'csv' | 'pdf') => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/reports?format=${format}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `complaints_report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed', err);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleAssignClick = (complaintId: string, complaintTitle: string) => {
        setSelectedComplaintId(complaintId);
        setSelectedComplaintTitle(complaintTitle);
    };

    const handleSearchResults = (results: any[]) => {
        dispatch(fetchComplaintsSuccess(results));
        setShowAdvancedSearch(false);
    };

    const filteredComplaints = statusFilter === 'ALL'
        ? complaints
        : statusFilter === 'UNASSIGNED'
            ? complaints.filter(c => !(c as any).assignedTo)
            : complaints.filter(c => c.status === statusFilter);



    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Modern Navigation */}
            <nav className="modern-card" style={{ borderRadius: '0', borderLeft: '0', borderRight: '0', borderTop: '0', position: 'sticky', top: 0, zIndex: 50 }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    JanMat
                                </h1>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Admin Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationCenter />
                            <ThemeToggle />
                            <button
                                onClick={() => setIsHelpModalOpen(true)}
                                className="p-2 rounded-xl transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="Help & Support"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl transition-all hover:scale-105"
                                style={{ background: 'var(--bg-secondary)' }}
                            >
                                <div className="text-right">
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Administrator</p>
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Welcome Banner */}
                <div className="mb-8 p-8 rounded-2xl relative overflow-hidden fade-in"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Dashboard Overview
                            </h2>
                            <p className="text-white text-opacity-90">
                                Monitor system performance and manage complaints
                            </p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={loadData}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-white bg-opacity-20 hover:bg-opacity-30 transition-all hover:scale-105 flex items-center gap-2 border border-white border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="px-4 py-2 rounded-xl font-semibold text-blue-600 bg-white transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export CSV
                            </button>
                            <button
                                onClick={() => handleExport('pdf')}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-blue-700 bg-opacity-50 hover:bg-opacity-70 transition-all hover:scale-105 flex items-center gap-2 border border-blue-400 border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Export PDF
                            </button>
                            <button
                                onClick={() => navigate('/admin/departments')}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-purple-600 bg-opacity-50 hover:bg-opacity-70 transition-all hover:scale-105 flex items-center gap-2 border border-purple-400 border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Departments
                            </button>
                            <button
                                onClick={() => navigate('/admin/officers')}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-green-600 bg-opacity-50 hover:bg-opacity-70 transition-all hover:scale-105 flex items-center gap-2 border border-green-400 border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Officers
                            </button>
                            <button
                                onClick={() => navigate('/admin/feedback')}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-yellow-600 bg-opacity-50 hover:bg-opacity-70 transition-all hover:scale-105 flex items-center gap-2 border border-yellow-400 border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                Feedback
                            </button>
                            <button
                                onClick={() => navigate('/admin/analytics')}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Analytics
                            </button>
                            <button
                                onClick={() => setShowAdvancedSearch(true)}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Advanced Search
                            </button>
                            <button
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 shadow-lg ${showAnalytics ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                {showAnalytics ? 'Hide Charts' : 'Show Charts'}
                            </button>
                        </div>
                    </div>
                </div>

                {showAnalytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in">
                        <div className="modern-card p-6">
                            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Complaint Trends</h3>
                            <TrendsChart data={trendsData} />
                        </div>
                        <div className="modern-card p-6">
                            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Department Performance</h3>
                            <PerformanceChart data={performanceData} />
                        </div>
                    </div>
                )}

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in">
                    <StatCard
                        title="Total Complaints"
                        value={stats.totalComplaints}
                        icon={
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                        gradient="from-blue-500 to-blue-700"
                        trend={{ value: 12, isPositive: true }}
                        onClick={() => setShowAllComplaintsModal(true)}
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pendingComplaints}
                        icon={
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        gradient="from-yellow-500 to-orange-600"
                        trend={{ value: 5, isPositive: false }}
                    />
                    <StatCard
                        title="Resolved"
                        value={stats.resolvedComplaints}
                        icon={
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        gradient="from-green-500 to-emerald-600"
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatCard
                        title="Active Officers"
                        value={stats.totalOfficers}
                        icon={
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                        gradient="from-purple-500 to-indigo-600"
                        onClick={() => setShowAllOfficersModal(true)}
                    />
                </div>

                {/* Complaints Table */}
                <div className="modern-card overflow-hidden">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {statusFilter === 'ALL' ? 'All Complaints' :
                                statusFilter === 'UNASSIGNED' ? 'Unassigned Complaints' :
                                    `${statusFilter.replace('_', ' ')} Complaints`}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Showing {filteredComplaints.length} of {complaints.length} complaints
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Complaint</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Urgency</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Assigned To</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {filteredComplaints.map((complaint: any) => (
                                    <tr
                                        key={complaint.id}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                        onClick={() => setViewComplaint(complaint)}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{complaint.title}</div>
                                                <div className="text-xs mt-1 truncate max-w-xs" style={{ color: 'var(--text-secondary)' }}>{complaint.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge badge-${complaint.status.toLowerCase().replace('_', '-')}`}>
                                                {complaint.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${complaint.urgency === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                complaint.urgency === 'MEDIUM' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {complaint.urgency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {complaint.assignedOfficer ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                                                        {(complaint.assignedOfficer.name || 'U').charAt(0)}
                                                    </div>
                                                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                                        {complaint.assignedOfficer.name || 'Unknown Officer'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAssignClick(complaint.id, complaint.title)}
                                                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                                                    style={{ background: 'var(--primary)', color: 'white' }}
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleAssignClick(complaint.id, complaint.title)}
                                                className="text-sm font-medium hover:underline transition-all"
                                                style={{ color: 'var(--primary)' }}
                                            >
                                                {complaint.assignedOfficer ? 'Reassign' : 'Assign'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredComplaints.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No complaints found matching this filter.</p>
                        </div>
                    )}
                </div>
            </main>

            <AssignmentModal
                isOpen={!!selectedComplaintId}
                onClose={() => {
                    setSelectedComplaintId(null);
                    loadData();
                }}
                complaintId={selectedComplaintId || ''}
                complaintTitle={selectedComplaintTitle}
            />

            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                role="ADMIN"
            />

            {showAdvancedSearch && (
                <AdvancedSearch
                    onSearch={handleSearchResults}
                    onClose={() => setShowAdvancedSearch(false)}
                />
            )}

            <QuickActionsPanel onActionComplete={loadData} />

            <ComplaintDetailsModal
                complaint={viewComplaint}
                isOpen={!!viewComplaint}
                onClose={() => setViewComplaint(null)}
            />

            <AllComplaintsModal
                isOpen={showAllComplaintsModal}
                onClose={() => setShowAllComplaintsModal(false)}
                onComplaintClick={(complaint) => setViewComplaint(complaint)}
            />

            <AllOfficersModal
                isOpen={showAllOfficersModal}
                onClose={() => setShowAllOfficersModal(false)}
            />
        </div>
    );
};
