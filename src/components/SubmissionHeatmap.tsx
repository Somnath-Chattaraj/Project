import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import 'react-calendar-heatmap/dist/styles.css';

interface SubmissionHeatmapProps {
  data: Array<{ date: string; count: number }>;
}

export default function SubmissionHeatmap({ data }: SubmissionHeatmapProps) {
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const getColorClass = (count: number) => {
    if (count === 0) return 'color-empty';
    if (count <= 2) return 'color-scale-1';
    if (count <= 4) return 'color-scale-2';
    if (count <= 6) return 'color-scale-3';
    return 'color-scale-4';
  };

  return (
    <div className="w-full overflow-x-auto">
      <style>{`
        .color-empty { fill: hsl(var(--muted)); }
        .color-scale-1 { fill: hsl(var(--primary) / 0.3); }
        .color-scale-2 { fill: hsl(var(--primary) / 0.5); }
        .color-scale-3 { fill: hsl(var(--primary) / 0.7); }
        .color-scale-4 { fill: hsl(var(--primary)); }
      `}</style>
      <TooltipProvider>
        <CalendarHeatmap
          startDate={startDate}
          endDate={new Date()}
          values={data}
          classForValue={(value) => {
            if (!value) return 'color-empty';
            return getColorClass(value.count);
          }}
          tooltipDataAttrs={(value) => {
            if (!value || !value.date) return {};
            return {
              'data-tip': `${value.count} submissions on ${format(new Date(value.date), 'MMM dd, yyyy')}`,
            };
          }}
        />
      </TooltipProvider>
    </div>
  );
}