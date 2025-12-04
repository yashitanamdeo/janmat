import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateComplaint } from '../../store/slices/complaintSlice';
import { LocationPicker } from '../common/LocationPicker';
import axios from 'axios';

interface Complaint {
    id: string;
    title: string;
    description: string;
    urgency: string;
    location?: string;
    latitude?: number;
    longitude?: number;
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
    const [locationData, setLocationData] = useState<{ address: string; lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (complaint) {
            setTitle(complaint.title);
            setDescription(complaint.description);
            setUrgency(complaint.urgency);
            setLocation(complaint.location || '');
            if (complaint.latitude && complaint.longitude) {
                setLocationData({
                    address: complaint.location || '',
                    lat: complaint.latitude,
                    lng: complaint.longitude
                });
            } else {
                setLocationData(null);
            }
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
            const response = await axios.put(
                `https://janmat-backend-r51g.onrender.com/api/complaints/${complaint.id}`,
                {
                    title,
                    description,
                    urgency,
                    location: locationData ? locationData.address : location,
                    latitude: locationData?.lat,
                    longitude: locationData?.lng
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            dispatch(updateComplaint(response.data));
            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update complaint');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !complaint) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="modern-card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Edit Complaint
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="modern-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="modern-input"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Urgency</label>
                            <select
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="modern-input"
                            >
                                {urgencyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Location</label>
                        <LocationPicker
                            onLocationSelect={(loc: { address: string; lat: number; lng: number }) => {
                                setLocationData(loc);
                                setLocation(loc.address);
                            }}
                            initialLocation={locationData ? locationData : undefined}
                        />
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
