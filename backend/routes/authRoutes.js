// authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import { JWT_SECRET, SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_PASSWORD } from '../config.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { REGION_ADMIN_KEYS } from '../config.js';
import { getRegionStats } from '../controllers/getRegionStatus.js';
import { generateUsername, generatePassword } from '../utils/helpers.js'; // You'll define these
import adminPasswords from '../config/adminPasswords.js';
import Vote from '../models/Vote.js';
import axios from 'axios';

const router = express.Router();

// GET /api/candidate/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied. Not a candidate.' });
    }

    const candidate = await Candidate.findOne({ idNumber: user.idNumber });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    res.json({ role: user.role, candidate });
  } catch (error) {
    console.error('Error fetching candidate data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_face' + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage });

router.get('/admin/region-stats/:region', getRegionStats);
// 🔐 Helper to compute SHA256 hash of a file buffer
const fileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};

// 🔍 Check if uploaded face image duplicates existing face images
async function checkDuplicateFacesByHash(uploadedFacePaths) {
  const users = await User.find({}, 'faceImage');
  const uploadedHashes = [];

  for (const path of uploadedFacePaths) {
    const h = await fileHash(path);
    uploadedHashes.push(h);
  }

  for (const user of users) {
    if (!user.faceImage) continue;
    const storedPaths = Array.isArray(user.faceImage) ? user.faceImage : [user.faceImage];
    for (const facePath of storedPaths) {
      try {
        const storedHash = await fileHash(facePath);
        if (uploadedHashes.includes(storedHash)) {
          return true; // Duplicate found
        }
      } catch (e) {
        console.warn('Error reading stored face image for hashing:', e);
      }
    }
  }
  return false;
}

// Registration route
router.post('/register', upload.array('faceImages', 5), async (req, res) => {
  try {
    console.log('Registration request received:', {
      body: req.body,
      files: req.files ? req.files.map(f => f.filename) : []
    });

    const { fullName, email, password, idNumber, role, region, zone, adminCode } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!email) missingFields.push('email');
    if (!idNumber) missingFields.push('idNumber');
    if (!region) missingFields.push('region');
    if (role !== 'national_admin' && role !== 'candidate' && !zone) missingFields.push('zone');
    if ((role === 'voter' || role === 'admin' || role === 'zone_admin' || role === 'national_admin') && !password) {
      missingFields.push('password');
    }
    if (role === 'voter' && (!req.files || req.files.length === 0)) {
      missingFields.push('faceImages');
    }

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { idNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or ID number already exists' });
    }

    // Validate admin code based on role
    if (role === 'admin') {
      if (!adminPasswords.regionAdmins[region] || adminCode !== adminPasswords.regionAdmins[region]) {
        return res.status(400).json({ message: 'Invalid admin code for this region' });
      }
    } else if (role === 'zone_admin') {
      if (!adminPasswords.zoneAdmins[region]?.[zone] || adminCode !== adminPasswords.zoneAdmins[region][zone]) {
        return res.status(400).json({ message: 'Invalid admin code for this zone' });
      }
    } else if (role === 'national_admin') {
      if (adminCode !== adminPasswords.nationalAdmin) {
        return res.status(400).json({ message: 'Invalid national admin code' });
      }
    }

    // Handle face images - remove duplicates
    const faceImages = [];
    if (req.files && req.files.length > 0) {
      const uniqueFiles = new Map();
      for (const file of req.files) {
        if (!uniqueFiles.has(file.filename)) {
          uniqueFiles.set(file.filename, file);
          faceImages.push(file.filename);
        } else {
          // Safely delete duplicate file
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.warn('Warning: Could not delete duplicate file:', file.filename);
          }
        }
      }
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      idNumber,
      role,
      region,
      zone,
      faceImages
    });

    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        region: user.region,
        zone: user.zone
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    // Clean up any uploaded files if there's an error
    if (req.files) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.warn('Warning: Could not delete file during cleanup:', file.filename);
        }
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    // First try to find user in User collection
    let user = await User.findOne({ email }).select('+password');
    console.log('User found in User collection:', user ? 'Yes' : 'No');
    
    // If not found in User collection, try Candidate collection
    if (!user) {
      console.log('Checking Candidate collection...');
      const candidate = await Candidate.findOne({ email }).select('+password');
      console.log('Candidate found:', candidate ? 'Yes' : 'No');
      
      if (candidate) {
        // Create a user object from candidate data
        user = {
          _id: candidate._id,
          fullName: candidate.fullName,
          email: candidate.email,
          password: candidate.password,
          role: 'candidate',
          region: candidate.constituency,
          idNumber: candidate.idNumber,
          comparePassword: candidate.comparePassword
        };
        console.log('Created user object from candidate');
      }
    }

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Attempting password comparison...');
    let isMatch = false;
    
    try {
      if (typeof user.comparePassword === 'function') {
        isMatch = await user.comparePassword(password);
      } else {
        isMatch = await bcrypt.compare(password, user.password);
      }
      console.log('Password match:', isMatch ? 'Yes' : 'No');
    } catch (compareError) {
      console.error('Password comparison error:', compareError);
      return res.status(500).json({ message: 'Error comparing passwords' });
    }

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        region: user.region,
        zone: user.zone // Include zone in the token
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);
    res.json({
      message: 'Login successful',
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role, 
        region: user.region,
        zone: user.zone // Include zone in the response
      },
      token
    });

  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- REGION STATS: ADMIN ONLY ---
