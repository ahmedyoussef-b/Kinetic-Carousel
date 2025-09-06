// src/components/finance/FinanceChart.tsx
'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface FinanceChartProps {
    stats: {
        paid: number;
        pending: number;
        overdue: number;
    };
}

const COLORS = {
    paid: 'hsl(var(--chart-2))',   // Greenish
    pending: 'hsl(var(--chart-4))', // Orangish
    overdue: 'hsl(var(--chart-5))', // Reddish
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-background/80 border rounded-lg shadow-lg">
        <p className="font-bold">{`${data.name}: ${data.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`}</p>
      </div>
    );
  }
  return null;
};

const FinanceChart: React.FC<FinanceChartProps> = ({ stats }) => {
    
    const data = [
        { name: 'Payé', value: stats.paid },
        { name: 'En attente', value: stats.pending },
        { name: 'En retard', value: stats.overdue },
    ].filter(d => d.value > 0);
    
    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
                Aucune donnée à afficher.
            </div>
        );
    }

    return (
        <div className="w-full h-64">
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase().replace(' ', '_') as keyof typeof COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FinanceChart;
