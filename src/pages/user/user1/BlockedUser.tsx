import React from 'react';
import { Link } from 'react-router-dom';

const BlockedAccount = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-500 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Blocked</h2>
          
          <p className="text-gray-600 mb-6">
            Your account has been blocked by an administrator. If you believe this is an error, please contact our support team for assistance.
          </p>
          
          <div className="space-y-3">
            <Link to="/" className="block w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition duration-200">
              Return to Home
            </Link>
            
            <a 
              href="mailto:support@yourdomain.com" 
              className="block w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-200"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedAccount;