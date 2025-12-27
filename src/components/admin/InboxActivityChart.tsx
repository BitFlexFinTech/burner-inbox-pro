import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

interface InboxActivityData {
  date: string;
  created: number;
  expired: number;
}

interface InboxActivityChartProps {
  data: InboxActivityData[];
}

export function InboxActivityChart({ data }: InboxActivityChartProps) {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
    }));
  }, [data]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--neon-green))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--neon-green))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expiredGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--neon-orange))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--neon-orange))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.3}
            vertical={false}
          />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="created"
            name="Created"
            stroke="hsl(var(--neon-green))"
            strokeWidth={2}
            fill="url(#createdGradient)"
            dot={false}
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="expired"
            name="Expired"
            stroke="hsl(var(--neon-orange))"
            strokeWidth={2}
            fill="url(#expiredGradient)"
            dot={false}
            stackId="2"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
