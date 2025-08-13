import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { mongoDBURL, PORT } from './config.js';
import authRoutes from './routes/authRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',  // React default port
  'http://localhost:5173',  // Vite default port
  // Add other origins if needed
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Rest of your middleware
app.use(express.json());

// Database connection
mongoose.connect(mongoDBURL)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));


// Routes
app.use('/api/auth', authRoutes);

