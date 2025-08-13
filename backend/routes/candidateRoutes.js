import express from 'express';
import Candidate from '../models/Candidate.js';
import { verifyToken, isAdmin, isElectionOfficer } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Register candidate (Admin or Election Officer only)
router.post('/', verifyToken, isElectionOfficer, upload.single('image'), async (req, res) => {
  try {
    const {
      fullName,
      age,
      party,
      constituency,
      bio,
      criminalRecord,
      idNumber,
      isIndependent,
      supportSignatures
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const candidate = new Candidate({
      fullName,
      age,
      party,
      constituency,
      bio,
      criminalRecord,
      idNumber,
      image,
      isIndependent,
      supportSignatures: isIndependent ? supportSignatures : null
    });

    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all candidates
router.get('/', verifyToken, async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;