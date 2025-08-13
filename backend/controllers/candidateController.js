import Candidate from "../models/Candidate";
export const voteForCandidate = async (req, res) => {
  const { candidateId } = req.params;
  const { userId, electionId, region } = req.body;

  try {
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    let voteEntry = candidate.votes.find(v => v.election.toString() === electionId);

    if (!voteEntry) {
      voteEntry = { election: electionId, count: 0, voters: [] };
      candidate.votes.push(voteEntry);
    }

    const alreadyVoted = voteEntry.voters.some(v => v.user.toString() === userId);
    if (alreadyVoted) {
      return res.status(400).json({ message: 'User has already voted for this candidate in this election.' });
    }

    voteEntry.count += 1;
    voteEntry.voters.push({ user: userId, region });

    await candidate.save();
    res.status(200).json({ message: 'Vote cast successfully', candidate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Voting failed', error: err.message });
  }
};
