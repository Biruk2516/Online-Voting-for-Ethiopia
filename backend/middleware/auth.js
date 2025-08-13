import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import User from '../models/User.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);

  if (!authHeader) {
    console.log('No authorization header');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token);

  if (!token) {
    console.log('No token in header');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // For system admin, we don't need to check the database
    if (decoded.role === 'system_admin') {
      req.user = decoded;
      req.userId = decoded.id;
      req.userRole = decoded.role;
      return next();
    }
    
    // For other users, verify in database
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Requires admin privileges' });
  }
  next();
};

export const isElectionOfficer = (req, res, next) => {
  if (req.userRole !== 'election_officer') {
    return res.status(403).json({ message: 'Requires election officer privileges' });
  }
  next();
};

export const verifyAdmin = async (req, res, next) => {
  try {
    // Allow system admin to pass through
    if (req.userRole === 'system_admin') {
      return next();
    }

    const user = await User.findById(req.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'national_admin')) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. No token found.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};

