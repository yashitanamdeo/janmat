import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import axios from 'axios';

interface Officer {
    id: string;
    name: string;
    email: string;
}

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaintId: string;
    complaintTitle: string;
    onSuccess?: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
    isOpen,
    onClose,
    complaintId,
    complaintTitle,
    onSuccess
}) => {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingOfficers, setFetchingOfficers] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchOfficers();
        }
    }, [isOpen]);

    const fetchOfficers = async () => {
        setFetchingOfficers(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:3000/api/admin/officers',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOfficers(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch officers:', err);
            setError('Failed to load officers. Please try again.');
        } finally {
            setFetchingOfficers(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedOfficer) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:3000/api/admin/assign-complaint',
                {
                    complaintId,
                    officerId: selectedOfficer
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Complaint assigned successfully!');

            // Call onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }

            // Close modal after a short delay
            setTimeout(() => {
                onClose();
                setSelectedOfficer('');
                setSuccess('');
            }, 1500);
        } catch (err: any) {
            console.error('Assignment failed:', err);
            setError(err.response?.data?.message || 'Failed to assign complaint. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const officerOptions = [
        { value: '', label: 'Select an officer...' },
        ...officers.map(officer => ({
            value: officer.id,
            label: `${officer.name} (${officer.email})`
        }))
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Complaint to Officer">
            <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-blue-800">Complaint:</p>
                            <p className="text-sm text-blue-700 mt-1">{complaintTitle}</p>
                        </div>
                    </div>
                </div>

                {fetchingOfficers ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading officers...</span>
                    </div>
                ) : officers.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-gray-600">No officers available</p>
                    </div>
                ) : (
                    <div>
                        <Select
                            label="Select Officer"
                            value={selectedOfficer}
                            onChange={(e) => setSelectedOfficer(e.target.value)}
                            options={officerOptions}
                        />
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 font-medium text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-700 font-medium text-sm">{success}</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        isLoading={loading}
                        disabled={!selectedOfficer || fetchingOfficers}
                        className="flex-1"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Assign Officer
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
