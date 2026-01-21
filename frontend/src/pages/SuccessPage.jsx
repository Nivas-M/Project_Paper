import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const SuccessPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Your document has been sent to the print queue. Please save your Order ID for collection.
      </p>
      <Link 
        to="/" 
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
      >
        Place Another Order
      </Link>
    </div>
  );
};

export default SuccessPage;
