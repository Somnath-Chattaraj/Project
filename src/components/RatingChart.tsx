import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Contest } from '@/types/student';
import { format } from 'date-fns';

interface RatingChartProps {
  contests: Contest[];
}

export default function RatingChart({ contests }: RatingChartProps) {
  const data = contests
    .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds)
    .map(contest => ({
      date: format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM dd'),
      rating: contest.newRating,
      contest: contest.contestName,
    }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No contest data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-md">
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm">
                      Rating: <span className="font-medium">{payload[0].value}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payload[0].payload.contest}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="rating" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}