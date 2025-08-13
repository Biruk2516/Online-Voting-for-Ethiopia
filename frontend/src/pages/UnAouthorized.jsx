// src/pages/Unauthorized.jsx
const Unauthorized = () => {
  return (
    <div className="p-8 text-center text-red-500 text-xl">
      Unauthorized Access. Please <a href="/login" className="underline text-blue-500">login</a> first.
    </div>
  );
};

export default Unauthorized;
