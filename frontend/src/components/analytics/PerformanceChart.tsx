import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface PerformanceChartProps {
    data: Array<{
        name: string;
        total: number;
        resolved: number;
        resolutionRate: number;
    }>;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
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
                    <Bar dataKey="total" fill="#6366f1" name="Total" />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
