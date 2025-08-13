import BookSingleCard from './BookSingleCard';

const BooksCardFiltered = ({ books }) => {
  return (
    <div className='grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
      {books.map((item) => (
        <BookSingleCard key={item._id} book={item} />
      ))}
    </div>
  );
};

export default BooksCardFiltered;