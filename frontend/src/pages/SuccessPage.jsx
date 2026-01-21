import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const SuccessPage = () => {
  const location = useLocation();
  console.log("Success Page State:", location.state);
  const uniqueCode = location.state?.uniqueCode;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
      
      {uniqueCode && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-6 w-full max-w-sm">
          <p className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wider">Your Tracking Code</p>
          <div className="text-4xl font-mono font-bold text-indigo-600 tracking-widest">{uniqueCode}</div>
          <p className="text-xs text-gray-500 mt-2">Use this code to track your order status</p>
        </div>
      )}

      <p className="text-gray-600 mb-8 max-w-md">
        Your document has been sent to the print queue. Please save your Tracking Code for collection.
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
