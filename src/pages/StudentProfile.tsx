import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student, Contest, Submission, ProblemStats } from '@/types/student';
import { studentsAPI, contestsAPI, submissionsAPI } from '@/services/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp, 
  Trophy, 
  Target, 
  Calendar,
  Activity,
  BarChart3,
  Clock
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import RatingChart from '@/components/RatingChart';
import ProblemStatsChart from '@/components/ProblemStatsChart';
import SubmissionHeatmap from '@/components/SubmissionHeatmap';
import ContestTable from '@/components/ContestTable';

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [problemStats, setProblemStats] = useState<ProblemStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [contestDays, setContestDays] = useState('365');
  const [problemDays, setProblemDays] = useState('30');

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id]);

  useEffect(() => {
    if (student) {
      fetchContestData();
    }
  }, [student, contestDays]);

  useEffect(() => {
    if (student) {
      fetchProblemData();
    }
  }, [student, problemDays]);

  const fetchStudentData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await studentsAPI.getById(id);
      setStudent(response.data);
    } catch (error) {
      toast.error('Failed to fetch student data');
      console.error('Error fetching student:', error);
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const fetchContestData = async () => {
    if (!student) return;
    
    try {
      const response = await contestsAPI.getByHandle(student.codeforcesHandle, parseInt(contestDays));
      setContests(response.data);
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  };

  const fetchProblemData = async () => {
    if (!student) return;
    
    try {
      const [submissionsResponse, statsResponse, heatmapResponse] = await Promise.all([
        submissionsAPI.getByHandle(student.codeforcesHandle, parseInt(problemDays)),
        submissionsAPI.getStats(student.codeforcesHandle, parseInt(problemDays)),
        submissionsAPI.getHeatmapData(student.codeforcesHandle),
      ]);
      
      setSubmissions(submissionsResponse.data);
      setProblemStats(statsResponse.data);
      setHeatmapData(heatmapResponse.data);
    } catch (error) {
      console.error('Error fetching problem data:', error);
    }
  };

  const handleSync = async () => {
    if (!student) return;
    
    try {
      setSyncing(true);
      await studentsAPI.sync(student._id);
      await fetchStudentData();
      await fetchContestData();
      await fetchProblemData();
      toast.success('Student data synced successfully');
    } catch (error) {
      toast.error('Failed to sync student data');
      console.error('Error syncing student:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={() => navigate('/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground">
              Codeforces Handle: <Badge variant="secondary">{student.codeforcesHandle}</Badge>
            </p>
          </div>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.currentRating}</div>
            <p className="text-xs text-muted-foreground">
              Max: {student.maxRating}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contests</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contests.length}</div>
            <p className="text-xs text-muted-foreground">
              Last {contestDays} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{problemStats?.totalSolved || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg rating: {problemStats?.averageRating || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {student.lastUpdated ? 
                formatDistanceToNow(new Date(student.lastUpdated), { addSuffix: true }) : 
                'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-sync daily
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-black p-1 rounded-md border border-gray-700">
  <TabsTrigger
    value="contests"
    className="text-gray-400 hover:bg-gray-800 data-[state=active]:bg-white data-[state=active]:text-black rounded-md px-3 py-2 transition font-medium"
  >
    Contest History
  </TabsTrigger>
  <TabsTrigger
    value="problems"
    className="text-gray-400 hover:bg-gray-800 data-[state=active]:bg-white data-[state=active]:text-black rounded-md px-3 py-2 transition font-medium"
  >
    Problem Solving
  </TabsTrigger>
  <TabsTrigger
    value="activity"
    className="text-gray-400 hover:bg-gray-800 data-[state=active]:bg-white data-[state=active]:text-black rounded-md px-3 py-2 transition font-medium"
  >
    Activity
  </TabsTrigger>
</TabsList>


        <TabsContent value="contests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contest History</h3>
            <Select value={contestDays} onValueChange={setContestDays}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last 365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rating Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingChart contests={contests} />
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Contests</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  <ContestTable contests={contests} />
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Problem Solving Analysis</h3>
            <Select value={problemDays} onValueChange={setProblemDays}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {problemStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Hardest Problem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{problemStats.hardestProblem.rating}</div>
                  <p className="text-xs text-muted-foreground truncate">
                    {problemStats.hardestProblem.name}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Solved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{problemStats.totalSolved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{Math.round(problemStats.averageRating)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Problems/Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{problemStats.averagePerDay.toFixed(1)}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Problems by Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <ProblemStatsChart data={problemStats?.ratingDistribution || {}} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <h3 className="text-lg font-semibold">Submission Activity</h3>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submission Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionHeatmap data={heatmapData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}