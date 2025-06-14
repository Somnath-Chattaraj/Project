import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Contest } from '@/types/student';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ContestTableProps {
  contests: Contest[];
}

export default function ContestTable({ contests }: ContestTableProps) {
  if (contests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No contests found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contest</TableHead>
            <TableHead className="text-center">Rank</TableHead>
            <TableHead className="text-center">Rating Change</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contests.map((contest) => {
            const ratingChange = contest.newRating - contest.oldRating;
            return (
              <TableRow key={contest._id}>
                <TableCell className="font-medium">
                  <div className="max-w-[200px] truncate">
                    {contest.contestName}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">#{contest.rank}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {ratingChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={ratingChange > 0 ? 'text-green-500' : 'text-red-500'}>
                      {ratingChange > 0 ? '+' : ''}{ratingChange}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM dd, yyyy')}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}