import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AttendanceRecord {
    id: string;
    date: string;
    status: string;
    checkIn: string;
    checkOut: string | null;
    user: {
        id: string;
        name: string;
        email: string;
        department: {
            name: string;
        } | null;
    };
}

interface Department {
    id: string;
    name: string;
}

export const AdminAttendancePage: React.FC = () => {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, [selectedDate, selectedDepartment]);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(response.data);
        } catch (error) {
            console.error('Failed to fetch departments', error);
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/attendance/all', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    date: selectedDate,
                    departmentId: selectedDepartment || undefined
                }
            });
            setAttendance(response.data);
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'ABSENT': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            case 'LATE': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Attendance Overview</h1>
                        <p className="text-[var(--text-secondary)] mt-1">Monitor officer attendance and timesheets</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold hover:scale-105 transition-all shadow-sm"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="modern-card p-4 mb-8 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="modern-input w-full"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase">Department</label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="modern-input w-full"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-none self-end">
                        <button
                            onClick={fetchAttendance}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="modern-card p-6 border-l-4 border-blue-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">Total Present</div>
                        <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                            {attendance.filter(r => r.status === 'PRESENT').length}
                        </div>
                    </div>
                    <div className="modern-card p-6 border-l-4 border-yellow-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">Late Arrivals</div>
                        <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                            {attendance.filter(r => r.status === 'LATE').length}
                        </div>
                    </div>
                    <div className="modern-card p-6 border-l-4 border-green-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">On Time</div>
                        <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                            {attendance.filter(r => r.status === 'PRESENT' && !r.status.includes('LATE')).length}
                        </div>
                    </div>
                    <div className="modern-card p-6 border-l-4 border-purple-500">
                        <div className="text-[var(--text-secondary)] text-sm font-semibold uppercase">Active Now</div>
                        <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                            {attendance.filter(r => r.checkIn && !r.checkOut).length}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="modern-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Officer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Check In</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Check Out</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : attendance.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                                            No attendance records found for this date
                                        </td>
                                    </tr>
                                ) : (
                                    attendance.map((record) => (
                                        <tr key={record.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                        {record.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[var(--text-primary)]">{record.user.name}</div>
                                                        <div className="text-xs text-[var(--text-secondary)]">{record.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-[var(--text-secondary)]">
                                                    {record.user.department?.name || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-[var(--text-primary)]">
                                                {formatTime(record.checkIn)}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-[var(--text-primary)]">
                                                {formatTime(record.checkOut)}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-[var(--text-primary)]">
                                                {record.checkOut && record.checkIn ?
                                                    ((new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60)).toFixed(1) + ' hrs'
                                                    : '--'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
