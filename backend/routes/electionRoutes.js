import express from 'express';
import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import { verifyToken, isAdmin, isElectionOfficer } from '../middleware/auth.js';

const router = express.Router();

// Create election (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, region, startDate, endDate, candidates } = req.body;

    const election = new Election({
      title,
      description,
      region,
      startDate,
      endDate,
      candidates,
      createdBy: req.userId
    });

    await election.save();
    
    // Add election to candidates
    await Candidate.updateMany(
      { _id: { $in: candidates } },
      { $push: { elections: election._id } }
    );

    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote in election
router.post('/:electionId/vote', verifyToken, async (req, res) => {
  try {
    const { electionId } = req.params;
    const { candidateId } = req.body;
    const userId = req.userId;

    // Check if user already voted in this election
    const user = await User.findById(userId);
    const alreadyVoted = user.votedElections.some(e => e.election.equals(electionId));
    
    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Update candidate's votes
    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      {
        $inc: { 'votes.$[elem].count': 1 },
        $push: { 'votes.$[elem].voters': userId }
      },
      {
        arrayFilters: [{ 'elem.election': electionId }],
        new: true
      }
    );

    // Record user's vote
    await User.findByIdAndUpdate(userId, {
      $push: {
        votedElections: {
          election: electionId,
          candidate: candidateId
        }
      }
    });

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get election results
router.get('/:electionId/results', verifyToken, async (req, res) => {
  try {
    const { electionId } = req.params;
    
    const election = await Election.findById(electionId)
      .populate('candidates', 'fullName party image votes');
      
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;