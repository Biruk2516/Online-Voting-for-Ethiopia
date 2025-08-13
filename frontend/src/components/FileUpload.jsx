import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'
const FileUpload = () => {
 const [cover, setCover] = useState(null);
 const [pdf, setPdf] = useState(null);

 const handleCoverChange = (e) => {
 setCover(e.target.files[0]);
 };

 const handlePdfChange = (e) => {
 setPdf(e.target.files[0]);
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 
 const formData = new FormData();
 formData.append('cover', cover);
 formData.append('book', pdf);

 try {
 const imageResponse = await axios.post('http://localhost:5555/books/upload/image', formData);
 const pdfResponse = await axios.post('http://localhost:5555/books/upload/pdf', formData);
 console.log('Image URL:', imageResponse.data.imageUrl);
 console.log('PDF URL:', pdfResponse.data.pdfUrl);
 } catch (error) {
 console.error('Error uploading files:', error);
 }
};

 return (
 <form onSubmit={handleSubmit}>
 <input type="file" accept="image/*" onChange={handleCoverChange} required />
 <input type="file" accept="application/pdf" onChange={handlePdfChange} required />
 <button type="submit">Upload</button>
 </form>
 );
};

export default FileUpload;