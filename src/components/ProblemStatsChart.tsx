import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProblemStatsChartProps {
  data: { [key: string]: number };
}

export default function ProblemStatsChart({ data }: ProblemStatsChartProps) {
  const chartData = Object.entries(data)
    .map(([rating, count]) => ({
      rating: rating === 'unrated' ? 'Unrated' : `${rating}+`,
      count,
    }))
    .sort((a, b) => {
      if (a.rating === 'Unrated') return -1;
      if (b.rating === 'Unrated') return 1;
      return parseInt(a.rating) - parseInt(b.rating);
    });

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No problem data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="rating" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-md">
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm">
                      Problems: <span className="font-medium">{payload[0].value}</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}