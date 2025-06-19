import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from 'react-calendar-heatmap';

import { TooltipProvider } from '@/components/ui/tooltip';
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
        .color-scale-1 { fill: #2563eb; }  /* blue-600 */
        .color-scale-2 { fill: #1d4ed8; }  /* blue-700 */
        .color-scale-3 { fill: #1e40af; }  /* blue-800 */
        .color-scale-4 { fill: #1e3a8a; }  /* blue-900 */
      `}</style>

      <TooltipProvider>
        <CalendarHeatmap
  startDate={startDate}
  endDate={new Date()}
  values={data}
  classForValue={(value: any) => {
    if (!value || typeof value !== 'object' || value.count == null) {
      return 'color-empty';
    }
    return getColorClass(value.count);
  }}
/>

      </TooltipProvider>
    </div>
  );
}
