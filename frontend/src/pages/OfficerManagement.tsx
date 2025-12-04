import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Department {
    id: string;
    name: string;
}

interface Officer {
    id: string;
    name: string;
    email: string;
    phone: string;
    department: Department | null;
}

export const OfficerManagement: React.FC = () => {
    const navigate = useNavigate();
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [filterDepartment, setFilterDepartment] = useState<string>('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [officersRes, departmentsRes] = await Promise.all([
                axios.get('https://janmat-backend-r51g.onrender.com/api/admin/officers', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('https://janmat-backend-r51g.onrender.com/api/departments', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setOfficers(officersRes.data);
            setDepartments(departmentsRes.data);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignDepartment = async () => {
        if (!selectedOfficer) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `https://janmat-backend-r51g.onrender.com/api/admin/officers/${selectedOfficer.id}/department`,
                { departmentId: selectedDepartmentId || null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await loadData();
            setSelectedOfficer(null);
            setSelectedDepartmentId('');
        } catch (err) {
            console.error('Failed to assign department:', err);
        }
    };

    const filteredOfficers = filterDepartment === 'ALL'
        ? officers
        : filterDepartment === 'UNASSIGNED'
            ? officers.filter(o => !o.department)
            : officers.filter(o => o.department?.id === filterDepartment);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="modern-card mb-6" style={{ borderRadius: '0' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Officer Management
                                </h1>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Assign officers to departments
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter */}
                <div className="modern-card mb-6 p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Filter by:</span>
                        <button
                            onClick={() => setFilterDepartment('ALL')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterDepartment === 'ALL'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            All Officers ({officers.length})
                        </button>
                        <button
                            onClick={() => setFilterDepartment('UNASSIGNED')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterDepartment === 'UNASSIGNED'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Unassigned ({officers.filter(o => !o.department).length})
                        </button>
                        {departments.map(dept => (
                            <button
                                key={dept.id}
                                onClick={() => setFilterDepartment(dept.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterDepartment === dept.id
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {dept.name} ({officers.filter(o => o.department?.id === dept.id).length})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Officers List */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOfficers.map(officer => (
                            <div
                                key={officer.id}
                                className="modern-card p-6 hover-lift cursor-pointer"
                                onClick={() => {
                                    setSelectedOfficer(officer);
                                    setSelectedDepartmentId(officer.department?.id || '');
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {officer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                                {officer.name}
                                            </h3>
                                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                {officer.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {officer.department ? (
                                    <div className="px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                                        <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">
                                            📁 {officer.department.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="px-3 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
                                        <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">
                                            ⚠️ No Department Assigned
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedOfficer(officer);
                                        setSelectedDepartmentId(officer.department?.id || '');
                                    }}
                                    className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all"
                                >
                                    Change Department
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assignment Modal */}
            {selectedOfficer && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedOfficer(null)}
                >
                    <div className="modern-card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Assign Department
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Officer: <span className="font-semibold">{selectedOfficer.name}</span>
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Select Department
                            </label>
                            <select
                                value={selectedDepartmentId}
                                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                                className="modern-input"
                            >
                                <option value="">No Department (Unassign)</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedOfficer(null)}
                                className="flex-1 px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignDepartment}
                                className="flex-1 px-4 py-2 rounded-xl font-semibold text-white transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
