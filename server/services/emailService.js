import nodemailer from 'nodemailer';
import Student from '../models/Student.js';
import Submission from '../models/Submission.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"CF Tracker" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendInactivityReminder(student) {
  const subject = 'Codeforces Activity Reminder';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hi ${student.name}!</h2>
      <p>We noticed you haven't submitted any solutions on Codeforces in the last 7 days.</p>
      <p>Regular practice is key to improving your competitive programming skills. Here are some suggestions:</p>
      <ul>
        <li>Try solving problems from the <a href="https://codeforces.com/problemset">Codeforces problemset</a></li>
        <li>Participate in upcoming contests</li>
        <li>Review problems from previous contests</li>
      </ul>
      <p>Current Rating: <strong>${student.currentRating}</strong></p>
      <p>Keep coding and good luck!</p>
      <hr>
      <p style="font-size: 12px; color: #666;">
        If you don't want to receive these reminders, contact your instructor.
      </p>
    </div>
  `;
  
  await sendEmail(student.email, subject, html);
}

export async function sendInactivityReminders() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const timestampThreshold = Math.floor(sevenDaysAgo.getTime() / 1000);
    
    // Find students who haven't submitted in 7 days
    const students = await Student.find({
      emailNotifications: true,
    });
    
    for (const student of students) {
      try {
        const recentSubmissions = await Submission.findOne({
          handle: student.codeforcesHandle,
          creationTimeSeconds: { $gte: timestampThreshold }
        });
        
        if (!recentSubmissions) {
          await sendInactivityReminder(student);
          student.remindersSent += 1;
          await student.save();
          console.log(`Sent inactivity reminder to ${student.email}`);
        }
      } catch (error) {
        console.error(`Error sending reminder to ${student.email}:`, error);
      }
    }
    
    console.log('Finished sending inactivity reminders');
  } catch (error) {
    console.error('Error in sendInactivityReminders:', error);
    throw error;
  }
}