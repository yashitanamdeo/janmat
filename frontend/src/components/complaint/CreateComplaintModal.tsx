import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addComplaint } from '../../store/slices/complaintSlice';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { MapComponent } from '../ui/MapComponent';
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
    const [files, setFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);

    const urgencyOptions = [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            const complaintData = {
                title,
                description,
                urgency,
                location
            };

            const response = await axios.post(
                'http://localhost:3000/api/complaints',
                complaintData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            dispatch(addComplaint(response.data));
            onClose();
            setTitle('');
            setDescription('');
            setUrgency('LOW');
            setLocation('');
            setFiles(null);
        } catch (err) {
            console.error('Failed to create complaint:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Complaint" size="lg">
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
                            <span className="font-medium">Location selected: {location}</span>
                        </p>
                    )}
                    {!location && (
                        <p className="mt-2 text-xs text-gray-500">Click on the map to select a location</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments</label>
                    <div className="relative">
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setFiles(e.target.files)}
                            className="block w-full text-sm text-gray-600
                                file:mr-4 file:py-3 file:px-6
                                file:rounded-xl file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                file:cursor-pointer cursor-pointer
                                file:transition-all file:duration-200
                                border-2 border-dashed border-gray-300 rounded-xl p-4
                                hover:border-blue-400 transition-colors"
                        />
                    </div>
                    {files && files.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{files.length} file(s) selected</span>
                        </p>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Complaint
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
