import express from 'express';
import Submission from '../models/Submission.js';

const router = express.Router();

// Get submissions by handle
router.get('/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const { days = 90 } = req.query;
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
    const timestampThreshold = Math.floor(dateThreshold.getTime() / 1000);

    const submissions = await Submission.find({
      handle: handle,
      creationTimeSeconds: { $gte: timestampThreshold }
    }).sort({ creationTimeSeconds: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get problem solving stats
router.get('/:handle/stats', async (req, res) => {
  try {
    const { handle } = req.params;
    const { days = 30 } = req.query;
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
    const timestampThreshold = Math.floor(dateThreshold.getTime() / 1000);

    const submissions = await Submission.find({
      handle: handle,
      verdict: 'OK',
      creationTimeSeconds: { $gte: timestampThreshold }
    });

    const uniqueProblems = new Map();
    submissions.forEach(sub => {
      const key = `${sub.problem.contestId}-${sub.problem.index}`;
      if (!uniqueProblems.has(key)) {
        uniqueProblems.set(key, sub);
      }
    });

    const solvedProblems = Array.from(uniqueProblems.values());
    const totalSolved = solvedProblems.length;
    
    let hardestProblem = { name: 'None', rating: 0 };
    let totalRating = 0;
    let ratedProblems = 0;
    
    const ratingDistribution = {};
    
    solvedProblems.forEach(sub => {
      if (sub.problem.rating) {
        totalRating += sub.problem.rating;
        ratedProblems++;
        
        if (sub.problem.rating > hardestProblem.rating) {
          hardestProblem = {
            name: sub.problem.name,
            rating: sub.problem.rating
          };
        }
        
        const bucket = Math.floor(sub.problem.rating / 100) * 100;
        ratingDistribution[bucket] = (ratingDistribution[bucket] || 0) + 1;
      } else {
        ratingDistribution['unrated'] = (ratingDistribution['unrated'] || 0) + 1;
      }
    });

    const averageRating = ratedProblems > 0 ? totalRating / ratedProblems : 0;
    const averagePerDay = totalSolved / parseInt(days);

    res.json({
      totalSolved,
      averageRating,
      hardestProblem,
      averagePerDay,
      ratingDistribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get heatmap data
router.get('/:handle/heatmap', async (req, res) => {
  try {
    const { handle } = req.params;
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    
    const submissions = await Submission.aggregate([
      {
        $match: {
          handle: handle,
          creationTimeSeconds: {
            $gte: Math.floor(startDate.getTime() / 1000),
            $lte: Math.floor(endDate.getTime() / 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $toDate: { $multiply: ['$creationTimeSeconds', 1000] } }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;