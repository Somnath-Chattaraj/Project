import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Student } from '@/types/student';
import { studentsAPI } from '@/services/api';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Download, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  RefreshCw,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StudentForm from '@/components/StudentForm';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: Omit<Student, '_id' | 'lastUpdated' | 'remindersSent'>) => {
    try {
      const response = await studentsAPI.create(studentData);
      setStudents([...students, response.data]);
      setShowForm(false);
      toast.success('Student added successfully');
    } catch (error) {
      toast.error('Failed to add student');
      console.error('Error adding student:', error);
    }
  };

  const handleEditStudent = async (studentData: Omit<Student, '_id' | 'lastUpdated' | 'remindersSent'>) => {
    if (!editingStudent) return;
    
    try {
      const response = await studentsAPI.update(editingStudent._id, studentData);
      setStudents(students.map(s => s._id === editingStudent._id ? response.data : s));
      setEditingStudent(null);
      toast.success('Student updated successfully');
    } catch (error) {
      toast.error('Failed to update student');
      console.error('Error updating student:', error);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudent) return;
    
    try {
      await studentsAPI.delete(deleteStudent._id);
      setStudents(students.filter(s => s._id !== deleteStudent._id));
      setDeleteStudent(null);
      toast.success('Student deleted successfully');
    } catch (error) {
      toast.error('Failed to delete student');
      console.error('Error deleting student:', error);
    }
  };

  const handleSyncStudent = async (studentId: string) => {
    try {
      setSyncing(studentId);
      await studentsAPI.sync(studentId);
      await fetchStudents(); // Refresh data
      toast.success('Student data synced successfully');
    } catch (error) {
      toast.error('Failed to sync student data');
      console.error('Error syncing student:', error);
    } finally {
      setSyncing(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await studentsAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('Error exporting CSV:', error);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.currentRating, 0) / students.length)
    : 0;

  const recentlyActive = students.filter(s => 
    s.lastSubmissionDate && 
    new Date(s.lastSubmissionDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage and monitor Codeforces progress of your students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentlyActive}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>CF Handle</TableHead>
                  <TableHead className="text-center">Current Rating</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Max Rating</TableHead>
                  <TableHead className="hidden xl:table-cell">Last Updated</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{student.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.codeforcesHandle}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={student.currentRating >= 1200 ? 'default' : 'secondary'}>
                        {student.currentRating}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center hidden lg:table-cell">
                      <Badge variant="outline">{student.maxRating}</Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {student.lastUpdated ? 
                        formatDistanceToNow(new Date(student.lastUpdated), { addSuffix: true }) : 
                        'Never'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/student/${student._id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleSyncStudent(student._id)}
                            disabled={syncing === student._id}
                          >
                            <RefreshCw className={`h-4 w-4 mr-2 ${syncing === student._id ? 'animate-spin' : ''}`} />
                            Sync Data
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteStudent(student)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No students found matching your search' : 'No students added yet'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <StudentForm
        open={showForm || !!editingStudent}
        onClose={() => {
          setShowForm(false);
          setEditingStudent(null);
        }}
        onSubmit={editingStudent ? handleEditStudent : handleAddStudent}
        initialData={editingStudent}
        isEditing={!!editingStudent}
      />

      <DeleteConfirmDialog
        open={!!deleteStudent}
        onClose={() => setDeleteStudent(null)}
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleteStudent?.name}? This action cannot be undone.`}
      />
    </div>
  );
}