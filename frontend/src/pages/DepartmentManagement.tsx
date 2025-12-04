import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DepartmentModal } from '../components/admin/DepartmentModal';
import { OfficersListModal } from '../components/analytics/OfficersListModal';
import { DepartmentComplaintsModal } from '../components/analytics/DepartmentComplaintsModal';
import { CreateOfficerModal } from '../components/admin/CreateOfficerModal';
import { useNavigate } from 'react-router-dom';

interface Department {
    id: string;
    name: string;
    description?: string;
    _count?: {
        officers: number;
        complaints: number;
    };
}

export const DepartmentManagement: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined);
    const [showOfficersModal, setShowOfficersModal] = useState(false);
    const [showComplaintsModal, setShowComplaintsModal] = useState(false);
    const [showCreateOfficerModal, setShowCreateOfficerModal] = useState(false);
    const [selectedDeptForModal, setSelectedDeptForModal] = useState<{ id: string; name: string } | null>(null);
    const navigate = useNavigate();

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://janmat-backend-r51g.onrender.com/api/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(response.data);
        } catch (err: any) {
            setError('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://janmat-backend-r51g.onrender.com/api/departments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDepartments();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete department');
        }
    };

    const handleOfficersClick = (dept: Department) => {
        setSelectedDeptForModal({ id: dept.id, name: dept.name });
        setShowOfficersModal(true);
    };

    const handleComplaintsClick = (dept: Department) => {
        setSelectedDeptForModal({ id: dept.id, name: dept.name });
        setShowComplaintsModal(true);
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-7xl mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>🏢 Department Management</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage organization departments, officers, and structures</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <button
                            onClick={() => setShowCreateOfficerModal(true)}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Create Officer
                        </button>
                        <button
                            onClick={() => {
                                setSelectedDepartment(undefined);
                                setIsModalOpen(true);
                            }}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Department
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-xl flex items-center gap-3 animate-fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept) => (
                            <div key={dept.id} className="modern-card hover-lift group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                                            {dept.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{dept.name}</h3>
                                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Department</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setSelectedDepartment(dept);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 rounded-lg transition-all hover:scale-110"
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--primary)' }}
                                            title="Edit Department"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
                                            className="p-2 rounded-lg transition-all hover:scale-110"
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
                                            title="Delete Department"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm mb-6 h-12 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                    {dept.description || 'No description provided'}
                                </p>

                                <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <button
                                        onClick={() => handleOfficersClick(dept)}
                                        className="text-center flex-1 p-3 rounded-xl transition-all hover:scale-105 cursor-pointer group/stat"
                                        style={{ background: 'var(--bg-secondary)' }}
                                    >
                                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent group-hover/stat:scale-110 transition-transform">
                                            {dept._count?.officers || 0}
                                        </p>
                                        <p className="text-xs uppercase font-semibold mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Officers
                                        </p>
                                    </button>
                                    <button
                                        onClick={() => handleComplaintsClick(dept)}
                                        className="text-center flex-1 p-3 rounded-xl transition-all hover:scale-105 cursor-pointer group/stat"
                                        style={{ background: 'var(--bg-secondary)' }}
                                    >
                                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover/stat:scale-110 transition-transform">
                                            {dept._count?.complaints || 0}
                                        </p>
                                        <p className="text-xs uppercase font-semibold mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Complaints
                                        </p>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modals */}
                <DepartmentModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedDepartment(undefined);
                    }}
                    onSuccess={fetchDepartments}
                    department={selectedDepartment}
                />

                {selectedDeptForModal && (
                    <>
                        <OfficersListModal
                            isOpen={showOfficersModal}
                            onClose={() => {
                                setShowOfficersModal(false);
                                setSelectedDeptForModal(null);
                            }}
                            departmentId={selectedDeptForModal.id}
                            departmentName={selectedDeptForModal.name}
                        />

                        <DepartmentComplaintsModal
                            isOpen={showComplaintsModal}
                            onClose={() => {
                                setShowComplaintsModal(false);
                                setSelectedDeptForModal(null);
                            }}
                            departmentId={selectedDeptForModal.id}
                            departmentName={selectedDeptForModal.name}
                        />
                    </>
                )}

                <CreateOfficerModal
                    isOpen={showCreateOfficerModal}
                    onClose={() => setShowCreateOfficerModal(false)}
                    onSuccess={() => {
                        fetchDepartments();
                        setShowCreateOfficerModal(false);
                    }}
                    departments={departments}
                />
            </div>
        </div>
    );
};
