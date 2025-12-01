import React from 'react';

interface StatItem {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
}

interface StatsProps {
    items: StatItem[];
}

export const Stats: React.FC<StatsProps> = ({ items }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl mx-auto my-2">
            {items.map((stat, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <dt className="truncate text-sm font-medium text-gray-500">{stat.label}</dt>
                    <dd className="mt-2 flex items-baseline justify-between sm:justify-start">
                        <span className="text-2xl font-semibold text-gray-900">{stat.value}</span>
                        {stat.change && (
                            <span
                                className={`ml-2 flex items-baseline text-sm font-semibold ${stat.trend === 'up'
                                        ? 'text-green-600'
                                        : stat.trend === 'down'
                                            ? 'text-red-600'
                                            : 'text-gray-500'
                                    }`}
                            >
                                {stat.trend === 'up' && (
                                    <svg className="self-center flex-shrink-0 h-4 w-4 text-green-500 mr-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {stat.trend === 'down' && (
                                    <svg className="self-center flex-shrink-0 h-4 w-4 text-red-500 mr-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {stat.change}
                            </span>
                        )}
                    </dd>
                </div>
            ))}
        </div>
    );
};
