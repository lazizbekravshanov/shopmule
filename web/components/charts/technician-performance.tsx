'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TechnicianPerformanceProps {
  data: { name: string; jobs: number; hours: number }[];
}

export function TechnicianPerformance({ data }: TechnicianPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={80}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="mb-1 font-medium">{label}</div>
                      <div className="grid gap-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Jobs:</span>
                          <span className="font-medium">{payload[0].payload.jobs}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Hours:</span>
                          <span className="font-medium">{payload[0].payload.hours}h</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
