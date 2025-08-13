import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { FaHeart } from 'react-icons/fa';
import { MdShare } from 'react-icons/md';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle } from 'react-icons/bi';
import Share from '../components/home/Share';


const ShowBook = () => {
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(false);
  const [share, setShare] = useState(false)
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5555/books/${id}`)
      .then((response) => {
        setBook(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  return (
    <div className='p-4 justify-center' style={{backgroundImage:'url(/download3.jpg)'}}>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginBottom:'15px',fontSize:'2.5em'}}>
        <BackButton />
        <h1 className=' my-4' style={{backgroundColor:'lightblue',borderRadius:'10px',margin:'10px'}}>Show Book</h1>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="min-h-screen bg-gray-100 flex flex-col ">
         <div className="bg-white shadow-md p-4 ml-14">
         <h1 className="text-2xl font-bold ml-10 m-5 text-red-500" style={{border:'2px dashed red',width:'500px',textAlign:'center'}} > <PiBookOpenTextLight style={{marginLeft:'150px'}} />{book.title}</h1>
         <p className="text-gray-500"> Published in {book.publishYear} on Ebook</p>
         </div>
        
        <div style={{display:'flex',justifyContent:'space-around'}}>
          <div className=" p-6 bg-white shadow-md rounded-lg mt-4 ml-10" style={{width:'600px',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>
          <h2 className="text-xl shadow-md font-semibold">Overview</h2>
          <p className="mt-2 shadow-md text-gray-700" style={{width:'500px'}}>{book.description}</p>
          
          <div className="mt-10 ">
          <h3 className="text-lg  shadow-md font-semibold">Author </h3>
          <div className=' shadow-md'>
          <h3 className="text-lg font-semibold text-red-400"><BiUserCircle />{book.author}</h3>
          <p className="mt-1 text-gray-600">{book.publisher}</p>
          </div>
          </div>
      
          {share && ( <Share booklink={`http://localhost:5555/books/${book._id}`} onCancel={() => setShare(false)}  />)}    
          <div className="flex items-center mt-6" style={{fontSize:'2.5em',justifyContent:'space-around'}}>
          <button onClick={() =>setShare(true)} className="text-blue-500">
            <MdShare />
          </button>
          
          </div>
          <p>&copy;{new Date().getFullYear()}</p>
          </div>

          <div style={{marginTop:'10px'}}>
            <img src={`http://localhost:5555${book.image}`}  alt=""  style={{width:'400px',height:'400px',margin:'5px'}} />
            <img src="/bookstore.png" alt="" style={{width:'400px',height:'400px',margin:"5px"}} />
          </div>

        </div>
      
         </div>
      )}
    </div>
  );
};

export default ShowBook;