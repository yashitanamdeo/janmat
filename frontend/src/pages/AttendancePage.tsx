import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AttendanceRecord {
    id: string;
    date: string;
    status: string;
    checkIn: string;
    checkOut: string | null;
}

export const AttendancePage: React.FC = () => {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [todayStatus, setTodayStatus] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            const [historyRes, todayRes] = await Promise.all([
                axios.get('https://janmat-backend.onrender.com/api/attendance/my-attendance', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('https://janmat-backend.onrender.com/api/attendance/today', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setAttendance(historyRes.data);
            setTodayStatus(todayRes.data);
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('https://janmat-backend.onrender.com/api/attendance/check-in', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAttendance();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('https://janmat-backend.onrender.com/api/attendance/check-out', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAttendance();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Check-out failed');
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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Attendance & Timesheet</h1>
                        <p className="text-[var(--text-secondary)] mt-1">Manage your daily attendance and view history</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold hover:scale-105 transition-all shadow-sm"
                    >
                        Back
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Check In/Out Card */}
                    <div className="lg:col-span-1">
                        <div className="modern-card p-8 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <h2 className="text-xl font-semibold text-[var(--text-secondary)] mb-2">
                                    {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </h2>
                                <div className="text-5xl font-bold text-[var(--text-primary)] mb-8 font-mono tracking-wider">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>

                                <div className="mb-8">
                                    <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-700 relative">
                                        <div className={`absolute inset-0 rounded-full opacity-20 ${todayStatus ? 'bg-green-500' : 'bg-blue-500'}`} />
                                        <div className="text-center">
                                            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wide mb-1">Status</div>
                                            <div className={`text-xl font-bold ${todayStatus ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {todayStatus ? 'Checked In' : 'Not Checked In'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!todayStatus ? (
                                    <button
                                        onClick={handleCheckIn}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all active:scale-95"
                                    >
                                        Check In
                                    </button>
                                ) : !todayStatus.checkOut ? (
                                    <button
                                        onClick={handleCheckOut}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all active:scale-95"
                                    >
                                        Check Out
                                    </button>
                                ) : (
                                    <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold">
                                        Completed for today
                                    </div>
                                )}

                                {todayStatus && (
                                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                                        <div className="p-3 rounded-xl bg-[var(--bg-secondary)]">
                                            <div className="text-[var(--text-tertiary)] mb-1">Check In</div>
                                            <div className="font-bold text-[var(--text-primary)]">{formatTime(todayStatus.checkIn)}</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[var(--bg-secondary)]">
                                            <div className="text-[var(--text-tertiary)] mb-1">Check Out</div>
                                            <div className="font-bold text-[var(--text-primary)]">{formatTime(todayStatus.checkOut)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="lg:col-span-2">
                        <div className="modern-card h-full flex flex-col">
                            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Activity</h2>
                                <div className="flex gap-2">
                                    <select className="modern-input py-1 px-3 text-sm">
                                        <option>This Month</option>
                                        <option>Last Month</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : attendance.length === 0 ? (
                                    <div className="text-center py-12 text-[var(--text-secondary)]">
                                        No attendance records found
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {attendance.map((record) => (
                                            <div key={record.id} className="group p-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors border border-transparent hover:border-[var(--border-color)]">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${record.status === 'PRESENT' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                                            'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                                            }`}>
                                                            {new Date(record.date).getDate()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-[var(--text-primary)]">
                                                                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusColor(record.status)}`}>
                                                                {record.status}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-8 text-sm">
                                                        <div className="text-right">
                                                            <div className="text-[var(--text-tertiary)] text-xs uppercase">Check In</div>
                                                            <div className="font-mono font-medium text-[var(--text-primary)]">{formatTime(record.checkIn)}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[var(--text-tertiary)] text-xs uppercase">Check Out</div>
                                                            <div className="font-mono font-medium text-[var(--text-primary)]">{formatTime(record.checkOut)}</div>
                                                        </div>
                                                        <div className="text-right hidden sm:block">
                                                            <div className="text-[var(--text-tertiary)] text-xs uppercase">Total Hrs</div>
                                                            <div className="font-mono font-medium text-[var(--text-primary)]">
                                                                {record.checkOut && record.checkIn ?
                                                                    ((new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60)).toFixed(1) + 'h'
                                                                    : '--'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
