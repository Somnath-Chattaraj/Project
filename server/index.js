import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';

import studentRoutes from './routes/students.js';
import contestRoutes from './routes/contests.js';
import submissionRoutes from './routes/submissions.js';
import { syncAllStudents } from './services/codeforcesService.js';
import { sendInactivityReminders } from './services/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'https://cf.somnathcodes.site'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforces-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/submissions', submissionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.post('/api/sync-all-students', async (req, res) => {
  try {
    await syncAllStudents();
    res.status(200).json({ message: 'Student sync completed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync students.' });
  }
});

app.post('/api/send-inactivity-reminders', async (req, res) => {
  try {
    await sendInactivityReminders();
    res.status(200).json({ message: 'Inactivity reminders sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send reminders.' });
  }
});

// Cron job to sync Codeforces data daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Starting daily Codeforces data sync...');
  try {
    await syncAllStudents();
    await sendInactivityReminders();
    console.log('Daily sync completed successfully');
  } catch (error) {
    console.error('Error during daily sync:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});