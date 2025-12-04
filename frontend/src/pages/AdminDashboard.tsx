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
import { EnhancedComplaintDetailsModal } from '../components/complaint/EnhancedComplaintDetailsModal';
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
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [stats, setStats] = useState({
        totalComplaints: 0,
        pendingComplaints: 0,
        resolvedComplaints: 0,
        totalOfficers: 0,
        totalDepartments: 0,
        avgResolutionTime: 0
    });
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Enable real-time updates
    useRealTimeUpdates();

    useEffect(() => {
        loadData();
    }, [dispatch]);

    const loadData = async () => {
        setIsSearchActive(false);
        dispatch(fetchComplaintsStart());

        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // Fetch complaints
            const complaintsRes = await axios.get('https://janmat-backend.onrender.com/api/admin/complaints', { headers });
            dispatch(fetchComplaintsSuccess(complaintsRes.data));
        } catch (err: any) {
            dispatch(fetchComplaintsFailure(err.message));
        }

        // Fetch other data independently
        try {
            const [trendsRes, perfRes, officersRes, departmentsRes] = await Promise.allSettled([
                axios.get('https://janmat-backend.onrender.com/api/analytics/trends', { headers }),
                axios.get('https://janmat-backend.onrender.com/api/analytics/department-performance', { headers }),
                axios.get('https://janmat-backend.onrender.com/api/admin/officers', { headers }),
                axios.get('https://janmat-backend.onrender.com/api/admin/departments', { headers })
            ]);

            if (trendsRes.status === 'fulfilled') setTrendsData(trendsRes.value.data);
            if (perfRes.status === 'fulfilled') setPerformanceData(perfRes.value.data);

            const officersCount = officersRes.status === 'fulfilled' ? officersRes.value.data.length : 0;
            const departmentsCount = departmentsRes.status === 'fulfilled' ? departmentsRes.value.data.length : 0;

            setStats(prev => ({
                ...prev,
                totalOfficers: officersCount,
                totalDepartments: departmentsCount
            }));

        } catch (err) {
            console.error('Error loading dashboard data', err);
        }
    };

    const handleExport = async (format: 'csv' | 'pdf') => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://janmat-backend.onrender.com/api/admin/reports?format=${format}`, {
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
        setIsSearchActive(true);
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const clearFilters = () => {
        setStatusFilter('ALL');
        setCurrentPage(1);
        loadData();
    };

    const filteredComplaints = statusFilter === 'ALL'
        ? complaints
        : statusFilter === 'UNASSIGNED'
            ? complaints.filter(c => !(c as any).assignedTo)
            : complaints.filter(c => c.status === statusFilter);

    const sortedComplaints = [...filteredComplaints].sort((a: any, b: any) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (sortField === 'assignedOfficer') {
            const aName = a.assignedOfficer?.name || '';
            const bName = b.assignedOfficer?.name || '';
            return sortOrder === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedComplaints = sortedComplaints.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedComplaints.length / itemsPerPage);



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
                            {/* <button
                                onClick={() => setStatusFilter('UNASSIGNED')}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-red-500 bg-opacity-80 hover:bg-opacity-100 transition-all hover:scale-105 flex items-center gap-2 border border-red-400 border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Unassigned
                            </button> */}
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
                                onClick={() => navigate('/admin/attendance')}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-cyan-600 bg-opacity-50 hover:bg-opacity-70 transition-all hover:scale-105 flex items-center gap-2 border border-cyan-400 border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Attendance
                            </button>
                            <button
                                onClick={() => navigate('/admin/leaves')}
                                className="px-4 py-2 rounded-xl font-semibold text-white bg-purple-600 bg-opacity-50 hover:bg-opacity-70 transition-all hover:scale-105 flex items-center gap-2 border border-purple-400 border-opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Leave Management
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
                            {isSearchActive && (
                                <button
                                    onClick={loadData}
                                    className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Search
                                </button>
                            )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 fade-in">
                    <StatCard
                        title="Total Complaints"
                        value={complaints.length}
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
                        title="Unassigned"
                        value={complaints.filter((c: any) => !c.assignedOfficer).length}
                        icon={
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        }
                        gradient="from-red-500 to-red-600"
                        onClick={() => setStatusFilter('UNASSIGNED')}
                    />
                    <StatCard
                        title="Pending"
                        value={complaints.filter((c: any) => c.status === 'PENDING').length}
                        icon={
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        gradient="from-yellow-500 to-orange-600"
                        trend={{ value: 5, isPositive: false }}
                        onClick={() => setStatusFilter('PENDING')}
                    />
                    <StatCard
                        title="Resolved"
                        value={complaints.filter((c: any) => c.status === 'RESOLVED').length}
                        icon={
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        gradient="from-green-500 to-emerald-600"
                        trend={{ value: 8, isPositive: true }}
                        onClick={() => setStatusFilter('RESOLVED')}
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
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {statusFilter === 'ALL' ? 'All Complaints' :
                                    statusFilter === 'UNASSIGNED' ? 'Unassigned Complaints' :
                                        `${statusFilter.replace('_', ' ')} Complaints`}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Showing {paginatedComplaints.length} of {filteredComplaints.length} complaints
                            </p>
                        </div>
                        {statusFilter !== 'ALL' && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {['title', 'status', 'urgency', 'assignedOfficer', 'createdAt'].map((field) => (
                                        <th
                                            key={field}
                                            className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                                            style={{ color: 'var(--text-secondary)' }}
                                            onClick={() => handleSort(field)}
                                        >
                                            <div className="flex items-center gap-1">
                                                {field === 'title' ? 'Complaint' :
                                                    field === 'assignedOfficer' ? 'Assigned To' :
                                                        field === 'createdAt' ? 'Date' :
                                                            field.charAt(0).toUpperCase() + field.slice(1)}
                                                {sortField === field && (
                                                    <svg className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {paginatedComplaints.map((complaint: any) => (
                                    <tr
                                        key={complaint.id}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 cursor-pointer" onClick={() => setViewComplaint(complaint)}>
                                            <div>
                                                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{complaint.title}</div>
                                                <div className="text-xs mt-1 truncate max-w-xs" style={{ color: 'var(--text-secondary)' }}>{complaint.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 cursor-pointer" onClick={() => setViewComplaint(complaint)}>
                                            <span className={`badge badge-${complaint.status.toLowerCase().replace('_', '-')}`}>
                                                {complaint.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 cursor-pointer" onClick={() => setViewComplaint(complaint)}>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

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

            <EnhancedComplaintDetailsModal
                complaintId={viewComplaint?.id}
                isOpen={!!viewComplaint}
                onClose={() => setViewComplaint(null)}
                onUpdate={loadData}
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
