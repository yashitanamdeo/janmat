import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AdvancedSearchProps {
    onSearch: (results: any[]) => void;
    onClose: () => void;
}

interface SearchCriteria {
    keyword?: string;
    status?: string[];
    urgency?: string[];
    departmentId?: string;
    dateFrom?: string;
    dateTo?: string;
    assignedStatus?: 'assigned' | 'unassigned' | 'all';
    hasFeedback?: boolean;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClose }) => {
    const [criteria, setCriteria] = useState<SearchCriteria>({
        status: [],
        urgency: [],
        assignedStatus: 'all'
    });
    const [departments, setDepartments] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(response.data);
        } catch (error) {
            console.error('Failed to load departments:', error);
        }
    };

    const handleSearch = async () => {
        setSearching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/api/admin/complaints/search', criteria, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSearch(response.data);
        } catch (error) {
            console.error('Search failed:', error);
            alert('Search failed. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const toggleArrayValue = (key: 'status' | 'urgency', value: string) => {
        setCriteria(prev => {
            const array = prev[key] || [];
            const newArray = array.includes(value)
                ? array.filter(v => v !== value)
                : [...array, value];
            return { ...prev, [key]: newArray };
        });
    };

    const resetCriteria = () => {
        setCriteria({
            status: [],
            urgency: [],
            assignedStatus: 'all'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="modern-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 -m-6 mb-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                🔍 Advanced Search
                            </h2>
                            <p className="text-white text-opacity-90 text-sm">
                                Find complaints with precise criteria
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white hover:bg-opacity-20 transition-all text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Keyword Search */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            🔤 Keyword
                        </label>
                        <input
                            type="text"
                            value={criteria.keyword || ''}
                            onChange={(e) => setCriteria({ ...criteria, keyword: e.target.value })}
                            placeholder="Search in title, description, location..."
                            className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20"
                            style={{
                                background: 'var(--bg-secondary)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                            📊 Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => toggleArrayValue('status', status)}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${criteria.status?.includes(status)
                                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                                            : 'hover:scale-105'
                                        }`}
                                    style={!criteria.status?.includes(status) ? {
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-secondary)'
                                    } : {}}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Urgency Filter */}
                    <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                            🚨 Urgency
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'HIGH', color: 'from-red-500 to-pink-600', emoji: '🔴' },
                                { value: 'MEDIUM', color: 'from-yellow-500 to-orange-500', emoji: '🟡' },
                                { value: 'LOW', color: 'from-green-500 to-emerald-600', emoji: '🟢' }
                            ].map((urgency) => (
                                <button
                                    key={urgency.value}
                                    onClick={() => toggleArrayValue('urgency', urgency.value)}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${criteria.urgency?.includes(urgency.value)
                                            ? `bg-gradient-to-r ${urgency.color} text-white shadow-lg scale-105`
                                            : 'hover:scale-105'
                                        }`}
                                    style={!criteria.urgency?.includes(urgency.value) ? {
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-secondary)'
                                    } : {}}
                                >
                                    <span>{urgency.emoji}</span>
                                    {urgency.value}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            🏢 Department
                        </label>
                        <select
                            value={criteria.departmentId || ''}
                            onChange={(e) => setCriteria({ ...criteria, departmentId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20"
                            style={{
                                background: 'var(--bg-secondary)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                📅 From Date
                            </label>
                            <input
                                type="date"
                                value={criteria.dateFrom || ''}
                                onChange={(e) => setCriteria({ ...criteria, dateFrom: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                📅 To Date
                            </label>
                            <input
                                type="date"
                                value={criteria.dateTo || ''}
                                onChange={(e) => setCriteria({ ...criteria, dateTo: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Assignment Status */}
                    <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                            👮 Assignment Status
                        </label>
                        <div className="flex gap-2">
                            {[
                                { value: 'all', label: 'All', icon: '📋' },
                                { value: 'assigned', label: 'Assigned', icon: '✅' },
                                { value: 'unassigned', label: 'Unassigned', icon: '⚠️' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setCriteria({ ...criteria, assignedStatus: option.value as any })}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${criteria.assignedStatus === option.value
                                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                                            : 'hover:scale-105'
                                        }`}
                                    style={criteria.assignedStatus !== option.value ? {
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-secondary)'
                                    } : {}}
                                >
                                    <span>{option.icon}</span>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Filter */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                            <input
                                type="checkbox"
                                checked={criteria.hasFeedback || false}
                                onChange={(e) => setCriteria({ ...criteria, hasFeedback: e.target.checked })}
                                className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20"
                            />
                            <div>
                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    ⭐ Has Feedback Only
                                </span>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                    Show only complaints with citizen feedback
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        onClick={resetCriteria}
                        className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                        style={{
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        🔄 Reset
                    </button>
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                    >
                        {searching ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Searching...
                            </span>
                        ) : (
                            '🔍 Search'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
