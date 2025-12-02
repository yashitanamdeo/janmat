import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addComplaint } from '../../store/slices/complaintSlice';
import { LocationPicker } from '../common/LocationPicker';
import axios from 'axios';

interface CreateComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateComplaintModal: React.FC<CreateComplaintModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState('LOW');
    const [location, setLocation] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [departments, setDepartments] = useState<any[]>([]);
    const [files, setFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/api/departments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDepartments(response.data);
            } catch (error) {
                console.error('Failed to fetch departments:', error);
            }
        };

        if (isOpen) {
            fetchDepartments();
        }
    }, [isOpen]);

    const urgencyOptions = [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
    ];

    const [locationData, setLocationData] = useState<{ address: string; lat: number; lng: number } | null>(null);

    // ... existing useEffect ...

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('urgency', urgency);
            formData.append('location', locationData ? locationData.address : location);
            if (locationData) {
                formData.append('latitude', locationData.lat.toString());
                formData.append('longitude', locationData.lng.toString());
            }
            if (departmentId) {
                formData.append('departmentId', departmentId);
            }

            if (files) {
                for (let i = 0; i < files.length; i++) {
                    formData.append('files', files[i]);
                }
            }

            const response = await axios.post(
                'http://localhost:3000/api/complaints',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            dispatch(addComplaint(response.data));
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setUrgency('LOW');
            setLocation('');
            setLocationData(null);
            setDepartmentId('');
            setFiles(null);
        } catch (error) {
            console.error('Failed to create complaint:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="modern-card max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        New Complaint
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... Title and Description fields ... */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="modern-input"
                            placeholder="Brief title of the issue"
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
                            placeholder="Detailed description of the complaint..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Department (Optional)</label>
                        <select
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                            className="modern-input"
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
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

                    {/* Location Picker Section */}
                    <div>
                        <LocationPicker
                            onLocationSelect={(loc: { address: string; lat: number; lng: number }) => {
                                setLocationData(loc);
                                setLocation(loc.address);
                            }}
                            initialLocation={locationData ? locationData : undefined}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Media Attachments</label>
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setFiles(e.target.files)}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                style={{ borderColor: 'var(--border-color)' }}
                            >
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {files && files.length > 0
                                            ? `${files.length} file(s) selected`
                                            : 'Click to upload images or videos'
                                        }
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>



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
                            {loading ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
