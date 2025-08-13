import express from 'express'
import multer from 'multer'
const path = require('path');

const app = express();

// Set storage for images
const storageImages = multer.diskStorage({
destination: (req, file, cb) => {
 cb(null, 'uploads/images');
 },
 filename: (req, file, cb) => {
cb(null, Date.now() + path.extname(file.originalname)); // Append extension
 },
});

// Set storage for PDFs
const storagePDFs = multer.diskStorage({
 destination: (req, file, cb) => {
 cb(null, 'uploads/pdfs');
 },
 filename: (req, file, cb) => {
 cb(null, Date.now() + path.extname(file.originalname)); // Append extension
 },
});

// Create upload instances
const uploadImage = multer({ storage: storageImages });
const uploadPDF = multer({ storage: storagePDFs });

// Define routes for uploading files
app.post('/upload/image', uploadImage.single('cover'), (req, res) => {
 res.json({ imageUrl:` /uploads/images/${req.file.filename}` });
});

app.post('/upload/pdf', uploadPDF.single('book'), (req, res) => {
 res.json({ pdfUrl: `/uploads/pdfs/${req.file.filename} `});
});