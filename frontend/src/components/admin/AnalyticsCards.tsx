import React from 'react';
import { Card } from '../ui/Card';

interface AnalyticsCardsProps {
    complaints: any[];
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ complaints }) => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
    const pending = complaints.filter(c => c.status === 'PENDING').length;
    const highUrgency = complaints.filter(c => c.urgency === 'HIGH').length;

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <div className="text-sm font-medium text-gray-500 truncate">Total Complaints</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">{total}</div>
            </Card>
            <Card>
                <div className="text-sm font-medium text-gray-500 truncate">Resolved</div>
                <div className="mt-1 text-3xl font-semibold text-green-600">{resolved}</div>
            </Card>
            <Card>
                <div className="text-sm font-medium text-gray-500 truncate">Pending</div>
                <div className="mt-1 text-3xl font-semibold text-yellow-600">{pending}</div>
            </Card>
            <Card>
                <div className="text-sm font-medium text-gray-500 truncate">High Urgency</div>
                <div className="mt-1 text-3xl font-semibold text-red-600">{highUrgency}</div>
            </Card>
        </div>
    );
};
