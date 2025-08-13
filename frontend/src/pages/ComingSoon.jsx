import React from 'react';
import '../pageStyles/comingsoon.css';
import BackButton from '../components/BackButton';

const ComingSoon = () => {
  return (
    <>
    <div className="coming-soon-container">
   
      <div className="message-box">
      <BackButton />
        <h1>Exciting Updates Coming Soon!</h1>
        <p>
          We're working hard to improve your experience at <strong>Book Store</strong>! 
          Soon, you'll be able to:
        </p>
        <ul>
          <li>Buy books online directly from our store</li>
          <li>Add books to your favorite list</li>
          <li>Save books for later</li>
          <li>And much more!</li>
        </ul>
        <p>Stay tuned for these exciting updates, and thank you for your support!</p>
      </div>
    </div>
    </>
  );
};

export default ComingSoon;
