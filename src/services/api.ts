import axios from 'axios';
import { Student, Contest, Submission, ProblemStats } from '@/types/student';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Students API
export const studentsAPI = {
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: string) => api.get<Student>(`/students/${id}`),
  create: (student: Omit<Student, '_id' | 'lastUpdated' | 'remindersSent'>) => 
    api.post<Student>('/students', student),
  update: (id: string, student: Partial<Student>) => 
    api.put<Student>(`/students/${id}`, student),
  delete: (id: string) => api.delete(`/students/${id}`),
  sync: (id: string) => api.post(`/students/${id}/sync`),
  exportCSV: () => api.get('/students/csv/export', { responseType: 'blob' }),
};

// Contest API
export const contestsAPI = {
  getByHandle: (handle: string, days?: number) => 
    api.get<Contest[]>(`/contests/${handle}?days=${days || 365}`),
};

// Submissions API
export const submissionsAPI = {
  getByHandle: (handle: string, days?: number) => 
    api.get<Submission[]>(`/submissions/${handle}?days=${days || 90}`),
  getStats: (handle: string, days?: number) => 
    api.get<ProblemStats>(`/submissions/${handle}/stats?days=${days || 30}`),
  getHeatmapData: (handle: string, year?: number) => 
    api.get(`/submissions/${handle}/heatmap?year=${year || new Date().getFullYear()}`),
};

export default api;