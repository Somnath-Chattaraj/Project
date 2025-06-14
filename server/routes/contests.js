import express from 'express';
import Contest from '../models/Contest.js';

const router = express.Router();

// Get contests by handle
router.get('/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const { days = 365 } = req.query;
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
    const timestampThreshold = Math.floor(dateThreshold.getTime() / 1000);

    const contests = await Contest.find({
      handle: handle,
      ratingUpdateTimeSeconds: { $gte: timestampThreshold }
    }).sort({ ratingUpdateTimeSeconds: -1 });

    res.json(contests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;