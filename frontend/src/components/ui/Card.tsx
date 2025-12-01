import React from 'react';

interface CardProps {
    title: string;
    description: string;
    imageUrl?: string;
}

export const Card: React.FC<CardProps> = ({ title, description, imageUrl }) => {
    return (
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
            {imageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        src={imageUrl}
                        alt={title}
                    />
                </div>
            )}
            <div className="p-6">
                <h3 className="font-bold text-2xl mb-3 text-gray-800 tracking-tight">{title}</h3>
                <p className="text-gray-600 text-base leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};
