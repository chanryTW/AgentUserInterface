import React from 'react';
import { Table } from './ui/Table';
import { Card } from './ui/Card';
import { Form } from './ui/Form';

const componentRegistry: Record<string, React.FC<any>> = {
    table: Table,
    card: Card,
    form: Form,
};

interface DynamicRendererProps {
    componentName: string;
    props: any;
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ componentName, props }) => {
    const Component = componentRegistry[componentName];

    if (!Component) {
        return <div className="text-red-500">Unsupported component: {componentName}</div>;
    }

    return <Component {...props} />;
};
