import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface TrendsChartProps {
    data: Array<{
        name: string;
        total: number;
        resolved: number;
    }>;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ data }) => {
    return (
        <div className="w-full" style={{ minHeight: '320px', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#6366f1"
                        activeDot={{ r: 8 }}
                        name="Total Complaints"
                    />
                    <Line
                        type="monotone"
                        dataKey="resolved"
                        stroke="#10b981"
                        name="Resolved"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
