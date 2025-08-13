import User from '../models/User.js';
import Candidate from '../models/Candidate.js';


export const getRegionStats = async (req, res) => {
  const { region } = req.params;

  try {
    const usersInRegion = await User.find({ region, role: 'voter' });
    const totalVoters = usersInRegion.length;

    const candidates = await Candidate.find();

    let regionalVotes = 0;

    candidates.forEach(candidate => {
      const voteBlock = candidate.votes.find(v => v.region === region);
      if (voteBlock) {
        regionalVotes += voteBlock.count || 0;
      }
    });

    const turnoutPercentage = totalVoters > 0
      ? ((regionalVotes / totalVoters) * 100).toFixed(2)
      : '0.00';

    res.json({
      totalVoters,
      totalVotes: regionalVotes,
      turnoutPercentage,
    });

  } catch (err) {
    console.error('Region stats error:', err);
    res.status(500).json({ message: 'Failed to load region statistics' });
  }
};
