import React, {useState,useContext} from 'react';
import { Link } from 'react-router-dom';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle, BiShow } from 'react-icons/bi';
import { AiOutlineEdit } from 'react-icons/ai';
import { AiOutlineClose } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { FaHeart,FaRegHeart } from 'react-icons/fa';
import { MdOutlineDelete } from 'react-icons/md';
import { MdShare } from 'react-icons/md';
import BookModal from './home/BookModal';
import { AuthContext } from './hooks/UserContext';
import BooksCard from './home/BooksCard';

function FilteredBooks({book,onClose}) {

  return (
    <div  className='fixed w-full h-screen bg-black bg-opacity-60 top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center'>
          <AiOutlineClose
          className='absolute right-6 top-6 text-3xl text-red-600 cursor-pointer bg-white'
          onClick={onClose}
        />
        {book ?<BooksCard books={book} />: <h3>book not found or there is a problem searching for the book</h3> }
        
    </div>
  )
}

export default FilteredBooks
