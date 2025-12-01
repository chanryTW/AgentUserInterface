import React from 'react';
import { Table } from './ui/Table';
import { Card } from './ui/Card';
import { Form } from './ui/Form';
import { Chart } from './ui/Chart';
import { Steps } from './ui/Steps';
import { Stats } from './ui/Stats';

const componentRegistry: Record<string, React.FC<any>> = {
    table: Table,
    card: Card,
    form: Form,
    chart: Chart,
    steps: Steps,
    stats: Stats,
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
