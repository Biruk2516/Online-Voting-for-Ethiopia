import React, { useState, useEffect, useContext } from 'react';
import { BiSearch } from 'react-icons/bi';
import { BookFiltered } from './hooks/BookContext';
import { ButtonContext } from './hooks/SearchContext';
import axios from 'axios';
import FilteredBooks from './FilteredBooks';
import '../componentStyles/search.css'


const Search = () => {
const [searchTerm, setSearchTerm] = useState('');
const [show, setShow] = useState(false);
 const {book,setBook} = useContext(BookFiltered);


const handleSearch = async () => {
 try {
 const response = await axios.get(`http://localhost:5555/books/search?title=${searchTerm}`);
  setBook(response.data);
 } catch (error) {
 console.error('Error fetching books:', error);
 }
 };

 return (
    <div>
        <div className='search-inputs'>
        <input 
            type="text" 
            placeholder="Search for a book..." 
            value={searchTerm} 
            className='search-input'
            onChange={(e) => setSearchTerm(e.target.value)} 
            />
        <button className='search-icon'  onClick={handleSearch}><BiSearch style={{marginTop:'-5px'}} onClick={() => setShow(true) } /></button>
        </div>
        
        { show && ( <FilteredBooks book={book} onClose={() =>setShow(false)} />)}
        
    </div>
 );
};

export default Search;