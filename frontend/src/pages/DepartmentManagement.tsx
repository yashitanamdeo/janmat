import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DepartmentModal } from '../components/admin/DepartmentModal';
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
    const navigate = useNavigate();

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/departments', {
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
            await axios.delete(`http://localhost:3000/api/departments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDepartments();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete department');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Departments</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage organization departments and structures</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setSelectedDepartment(undefined);
                                setIsModalOpen(true);
                            }}
                            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
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
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept) => (
                            <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{dept.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedDepartment(dept);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 h-12 line-clamp-2">
                                    {dept.description || 'No description provided'}
                                </p>
                                <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="text-center flex-1">
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dept._count?.officers || 0}</p>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Officers</p>
                                    </div>
                                    <div className="text-center flex-1 border-l border-gray-100 dark:border-gray-700">
                                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{dept._count?.complaints || 0}</p>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Complaints</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <DepartmentModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedDepartment(undefined);
                    }}
                    onSuccess={fetchDepartments}
                    department={selectedDepartment}
                />
            </div>
        </div>
    );
};
