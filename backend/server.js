import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import voteRoutes from './routes/voteRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    // Log environment variables (for debugging)
    console.log('Environment variables loaded:');
    console.log('SYSTEM_ADMIN_EMAIL:', process.env.SYSTEM_ADMIN_EMAIL);
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
  })
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5560;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 