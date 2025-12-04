import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    department?: {
        id: string;
        name: string;
        description?: string;
    };
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    department,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (department) {
            setName(department.name);
            setDescription(department.description || '');
        } else {
            setName('');
            setDescription('');
        }
        setError('');
    }, [department, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = department
                ? `https://janmat-backend-r51g.onrender.com/api/departments/${department.id}`
                : 'https://janmat-backend-r51g.onrender.com/api/departments';
            const method = department ? 'put' : 'post';

            await axios[method](
                url,
                { name, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save department');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="modern-card max-w-md w-full" style={{ background: 'var(--card-bg)' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {department ? 'Edit Department' : 'New Department'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Department Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="modern-input w-full"
                            placeholder="e.g. Public Works"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="modern-input w-full resize-none"
                            placeholder="Brief description of responsibilities..."
                            rows={3}
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-100 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Department'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
