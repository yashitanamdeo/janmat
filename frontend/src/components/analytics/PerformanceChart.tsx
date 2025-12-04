import React, { useState } from 'react';
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
    const [showAll, setShowAll] = useState(false);

    // Truncate long department names for display
    const truncateName = (name: string, maxLength: number = 15) => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '...';
    };

    // Sort by total complaints and show top 10 by default
    const sortedData = [...data].sort((a, b) => b.total - a.total);
    const displayData = showAll ? sortedData : sortedData.slice(0, 10);

    // Create display data with truncated names but keep original for tooltip
    const chartData = displayData.map(item => ({
        ...item,
        displayName: truncateName(item.name),
        fullName: item.name, // Keep full name for tooltip
    }));

    if (!data || data.length === 0) {
        return (
            <div className="h-80 w-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg font-medium">No department data available</p>
                    <p className="text-sm mt-2">Department performance will appear here once complaints are assigned</p>
                </div>
            </div>
        );
    }

    // Custom tooltip to show full department name
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-bold text-gray-900 dark:text-white mb-2">{payload[0].payload.fullName}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.name.includes('%') ? `${entry.value}%` : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {displayData.length} of {data.length} departments
                </p>
                {data.length > 10 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        {showAll ? 'Show Top 10' : 'Show All'}
                    </button>
                )}
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 60, // Increased from 20 to 60 to prevent overlap
                            bottom: 80, // Increased from 60 to 80 for more space
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="displayName"
                            stroke="#6b7280"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            tick={{ fontSize: 11 }} // Slightly smaller font
                        />
                        <YAxis
                            stroke="#6b7280"
                            width={50} // Fixed width for Y-axis
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                        />
                        <Bar dataKey="total" fill="#6366f1" name="Total Complaints" />
                        <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                        <Bar dataKey="resolutionRate" fill="#f59e0b" name="Resolution Rate (%)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
