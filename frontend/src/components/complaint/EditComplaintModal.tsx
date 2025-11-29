import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateComplaint } from '../../store/slices/complaintSlice';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { MapComponent } from '../ui/MapComponent';
import axios from 'axios';

interface Complaint {
    id: string;
    title: string;
    description: string;
    urgency: string;
    location?: string;
    status: string;
}

interface EditComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaint: Complaint | null;
    onUpdate: () => void;
}

export const EditComplaintModal: React.FC<EditComplaintModalProps> = ({ isOpen, onClose, complaint, onUpdate }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState('LOW');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (complaint) {
            setTitle(complaint.title);
            setDescription(complaint.description);
            setUrgency(complaint.urgency);
            setLocation(complaint.location || '');
        }
    }, [complaint]);

    const urgencyOptions = [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!complaint) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            const complaintData = {
                title,
                description,
                urgency,
                location
            };

            const response = await axios.put(
                `http://localhost:3000/api/complaints/${complaint.id}`,
                complaintData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data) {
                dispatch(updateComplaint(response.data));
                onUpdate();
                onClose();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update complaint');
        } finally {
            setLoading(false);
        }
    };

    if (!complaint) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Complaint" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of the issue"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                    }
                />

                <Textarea
                    label="Description"
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed information about the complaint..."
                />

                <Select
                    label="Urgency"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    options={urgencyOptions}
                />

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <MapComponent onLocationSelect={(lat, lng) => setLocation(`${lat},${lng}`)} />
                    <input type="hidden" value={location} />
                    {location && (
                        <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Location: {location}</span>
                        </p>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 font-medium">{error}</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading} className="flex-1">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
