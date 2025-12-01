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
        <div className="w-full max-w-xs border p-4 rounded-lg shadow-sm bg-white">
            <h2 className="text-lg font-bold mb-4">{title}</h2>
            <form className="bg-white rounded px-8 pt-6 pb-8 mb-4">
                {fields.map((field, index) => (
                    <div key={index} className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor={field.name}
                        >
                            {field.label}
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id={field.name}
                            type={field.type}
                            placeholder={field.label}
                        />
                    </div>
                ))}
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};
