import React from 'react';

interface StepItem {
    title: string;
    description: string;
    status: 'completed' | 'current' | 'pending';
}

interface StepsProps {
    items: StepItem[];
}

export const Steps: React.FC<StepsProps> = ({ items }) => {
    return (
        <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 my-2">
            <div className="space-y-6">
                {items.map((step, index) => (
                    <div key={index} className="relative flex gap-x-4">
                        <div
                            className={`absolute left-0 top-0 flex w-6 justify-center ${index === items.length - 1 ? 'h-6' : '-bottom-6'
                                }`}
                        >
                            <div className="w-px bg-gray-200" />
                        </div>
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                            {step.status === 'completed' ? (
                                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            ) : step.status === 'current' ? (
                                <div className="h-6 w-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                </div>
                            ) : (
                                <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-gray-200" />
                            )}
                        </div>
                        <div className="flex-auto py-0.5">
                            <span className={`font-medium ${step.status === 'completed' || step.status === 'current' ? 'text-gray-900' : 'text-gray-500'}`}>
                                {step.title}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