router.get('/region-stats/:region', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { region } = req.params;
    const regionLower = region.toLowerCase();

    const candidates = await Candidate.find({
      constituency: { $regex: new RegExp(`^${region}$`, 'i') }
    });

    const stats = candidates.map(candidate => {
      let regionalVotes = 0;

      candidate.votes.forEach(voteEntry => {
        voteEntry.voters.forEach(voter => {
          if (voter.region && voter.region.toLowerCase() === regionLower) {
            regionalVotes++;
          }
        });
      });

      return {
        fullName: candidate.fullName,
        party: candidate.party,
        totalVotes: regionalVotes
      };
    });

    const totalVotesInRegion = stats.reduce((sum, c) => sum + c.totalVotes, 0);

    const result = stats.map(c => ({
      fullName: c.fullName,
      party: c.party,
      percentage: totalVotesInRegion > 0
        ? ((c.totalVotes / totalVotesInRegion) * 100).toFixed(2)
        : '0.00'
    }));

    res.json({ result });
  } catch (err) {
    console.error('Error fetching regional stats:', err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// --- NATIONAL STATS: ADMIN ONLY ---
router.get('/national-stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Verify user is a national admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'national_admin') {
      return res.status(403).json({ message: 'Access denied. National Admin only.' });
    }

    // Get all candidates
    const candidates = await Candidate.find();
    
    // Get all votes with populated user data
    const votes = await Vote.find().populate('userId', 'region');
    
    // Track unique voters and total votes
    const nationalVoters = new Set();
    let totalVotesAll = 0;

    // Process each candidate's votes
    const stats = candidates.map(candidate => {
      // Count votes for this candidate from the Vote collection
      const candidateVotes = votes.filter(vote => 
        String(vote.candidateId) === String(candidate._id)
      );
      
      let totalVotes = candidateVotes.length;
      const regionVotes = new Map();

      // Process each vote
      candidateVotes.forEach(vote => {
        if (vote.userId) {
          // Add to unique voters set
          nationalVoters.add(String(vote.userId._id));
          // Track votes by region
          const region = vote.userId.region;
          regionVotes.set(region, (regionVotes.get(region) || 0) + 1);
        }
      });

      totalVotesAll += totalVotes;

      return {
        fullName: candidate.fullName,
        party: candidate.party,
        region: candidate.constituency,
        totalVotes,
        regionBreakdown: Object.fromEntries(regionVotes)
      };
    });

    // Calculate percentages based on total votes across all candidates
    const result = stats
      .map(c => ({
        ...c,
        percentage: totalVotesAll > 0 ? ((c.totalVotes / totalVotesAll) * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.totalVotes - a.totalVotes);

    // Add summary statistics
    const summary = {
      totalCandidates: candidates.length,
      totalVoters: nationalVoters.size,
      totalVotes: totalVotesAll,
      turnoutPercentage: nationalVoters.size > 0 
        ? ((totalVotesAll / nationalVoters.size) * 100).toFixed(2) 
        : '0.00'
    };

    res.json({ 
      summary,
      result,
      votersCount: nationalVoters.size 
    });
  } catch (err) {
    console.error('Error fetching national stats:', err);
    res.status(500).json({ 
      message: 'Error fetching national stats',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Middleware to verify System Admin
const verifySystemAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'system_admin') {
      return res.status(403).json({ message: 'Access denied. System Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to verify either National Admin or System Admin
const verifyAdminOrSystemAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || (user.role !== 'national_admin' && user.role !== 'system_admin')) {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (System Admin only)
router.get('/users', verifyToken, async (req, res) => {
  try {
    console.log('User role:', req.userRole);
    console.log('User object:', req.user);
    
    if (req.userRole !== 'system_admin') {
      console.log('Access denied - not system admin');
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Fetching all users...');
    const users = await User.find({}, '-password');
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (accessible by both national admin and system admin)
router.put('/users/:id', verifyToken, verifyAdminOrSystemAdmin, async (req, res) => {
  try {
    const { fullName, email, region, zone, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // System admins cannot modify national admins
    const currentUser = await User.findById(req.userId);
    if (currentUser.role === 'system_admin' && user.role === 'national_admin') {
      return res.status(403).json({ message: 'System admins cannot modify national admins' });
    }

    user.fullName = fullName;
    user.email = email;
    user.region = region;
    user.zone = zone;
    user.role = role;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (accessible by both national admin and system admin)
router.delete('/users/:id', verifyToken, verifyAdminOrSystemAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // System admins cannot delete national admins
    const currentUser = await User.findById(req.userId);
    if (currentUser.role === 'system_admin' && user.role === 'national_admin') {
      return res.status(403).json({ message: 'System admins cannot delete national admins' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

//backend route to fetch regional statistics
router.get('/region-stats/:region', verifyToken, async (req, res) => {
  try {
    const { region } = req.params;
    const regionLower = region.toLowerCase();

    // 🔍 Only fetch candidates running in the specified region
    const candidates = await Candidate.find({
      constituency: { $regex: new RegExp(`^${region}$`, 'i') } // case-insensitive match
    });

    // 🔄 Map through each candidate and count votes from voters in that region
    const stats = candidates.map(candidate => {
      let regionalVotes = 0;

      candidate.votes.forEach(voteEntry => {
        voteEntry.voters.forEach(voter => {
          if (voter.region && voter.region.toLowerCase() === regionLower) {
            regionalVotes++;
          }
        });
      });

      return {
        fullName: candidate.fullName,
        party: candidate.party,
        totalVotes: regionalVotes
      };
    });

    // 🧮 Total votes in the region for these candidates
    const totalVotesInRegion = stats.reduce((sum, c) => sum + c.totalVotes, 0);

    // 📊 Calculate percentage per candidate
    const result = stats.map(c => ({
      fullName: c.fullName,
      party: c.party,
      percentage: totalVotesInRegion > 0
        ? ((c.totalVotes / totalVotesInRegion) * 100).toFixed(2)
        : '0.00'
    }));

    res.json({ result });
  } catch (err) {
    console.error('Error fetching regional stats:', err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}); // filter by role if needed
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// DELETE user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Fayda token exchange endpoint
router.post('/token', async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;

    if (!code || !codeVerifier || !redirectUri) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await axios.post('https://auth.verifayda.gov.et/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.FAYDA_CLIENT_ID,
      code_verifier: codeVerifier
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, id_token } = tokenResponse.data;

    // Get user info using the access token
    const userInfoResponse = await axios.get('https://auth.verifayda.gov.et/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // Verify the ID token
    const decodedIdToken = jwt.verify(id_token, process.env.FAYDA_PUBLIC_KEY);

    // Combine user info from both sources
    const userInfo = {
      ...userInfoResponse.data,
      idNumber: decodedIdToken.sub, // The subject claim contains the ID number
      verified: true
    };

    res.json({
      userInfo,
      access_token,
      id_token
    });
  } catch (error) {
    console.error('Fayda token exchange error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to exchange token',
      error: error.response?.data || error.message
    });
  }
});

router.get('/fayda/callback', async (req, res) => {
  const { code, state: nationalId } = req.query;

  try {
    const tokenRes = await axios.post('https://auth.verifayda.gov.et/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:5560/api/auth/fayda/callback',
        client_id: 'YOUR_CLIENT_ID',
        client_secret: 'YOUR_CLIENT_SECRET',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenRes.data;

    const userRes = await axios.get('https://auth.verifayda.gov.et/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (userRes.data.national_id !== nationalId) {
      return res.status(400).json({ message: 'ID Mismatch' });
    }

    // Example: store user data
    // await User.updateOne({ nationalId }, { $set: { faydaVerified: true, name: userRes.data.name } }, { upsert: true });

    res.redirect(`http://localhost:3000/signup?verified=true&id=${nationalId}`);
  } catch (error) {
    console.error('VeriFayda callback error:', error.response?.data || error.message);
    res.redirect(`http://localhost:3000/signup?verified=false`);
  }
});

// backend route - /api/fayda/exchange-code
router.post('/exchange-code', async (req, res) => {
  const { code } = req.body;
  try {
    const response = await axios.post('https://verifayda.com/connect/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:3000/fayda-callback',
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET'
    });

    // Decode ID token or fetch user info
    const userInfo = await axios.get('https://verifayda.com/connect/userinfo', {
      headers: { Authorization: `Bearer ${response.data.access_token}` }
    });

    res.json(userInfo.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fayda ID exchange failed' });
  }
});

// Backend route for national stats
router.get('/national-stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'national_admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const candidates = await Candidate.find();
    const nationalVoters = new Set();

    const stats = candidates.map(candidate => {
      let totalVotes = 0;
      candidate.votes.forEach(entry => {
        entry.voters.forEach(voter => {
          nationalVoters.add(String(voter.user));
          totalVotes++;
        });
      });
      return {
        fullName: candidate.fullName,
        party: candidate.party,
        region: candidate.constituency,
        totalVotes,
      };
    });

    const totalVotesAll = stats.reduce((acc, c) => acc + c.totalVotes, 0);

    const result = stats.map(c => ({
      ...c,
      percentage: totalVotesAll > 0 ? ((c.totalVotes / totalVotesAll) * 100).toFixed(2) : '0.00'
    }));

    res.json({ votersCount: nationalVoters.size, result });
  } catch (err) {
    console.error('Error fetching national stats:', err);
    res.status(500).json({ message: 'Error fetching national stats' });
  }
});

router.get('/admin/dashboard/:region', verifyToken, verifyAdmin, async (req, res) => {
  const { region } = req.params;

  try {
    const usersInRegion = await User.find({ region });
    const candidatesInRegion = await Candidate.find({ region });

    // Prepare vote stats
    const voteStats = candidatesInRegion.map(candidate => ({
      candidateName: candidate.name,
      votes: candidate.votes.length
    }));

    const totalVotes = voteStats.reduce((sum, item) => sum + item.votes, 0);

    res.json({
      summary: {
        totalVoters: usersInRegion.length,
        totalCandidates: candidatesInRegion.length,
        totalVotes
      },
      voteStats
    });
  } catch (error) {
    console.error('Error in admin dashboard route:', error);
    res.status(500).json({ message: 'Failed to load admin dashboard data' });
  }
});

// Face login route
router.post('/login-face', upload.single('faceImage'), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required for face login' });
    }

    const user = await User.findOne({ email });

    if (!user || !user.faceImage) {
      return res.status(404).json({ message: 'User or face data not found' });
    }

    const uploadedImagePath = req.file.path; // the just-uploaded face image from client
    const storedImagePath = path.join(__dirname, '..', 'uploads', user.faceImage); // stored during signup

    const match = await compareFaces(uploadedImagePath, storedImagePath);

    if (!match) {
      return res.status(401).json({ message: 'Face does not match' });
    }

    // Faces matched, create JWT token and respond
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, region: user.region },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful via face',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        region: user.region,
      },
      token,
    });
  } catch (error) {
    console.error('Face login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/add', upload.single('image'), async (req, res) => {
  try {
    console.log('=== Starting candidate creation ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request file:', req.file);

    const {
      fullName,
      age,
      party,
      constituency,
      bio,
      criminalRecord,
      idNumber,
      isIndependent,
      supportSignatures,
      email,
      password
    } = req.body;

    // Validate required fields
    const requiredFields = {
      fullName: 'Full Name',
      age: 'Age',
      party: 'Party',
      constituency: 'Constituency',
      bio: 'Biography',
      criminalRecord: 'Criminal Record',
      idNumber: 'ID Number',
      email: 'Email',
      password: 'Password'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !req.body[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate age
    if (age < 21) {
      console.log('Invalid age:', age);
      return res.status(400).json({ message: 'Candidate must be at least 21 years old' });
    }

    // Validate criminal record
    const validCriminalRecords = ['clean', 'pardoned', 'rehabilitated'];
    if (!validCriminalRecords.includes(criminalRecord)) {
      console.log('Invalid criminal record:', criminalRecord);
      return res.status(400).json({ 
        message: `Invalid criminal record. Must be one of: ${validCriminalRecords.join(', ')}` 
      });
    }

    console.log('Checking for existing candidate/user...');
    // Check if candidate or user already exists
    const existingCandidate = await Candidate.findOne({ $or: [{ email }, { idNumber }] });
    const existingUser = await User.findOne({ email });
    
    if (existingCandidate || existingUser) {
      console.log('Candidate or user already exists');
      return res.status(400).json({ message: 'Candidate with this email or ID number already exists.' });
    }

    console.log('Creating new candidate...');
    // Remove manual password hashing since it's handled by the model
    const newCandidate = new Candidate({
      fullName,
      age: parseInt(age),
      party,
      constituency,
      bio,
      criminalRecord,
      idNumber,
      image: req.file ? req.file.filename : null,
      isIndependent: isIndependent === 'true' || isIndependent === true,
      supportSignatures: parseInt(supportSignatures || '0'),
      email,
      password // Pass the plain password, let the model hash it
    });

    console.log('Creating new user...');
    // Create new user with candidate role
    const newUser = new User({
      fullName,
      email,
      password, // Pass the plain password, let the model hash it
      role: 'candidate',
      idNumber,
      region: constituency.toLowerCase().replace(/\s+/g, '_'), // Convert constituency to valid region format
      isVerified: true // Auto-verify candidates
    });

    console.log('Saving records...');
    try {
      // Save both records
      const [savedCandidate, savedUser] = await Promise.all([
        newCandidate.save(),
        newUser.save()
      ]);
      console.log('Records saved successfully');
      console.log('Candidate:', savedCandidate._id);
      console.log('User:', savedUser._id);

      res.status(201).json({ 
        message: 'Candidate added successfully',
        candidate: {
          fullName: savedCandidate.fullName,
          email: savedCandidate.email,
          idNumber: savedCandidate.idNumber
        }
      });
    } catch (saveError) {
      console.error('Error saving records:', saveError);
      // If there's an error, try to clean up any partially saved records
      if (newCandidate._id) {
        await Candidate.findByIdAndDelete(newCandidate._id);
      }
      if (newUser._id) {
        await User.findByIdAndDelete(newUser._id);
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Error in /add endpoint:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ GET candidates by region
router.get('/candidates/:region', verifyToken, async (req, res) => {
  try {
    const { region } = req.params;
    const candidates = await Candidate.find({ region });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching candidates' });
  }
});

// ✅ Get all candidates (for homepage)
router.get('/candidates', verifyToken, async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Failed to get candidates' });
  }
});

// ✅ CAST VOTE — Using Vote model
router.post('/vote/:candidateId', verifyToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { electionId } = req.body;
    
    // Get user information from the token
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already voted in this election
    const existingVote = await Vote.findOne({
      userId: user._id,
      electionId: electionId || null
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election.' });
    }

    // Create new vote in Vote collection
    const vote = new Vote({
      userId: user._id,
      candidateId,
      region: user.region,
      zone: user.zone,
      electionId: electionId || null,
      votedAt: new Date()
    });

    await vote.save();

    // Update candidate's votes array
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Add vote to candidate's votes array
    candidate.votes.push({
      voters: [{
        user: user._id,
        votedAt: new Date()
      }],
      count: 1
    });

    await candidate.save();

    res.json({ message: 'Vote cast successfully' });
  } catch (error) {
    console.error('Vote casting error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'You have already voted in this election.' });
    } else {
      res.status(500).json({ message: 'Error casting vote' });
    }
  }
});

// DELETE /api/auth/vote/:candidateId/clear
router.delete('/vote/:candidateId/clear', verifyToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const userId = req.userId;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    let voteCleared = false;
    const now = new Date();

    for (const voteEntry of candidate.votes) {
      // find the voter object
      const voterIndex = voteEntry.voters.findIndex(voter => String(voter.user) === String(userId));
      if (voterIndex !== -1) {
        const votedAt = voteEntry.voters[voterIndex].votedAt;
        if (!votedAt) {
          // If no votedAt stored, deny clearing (just safe fallback)
          return res.status(403).json({ message: 'Cannot clear vote after 24 hours.' });
        }
        const diffMs = now - new Date(votedAt);
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours <= 24) {
          // Remove voter from voters array
          voteEntry.voters.splice(voterIndex, 1);
          voteEntry.count = Math.max(0, voteEntry.count - 1);
          voteCleared = true;
          break;
        } else {
          return res.status(403).json({ message: 'You can only clear your vote within 24 hours.' });
        }
      }
    }

    if (!voteCleared) {
      return res.status(400).json({ message: 'You have not voted for this candidate.' });
    }

    await candidate.save();
    res.json({ message: 'Your vote has been cleared successfully.' });

  } catch (error) {
    console.error('Clear vote error:', error);
    res.status(500).json({ message: 'Failed to clear vote' });
  }
});

router.get('/verify', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add these routes to your authRoutes.js

// ✅ GET USER PROFILE
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform data to match frontend expectations
    const profileData = {
      fullName: user.fullName,
      email: user.email,
      idNumber: user.idNumber,
      region: user.region,
      zone: user.zone,
      role: user.role,
      lastLogin: user.lastLogin,
      loginHistory: user.loginHistory,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      faceImage: user.faceImage ? `/uploads/${user.faceImage}` : null
    };

    res.json(profileData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// ✅ UPDATE USER PROFILE
router.put('/profile', verifyToken, upload.single('faceImage'), async (req, res) => {
  try {
    const { fullName, email, region, zone } = req.body;
    const updates = { fullName, email, region, zone };

    // Find the user first
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Handle face image update
    if (req.file) {
      // Delete old image if it exists
      if (user.faceImage) {
        const oldPath = path.join('uploads', path.basename(user.faceImage));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updates.faceImage = req.file.filename; // Save new filename
    }

    // Apply updates
    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        region: updatedUser.region,
        zone: updatedUser.zone,
        role: updatedUser.role,
        faceImage: updatedUser.faceImage ? `/uploads/${updatedUser.faceImage}` : null,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.get('/candidate-stats/:id', async (req, res) => {
  const candidateId = req.params.id;

  try {
    const candidate = await Candidate.findById(candidateId).populate('votes');

    // Example: count votes from each region
    const regionVoteCounts = {};

    candidate.votes.forEach(vote => {
      const region = vote.region; // assuming vote stores region
      regionVoteCounts[region] = (regionVoteCounts[region] || 0) + 1;
    });

    // Calculate percentages (assuming you have region voter counts)
    const allRegions = [ "addis_ababa", "afar", "amhara", "beni_shangul",
      "diredawa", "gambela", "harari", "oromia",
      "sidama", "somali", "snnp",
      "sw_ethiopia", "tigray"]; // all regions
    const totalVotes = candidate.votes.length;
    const percentageData = allRegions.map(region => ({
      region,
      percentage: ((regionVoteCounts[region] || 0) / totalVotes * 100).toFixed(2)
    }));

    res.json({ candidate: candidate.fullName, regionStats: percentageData });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch stats' });
  }
});

// ✅ CHANGE PASSWORD
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Middleware to verify National Admin
const verifyNationalAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'national_admin') {
      return res.status(403).json({ message: 'Access denied. National Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Route to fetch all regional admins (National Admin only)
router.get('/regional-admins', verifyToken, async (req, res) => {
  try {
    console.log('Fetching regional admins. User ID:', req.userId);
    
    // First verify if the user is a national admin
    const user = await User.findById(req.userId);
    console.log('Found user:', user ? {
      id: user._id,
      role: user.role,
      email: user.email
    } : 'No user found');

    if (!user) {
      console.log('No user found with ID:', req.userId);
      return res.status(403).json({ message: 'User not found' });
    }

    if (user.role !== 'national_admin') {
      console.log('User is not national admin. Role:', user.role);
      return res.status(403).json({ message: 'Access denied. National Admin only.' });
    }

    // Then fetch all regional admins
    const admins = await User.find({ 
      role: 'admin',
      region: { $ne: 'national' } // Exclude national admin
    }).select('-password -__v -createdAt -updatedAt');
    
    console.log('Found regional admins:', admins.length);
    
    // Sort admins by region
    const sortedAdmins = admins.sort((a, b) => a.region.localeCompare(b.region));
    
    res.json(sortedAdmins);
  } catch (error) {
    console.error('Error fetching regional admins:', error);
    res.status(500).json({ message: 'Error fetching regional admins' });
  }
});

// Get voters in a region (filtered by zone)
router.get('/admin/region-voters/:region', verifyToken, async (req, res) => {
  try {
    const { region } = req.params;
    const { zone } = req.query; // Get zone from query parameters
    
    // Verify user is a zone admin
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'zone_admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Build query
    const query = { 
      region: { $regex: new RegExp(`^${region}$`, 'i') },
      role: 'voter'
    };

    // Add zone filter if provided
    if (zone) {
      query.zone = { $regex: new RegExp(`^${zone}$`, 'i') };
    }

    const voters = await User.find(query)
      .select('fullName email idNumber isVerified zone region')
      .sort({ createdAt: -1 });

    res.json(voters);
  } catch (error) {
    console.error('Error fetching region voters:', error);
    res.status(500).json({ message: 'Error fetching region voters' });
  }
});

// Delete a user (admin only)
router.delete('/admin/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminRegion = req.user.region.toLowerCase();

    // Find the user to be deleted
    const userToDelete = await User.findById(userId);
    
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure admin can only delete users from their own region
    if (userToDelete.region.toLowerCase() !== adminRegion) {
      return res.status(403).json({ message: 'Access denied. You can only delete users from your region.' });
    }

    // Don't allow deleting admins
    if (userToDelete.role === 'admin' || userToDelete.role === 'national_admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Delete user's face images if they exist
    if (userToDelete.faceImages && userToDelete.faceImages.length > 0) {
      userToDelete.faceImages.forEach(imagePath => {
        fs.unlink(imagePath, (err) => {
          if (err) console.warn('Error deleting face image:', err);
        });
      });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ GET ZONE STATS
router.get('/admin/zone-stats/:zone', verifyToken, async (req, res) => {
  try {
    const { zone } = req.params;
    
    // Verify user is a zone admin for this zone
    if (req.user.role !== 'zone_admin' || req.user.zone !== zone) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get total voters in zone
    const totalVoters = await User.countDocuments({ zone, role: 'voter' });
    
    // Get total votes cast in zone
    const totalVotes = await Vote.countDocuments({ zone });
    
    // Calculate turnout percentage
    const turnoutPercentage = totalVoters > 0 
      ? ((totalVotes / totalVoters) * 100).toFixed(2)
      : '0.00';

    res.json({
      totalVoters,
      totalVotes,
      turnoutPercentage
    });
  } catch (error) {
    console.error('Error fetching zone statistics:', error);
    res.status(500).json({ message: 'Error fetching zone statistics' });
  }
});

// ✅ GET ZONE VOTES
router.get('/admin/zone-votes/:zone', verifyToken, async (req, res) => {
  try {
    const { zone } = req.params;
    
    // Get the user from the database to verify their role and zone
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify user is a zone admin for this zone
    if (user.role !== 'zone_admin' || user.zone.toLowerCase() !== zone.toLowerCase()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get votes grouped by candidate for this zone
    const votes = await Vote.aggregate([
      { $match: { zone: { $regex: new RegExp(`^${zone}$`, 'i') } } },
      { $group: {
        _id: '$candidateId',
        votes: { $sum: 1 }
      }},
      { $lookup: {
        from: 'candidates',
        localField: '_id',
        foreignField: '_id',
        as: 'candidate'
      }},
      { $unwind: '$candidate' },
      { $project: {
        _id: 1,
        votes: 1,
        candidateName: '$candidate.fullName',
        party: '$candidate.party'
      }}
    ]);

    res.json(votes);
  } catch (error) {
    console.error('Error fetching zone votes:', error);
    res.status(500).json({ message: 'Error fetching zone votes' });
  }
});

// Get voters in a region (filtered by zone in frontend)
router.get('/admin/region-voters/:region', verifyToken, async (req, res) => {
  try {
    const { region } = req.params;
    
    // Verify user is a zone admin
    if (req.user.role !== 'zone_admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const voters = await User.find({ 
      region,
      role: 'voter'
    }).select('fullName email idNumber isVerified zone');

    res.json(voters);
  } catch (error) {
    console.error('Error fetching region voters:', error);
    res.status(500).json({ message: 'Error fetching region voters' });
  }
});

// Delete a user (zone admin can only delete users from their zone)
router.delete('/admin/users/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user is a zone admin
    if (req.user.role !== 'zone_admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get the user to be deleted
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the user is in the zone admin's zone
    if (userToDelete.zone !== req.user.zone) {
      return res.status(403).json({ message: 'Cannot delete user from different zone' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get zone admins in a region
router.get('/admin/zone-admins/:region', verifyToken, async (req, res) => {
  try {
    const { region } = req.params;
    
    // Verify user is a region admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin' || user.region.toLowerCase() !== region.toLowerCase()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Fetch zone admins in the region
    const zoneAdmins = await User.find({
      role: 'zone_admin',
      region: { $regex: new RegExp(`^${region}$`, 'i') }
    }).select('fullName email zone');

    res.json(zoneAdmins);
  } catch (error) {
    console.error('Error fetching zone admins:', error);
    res.status(500).json({ message: 'Error fetching zone admins' });
  }
});

// Delete a zone admin
router.delete('/admin/zone-admins/:adminId', verifyToken, async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Verify user is a region admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get the zone admin to be deleted
    const zoneAdmin = await User.findById(adminId);
    if (!zoneAdmin || zoneAdmin.role !== 'zone_admin' || zoneAdmin.region.toLowerCase() !== user.region.toLowerCase()) {
      return res.status(404).json({ message: 'Zone admin not found or not in your region' });
    }

    await User.findByIdAndDelete(adminId);
    res.json({ message: 'Zone admin removed successfully' });
  } catch (error) {
    console.error('Error deleting zone admin:', error);
    res.status(500).json({ message: 'Error deleting zone admin' });
  }
});

// Get votes by zone in a region
router.get('/admin/region-votes/:region', verifyToken, async (req, res) => {
  try {
    const { region } = req.params;
    
    // Verify user is a region admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin' || user.region.toLowerCase() !== region.toLowerCase()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get all votes in the region, grouped by zone and candidate
    const votes = await Vote.aggregate([
      // Match votes where the voter is from this region
      { $match: { 
        region: { $regex: new RegExp(`^${region}$`, 'i') }
      }},
      // Group by zone and candidate
      { $group: {
        _id: {
          zone: '$zone',
          candidateId: '$candidateId'
        },
        votes: { $sum: 1 }
      }},
      // Lookup candidate details
      { $lookup: {
        from: 'candidates',
        localField: '_id.candidateId',
        foreignField: '_id',
        as: 'candidate'
      }},
      { $unwind: '$candidate' },
      // Project the final format
      { $project: {
        _id: '$_id.candidateId',
        zone: '$_id.zone',
        votes: 1,
        candidateName: '$candidate.fullName',
        party: '$candidate.party'
      }}
    ]);

    // Get all candidates for reference
    const candidates = await Candidate.find().select('fullName party');

    // Get all zones in the region
    const zones = [...new Set(votes.map(v => v.zone))];

    // Create a complete dataset with all combinations
    const completeData = zones.map(zone => {
      const zoneData = { zone };
      candidates.forEach(candidate => {
        const voteEntry = votes.find(v => 
          v.zone === zone && v._id.toString() === candidate._id.toString()
        );
        zoneData[candidate.fullName] = voteEntry ? voteEntry.votes : 0;
      });
      return zoneData;
    });

    res.json(completeData);
  } catch (error) {
    console.error('Error fetching region votes:', error);
    res.status(500).json({ message: 'Error fetching region votes' });
  }
});

// Get region statistics
router.get('/admin/region-stats/:region', verifyToken, async (req, res) => {
  try {
    const { region } = req.params;
    
    // Verify user is a region admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin' || user.region.toLowerCase() !== region.toLowerCase()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get total registered users in the region
    const totalVoters = await User.countDocuments({
      region: { $regex: new RegExp(`^${region}$`, 'i') }
    });

    // Get unique users who have cast votes in the region
    const votesWithVoters = await Vote.aggregate([
      { $match: { 
        region: { $regex: new RegExp(`^${region}$`, 'i') }
      }},
      { $group: {
        _id: '$userId',
        voteCount: { $sum: 1 }
      }},
      { $count: 'totalVoters' }
    ]);

    const totalVotesCast = votesWithVoters[0]?.totalVoters || 0;

    // Calculate turnout percentage
    const turnoutPercentage = totalVoters > 0 
      ? ((totalVotesCast / totalVoters) * 100).toFixed(2)
      : '0.00';

    res.json({
      totalVoters,
      totalVotes: totalVotesCast,
      turnoutPercentage
    });
  } catch (error) {
    console.error('Error fetching region statistics:', error);
    res.status(500).json({ message: 'Error fetching region statistics' });
  }
});

// Get regional admins (for national admin)
router.get('/regional-admins', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'national_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const regionalAdmins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ region: 1 });

    res.json(regionalAdmins);
  } catch (error) {
    console.error('Error fetching regional admins:', error);
    res.status(500).json({ message: 'Error fetching regional admins' });
  }
});

// Get zone admins (for regional admin)
router.get('/zone-admins/:region', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin' || user.region.toLowerCase() !== req.params.region.toLowerCase()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const zoneAdmins = await User.find({ 
      role: 'zone_admin',
      region: { $regex: new RegExp(`^${req.params.region}$`, 'i') }
    })
    .select('-password')
    .sort({ zone: 1 });

    res.json(zoneAdmins);
  } catch (error) {
    console.error('Error fetching zone admins:', error);
    res.status(500).json({ message: 'Error fetching zone admins' });
  }
});

// Get voters (for zone admin)
router.get('/voters/:zone', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'zone_admin' || user.zone.toLowerCase() !== req.params.zone.toLowerCase()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const voters = await User.find({ 
      role: 'voter',
      zone: { $regex: new RegExp(`^${req.params.zone}$`, 'i') }
    })
    .select('-password')
    .sort({ fullName: 1 });

    res.json(voters);
  } catch (error) {
    console.error('Error fetching voters:', error);
    res.status(500).json({ message: 'Error fetching voters' });
  }
});

// Get total votes from all candidates
router.get('/votes/total', verifyToken, async (req, res) => {
  try {
    const candidates = await Candidate.find();
    let totalVotes = 0;

    candidates.forEach(candidate => {
      candidate.votes.forEach(voteEntry => {
        totalVotes += voteEntry.count;
      });
    });

    res.json({ totalVotes });
  } catch (error) {
    console.error('Error fetching total votes:', error);
    res.status(500).json({ message: 'Error fetching total votes' });
  }
});

// System Admin Login
router.post('/system-admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('System admin login attempt:', { 
      email,
      expectedEmail: SYSTEM_ADMIN_EMAIL,
      emailMatch: email === SYSTEM_ADMIN_EMAIL
    });
    
    // Check if the email matches the system admin email
    if (email !== SYSTEM_ADMIN_EMAIL) {
      console.log('Invalid system admin email:', {
        received: email,
        expected: SYSTEM_ADMIN_EMAIL
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For system admin, we'll use a direct password comparison
    if (password !== SYSTEM_ADMIN_PASSWORD) {
      console.log('Invalid system admin password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a system admin user object
    const systemAdmin = {
      _id: 'system_admin',
      email: SYSTEM_ADMIN_EMAIL,
      role: 'system_admin',
      fullName: 'System Administrator'
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: systemAdmin._id, 
        email: systemAdmin.email,
        role: systemAdmin.role 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('System admin login successful');
    res.json({
      message: 'Login successful',
      token,
      user: systemAdmin
    });
  } catch (error) {
    console.error('System admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (System Admin only)
router.get('/users', verifyToken, async (req, res) => {
  try {
    console.log('User role:', req.userRole);
    console.log('User object:', req.user);
    
    if (req.userRole !== 'system_admin') {
      console.log('Access denied - not system admin');
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Fetching all users...');
    const users = await User.find({}, '-password');
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (System Admin only)
router.put('/users/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'system_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { fullName, email, region, zone, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName;
    user.email = email;
    user.region = region;
    user.zone = zone;
    user.role = role;

    await user.save();
    res.json({ ...user.toObject(), password: undefined });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (System Admin only)
router.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'system_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
