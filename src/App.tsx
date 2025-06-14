import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import StudentsPage from './pages/StudentsPage';
import StudentProfile from './pages/StudentProfile';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Layout>
            <Routes>
              <Route path="/" element={<StudentsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/student/:id" element={<StudentProfile />} />
            </Routes>
          </Layout>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;