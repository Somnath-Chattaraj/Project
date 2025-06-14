import express from 'express';
import Student from '../models/Student.js';
import { syncStudentData } from '../services/codeforcesService.js';
import { exportStudentsToCSV } from '../services/csvService.js';

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    
    // Sync initial data from Codeforces
    try {
      await syncStudentData(student);
    } catch (syncError) {
      console.error('Error syncing new student data:', syncError);
    }
    
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(400).json({ error: error.message });
  }
});

router.get('/csv/export', async (req, res) => {
  console.log("hi!");
  try {
    const students = await Student.find().sort({ name: 1 });
    const csv = exportStudentsToCSV(students);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');

    res.status(200).send('\uFEFF' + csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export students' });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const oldHandle = student.codeforcesHandle;
    Object.assign(student, req.body);
    student.lastUpdated = new Date();
    
    await student.save();

    // If Codeforces handle changed, sync new data
    if (oldHandle !== student.codeforcesHandle) {
      try {
        await syncStudentData(student);
      } catch (syncError) {
        console.error('Error syncing updated student data:', syncError);
      }
    }

    res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync student data from Codeforces
router.post('/:id/sync', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await syncStudentData(student);
    res.json({ message: 'Student data synced successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export students to CSV


export default router;