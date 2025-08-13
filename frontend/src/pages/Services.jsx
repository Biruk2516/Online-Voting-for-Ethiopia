import React from 'react';
import '../pageStyles/service.css';
import BackButton from '../components/BackButton';

const Service = () => {
  return (
    <div className="service-page">
      <BackButton />
      <h1 className="service-title">Our Services</h1>
      <div className="service-list">
        <div className="service-item">
          <h2>Book Viewing</h2>
          <p>When you visit the Book Store, you’re not just viewing a list of titles; you’re entering a world of detailed book exploration. Each book on our website is presented with comprehensive information that includes its title, author, description, genre, and additional insights to help you make an informed decision. Our detailed view provides you with high-quality images of the book cover, a synopsis to give you a glimpse of the story, and information about the author to deepen your connection to the content. Additionally, we offer options to explore related books within the same genre, ensuring that your reading journey continues with books that suit your interests. Whether you’re a casual reader or a passionate bibliophile, our book detailed viewing feature helps you discover your next great read with all the information you 
            need at your fingertips.</p>
        </div>
        <div >
          <img src="/bookstore.png" alt="" />
        </div>
        <div className="service-item">
          <h2>Book Ordering</h2>
          <p>At Book Store, we offer a seamless and convenient book ordering experience, designed to meet the needs of every book lover. Whether you're looking to discover the latest bestsellers, classic literature, or niche genres, our easy-to-use platform allows you to browse through our extensive catalog with just a few clicks. Simply select your desired book, add it to your cart, and proceed with secure checkout. We offer multiple payment options, ensuring that the process is as smooth and efficient as possible. Once your order is placed, we work swiftly to process and ship your book to your doorstep, allowing you to enjoy your new read without delay. We are committed to providing timely delivery, and we offer customer support for any queries that may arise. Book ordering with us is not just about purchasing 
            a book—it's about experiencing the joy of reading with ease and convenience.</p>
        </div>
     
      </div>
    </div>
  );
};

export default Service;
