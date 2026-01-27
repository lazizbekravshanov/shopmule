'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface JobsChartProps {
  data: { month: string; completed: number; inProgress: number }[];
}

export function JobsChart({ data }: JobsChartProps) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <div className="p-5 border-b border-neutral-200">
        <div className="flex items-center gap-6">
          <h3 className="font-semibold text-neutral-900">Work Orders</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500" />
              <span className="text-neutral-500">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neutral-300" />
              <span className="text-neutral-500">In Progress</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              stroke="#a8a29e"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#a8a29e"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
                      <p className="text-xs font-medium text-neutral-900 mb-2">
                        {label}
                      </p>
                      <div className="space-y-1">
                        {payload.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-neutral-500 capitalize">
                              {item.name === 'completed' ? 'Completed' : 'In Progress'}:
                            </span>
                            <span className="font-medium text-neutral-900">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="completed"
              fill="#ee7a14"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="inProgress"
              fill="#d6d3d1"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
