import { Link } from 'react-router-dom';
import { BsArrowLeft } from 'react-icons/bs';

const BackButton = ({ destination = '/' }) => {
  return (
    <div className='flex' style={{height:'50px',textAlign:'center'}}>
      <Link
        to={destination}
        className='bg-sky-900 text-white px-4 py-1 rounded-lg w-fit items-center '
      >
        <BsArrowLeft className='text-4xl ' />
      </Link>
    </div>
  );
};

export default BackButton;