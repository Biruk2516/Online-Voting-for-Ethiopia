import { Link } from 'react-router-dom';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle, BiShow } from 'react-icons/bi';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { FaHeart,FaRegHeart } from 'react-icons/fa';
import { MdOutlineDelete } from 'react-icons/md';
import { MdShare } from 'react-icons/md';
import { useContext, useState } from 'react';
import BookModal from './BookModal';
import { AuthContext } from '../hooks/UserContext';
import axios from 'axios';
import Share from './Share';

const BookSingleCard = ({ book , userId}) => {
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [share, setShare] = useState(false);
  const {isLoggedIn} = useContext(AuthContext);


  const handleLike = async ()=> {
    const bookId=book._id
    try{
      if(isFavorited)
      {
        await axios.post(`http://localhost:5555/favorites/remove`,{userId,bookId});
      }
      else{
        await axios.post(`http://localhost:5555/favorites/add`,{userId, bookId})
      }
      setIsFavorited(!isFavorited);
    } catch(err)
    {
      console.log(err)
    }
  }

  return (
    <div className='border-2 border-gray-300 rounded-lg px-4 py-2 m-4 relative "shadow-lg hover:shadow-2xl transition-shadow duration-300"' style={{backgroundColor:'whitesmoke'}}>
      <h2 className='absolute top-1 right-2 px-4 py-1 bg-red-300 rounded-lg'>
        {book.publishYear}
        
      </h2>
      <h4 className='my-2 text-gray-500'><i>Ebook</i></h4>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div>
            <div className='flex justify-start items-center gap-x-2'>
            <PiBookOpenTextLight className='text-red-300 text-2xl' />
            <h2 className='my-1 text-xl text-red-600'>{book.title}</h2>
          </div>
          
          <div className='flex justify-start items-center gap-x-2'>
            <BiUserCircle className='text-red-300 text-2xl' />
            <h2 className='my-1'>{book.author}</h2>
          </div>
        </div>
        <div>
           <img src={`http://localhost:5555${book.image}`} alt="Book Cover" style={{width:'250px',height:'180px',marginLeft:'-80px',marginTop:'35px'}} />
        </div>
   

      </div>
      
 


      <div className='flex justify-end items-center gap-x-2'>
        <h2 className='my-1'>{book.price}$</h2>
      </div>
      
      <div className='flex justify-between items-center gap-x-2 mt-4 p-4' style={{backgroundColor:'lightblue',borderRadius:'20px'}}>
        <BiShow
          className='text-3xl text-blue-800 hover:text-black cursor-pointer'
          onClick={() => setShowModal(true)}
        />

        {isAdmin ? (    <><Link to={`/books/edit/${book._id}`}>
                        <AiOutlineEdit className='text-2xl text-yellow-600 hover:text-black' />
                        </Link>
                        <Link to={`/books/delete/${book._id}`}>
                        <MdOutlineDelete className='text-2xl text-red-600 hover:text-black' />
                        </Link></>)
                     : ( isLoggedIn ?<><Link to={`/books/details/${book._id}`}>
                      <BsInfoCircle className='text-2xl text-green-800 hover:text-black' />
                    </Link><button><MdShare onClick={() =>setShare(true)}  className='text-2xl text-yellow-600 hover:text-black' /></button></> : <p style={{color:'brown'}}>log in for further accessiblity</p>)}

      </div>
      {showModal && (
        <BookModal book={book} onClose={() => setShowModal(false)} />
      )}
      {share && ( <Share booklink={`http://localhost:5555/books/${book._id}`} onCancel={() => setShare(false)}  />)}
    </div>
  );
};

export default BookSingleCard;