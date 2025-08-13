import mongoose from "mongoose";


const bookSchema = mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        author: {
            type:String,
            required:true
        },
        publisher: {
            type:String,
            required:true
        },
        description: {
            type:String,
            required:true
        },
        publishYear: {
            type:Number,
            required:true
        },
        price: {
            type:Number,
            required:true
        },
        image: {
            type:String,
            required:true
        }

    },
        {
            timeStams:true
        }
    
);
export const Book = mongoose.model('book',bookSchema)
