import axios from 'axios';
import Student from '../models/Student.js';
import Contest from '../models/Contest.js';
import Submission from '../models/Submission.js';

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

// Enhanced rate limiting (Codeforces recommends 2 requests/second)
const API_DELAY = 2000; // 2 seconds between requests

const codeforcesApiRequest = async (method, params) => {
  try {
    const response = await axios.get(`${CODEFORCES_API_BASE}/${method}`, {
      params: {
        ...params,
        lang: 'en', // Ensure English response
        ts: Date.now() // Cache buster
      },
      timeout: 10000 // 10-second timeout
    });

    if (response.data.status !== 'OK') {
      throw new Error(response.data.comment || 'Codeforces API error');
    }

    return response.data.result;
  } catch (error) {
    if (error.response) {
      const cfError = error.response.data?.comment || error.message;
      throw new Error(`Codeforces API error: ${cfError}`);
    }
    throw new Error(`Network error: ${error.message}`);
  }
};

export async function fetchUserInfo(handle) {
  try {
    return await codeforcesApiRequest('user.info', {
      handles: handle
    }).then(results => results[0]);
  } catch (error) {
    throw new Error(`Failed to fetch user info: ${error.message}`);
  }
}

export async function fetchUserRating(handle) {
  try {
    return await codeforcesApiRequest('user.rating', {
      handle
    });
  } catch (error) {
    if (error.message.includes('handle: User with handle')) {
      return []; // No rating history
    }
    throw new Error(`Failed to fetch user rating: ${error.message}`);
  }
}

export async function fetchUserSubmissions(handle) {
  try {
    return await codeforcesApiRequest('user.status', {
      handle,
      count: 1000 // Limit submissions per request
    });
  } catch (error) {
    throw new Error(`Failed to fetch user submissions: ${error.message}`);
  }
}

export async function syncStudentData(student) {
  const startTime = Date.now();
  console.log(`Starting sync for ${student.codeforcesHandle}...`);

  try {
    // Fetch and validate user
    const [userInfo, contests, submissions] = await Promise.all([
      fetchUserInfo(student.codeforcesHandle),
      fetchUserRating(student.codeforcesHandle),
      fetchUserSubmissions(student.codeforcesHandle)
    ]);

    // Update student profile
    const updates = {
      currentRating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      lastUpdated: new Date(),
      $setOnInsert: { registered: new Date() }
    };

    // Update contest history
    await Contest.deleteMany({ handle: student.codeforcesHandle });
    if (contests.length > 0) {
      const contestData = contests.map(contest => ({
        contestId: contest.contestId,
        contestName: contest.contestName,
        handle: student.codeforcesHandle,
        rank: contest.rank,
        oldRating: contest.oldRating,
        newRating: contest.newRating,
        ratingUpdateTimeSeconds: contest.ratingUpdateTimeSeconds,
        creationTimeSeconds: contest.ratingUpdateTimeSeconds // Use rating update time as fallback
      }));
      await Contest.insertMany(contestData);
    }

    // Process submissions
    await Submission.deleteMany({ handle: student.codeforcesHandle });
    if (submissions.length > 0) {
      const submissionData = submissions.map(submission => ({
        contestId: submission.contestId,
        creationTimeSeconds: submission.creationTimeSeconds,
        handle: student.codeforcesHandle,
        problem: {
          contestId: submission.problem.contestId,
          index: submission.problem.index,
          name: submission.problem.name,
          rating: submission.problem.rating || null,
          tags: submission.problem.tags || [],
        },
        verdict: submission.verdict,
        programmingLanguage: submission.programmingLanguage,
        submissionTime: new Date(submission.creationTimeSeconds * 1000)
      }));

      await Submission.insertMany(submissionData);
      
      // Find latest AC submission
      const lastAC = submissions
        .filter(s => s.verdict === 'OK')
        .sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds)[0];
      
      if (lastAC) {
        updates.lastSubmissionDate = new Date(lastAC.creationTimeSeconds * 1000);
      }
    }

    await Student.updateOne({ _id: student._id }, updates);
    console.log(`Completed sync for ${student.codeforcesHandle} in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`Sync failed for ${student.codeforcesHandle}:`, error.message);
    throw error;
  }
}

export async function syncAllStudents() {
  const students = await Student.find().select('codeforcesHandle').lean();
  console.log(`Initiating bulk sync for ${students.length} students`);

  for (const [index, student] of students.entries()) {
    try {
      await syncStudentData(student);
      
      // Progressive rate limiting
      const delayTime = API_DELAY + (index % 5) * 500;
      await new Promise(resolve => setTimeout(resolve, delayTime));
    } catch (error) {
      console.error(`Skipping ${student.codeforcesHandle} due to errors`);
      continue;
    }
  }

  console.log('Bulk sync completed');
  return { success: true, synced: students.length };
}
