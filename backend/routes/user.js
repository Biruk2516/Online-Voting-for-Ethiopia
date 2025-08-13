import express from 'express'
import UserModel from '../models/Users.js'
import { Book } from '../models/bookModel.js'

const router = express.Router()




router.post('/add', async(req,res)=> {
    const {userId,bookId} = req.body;
    try{
        const user= await UserModel.findById(userId);
        if(!user.favorites.includes(bookId)){
            user.favorites.push(bookId);
            await user.save();
        }
        res.status(200).json({ message : 'Book added to favorites'});
    } catch(err)
    {
        console.log(err)
        res.status(500).json({error: err.message})
    }
})

router.post('/remove', async (req,res)=> {
    const {userId,bookId} = req.body;
    try{
        const user= await UserModel.findById(userId);
        user.favorites.filter(id => id.toString() !== bookId);
        await user.save();
        res.status(200).json({ message:'Book removed from favorites'})

    } catch(err)
    {
        console.log(err)
        res.status(500).json({error:err.message})
    }
})


router.get('/:userId', async (req, res)=> {
    const {userId} = req.params;
    try{
        const user= await UserModel.findById(userId).populate('favorites');
        res.status(200).json(user.favorites);
    } catch(err)
    {
        console.log(err)
        res.status(500).json({error: err.message})
    }
})

export default router
