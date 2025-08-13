import express from 'express';
import { Book } from '../models/bookModel.js';
import multer from 'multer'
import path from 'path';
const router = express.Router();


router.get('/search', async (req, res) => {
    const { title } = req.query;
     try {
        const books = await Book.find({ title: { $regex: title, $options: 'i' } }); // Case-insensitive search
        res.json(books);
        } catch (error) {
        res.status(500).json({ message: 'Server error' });
        }
    });

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + path.extname(file.originalname);
          cb(null, uniqueName);
        },
      });
      
      const upload = multer({ storage });
      


// Route for saving a new candidate
router.post('/', upload.single('image'), async (req, res) => {
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
      
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
      // Create new candidate document
      const newCandidate = new Candidate({
        fullName,
        age,
        party,
        constituency,
        bio,
        criminalRecord,
        idNumber,
        image: imageUrl,
        votes: 0, // Initialize votes to 0
        isIndependent: isIndependent === 'true',
        supportSignatures: isIndependent === 'true' ? supportSignatures : null,
        voters: [] // Array to track who voted for this candidate
      });
  
      await newCandidate.save();
      res.status(201).json({ 
        message: 'Candidate registered successfully', 
        candidate: newCandidate 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error registering candidate' });
    }
});



// Route for getting all candidates with voting functionality
router.get('/', verifyToken, async (request, response) => {
    try {
        const candidates = await Candidate.find({});
        return response.status(200).json({
            count: candidates.length,
            data: candidates
        });
    } catch (err) {
        console.log(err.message);
        response.status(500).send({ message: err.message });
    }
});

// Route for voting on a candidate
router.post('/:id/vote', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id; // Assuming you have user authentication

        // Check if candidate exists
        const candidate = await Candidate.findById(id);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Check if user already voted for this candidate
        if (candidate.voters.includes(userId)) {
            return res.status(400).json({ 
                message: 'You have already voted for this candidate' 
            });
        }

        // Update candidate's votes and add user to voters list
        const updatedCandidate = await Candidate.findByIdAndUpdate(
            id,
            { 
                $inc: { votes: 1 },
                $push: { voters: userId }
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Vote recorded successfully',
            candidate: updatedCandidate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing vote' });
    }
});




// Route for getting one book from database
router.get('/:id',async (request,response) => {
    try{
        const { id } = request.params;
        const book = await Book.findById(id);
        return response.status(200).json(book);

    }catch(err)
    {
        console.log(err.message);
        response.status(500).send({message: err.message})
    }
})




// Route for updating a book
router.put('/:id', async (request,response) => {
    try{
        if(!request.body.title || !request.body.author || !request.body.publishYear)
            {
                return response.status(400).send({
                    message: 'send all requuired fields: title, author, publishYear',
                })
            }

            const { id } = request.params;

            const result = await Book.findByIdAndUpdate(id, request.body)

            if(!result)
            {
                return response.status(404).send({ message: 'Book not found'})
            }

            return response.status(200).send({message: 'Book updated successfully'})


    } catch(err)
    {
        console.log(err.message);
        response.status(500).send({message: err.message})
    }
})






// Route for deleting a book
router.delete('/:id',async (request,response) => {
    try{
        const { id } = request.params;
        const result = await Book.findByIdAndDelete(id);
        
        if(!result)
            {
                return response.status(404).send({ message: 'Book not found'})
            }

            return response.status(200).send({message: 'Book deleted successfully'})

    } catch(err)
    {
        console.log(err.message);
        response.status(500).send({message: err.message})
    }
})


export default router;

