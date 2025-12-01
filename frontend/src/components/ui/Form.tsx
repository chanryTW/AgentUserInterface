import React from 'react';

interface Field {
    name: string;
    label: string;
    type: string;
}

interface FormProps {
    title: string;
    fields: Field[];
}

export const Form: React.FC<FormProps> = ({ title, fields }) => {
    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">{title}</h2>
            <form className="space-y-5">
                {fields.map((field, index) => (
                    <div key={index}>
                        <label
                            className="block text-gray-700 text-sm font-semibold mb-2"
                            htmlFor={field.name}
                        >
                            {field.label}
                        </label>
                        <input
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 text-gray-700 bg-gray-50 focus:bg-white"
                            id={field.name}
                            type={field.type}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                    </div>
                ))}
                <div className="pt-4">
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        type="button"
                    >
                        Submit Application
                    </button>
                </div>
            </form>
        </div>
    );
};
