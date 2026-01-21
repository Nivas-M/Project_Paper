import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">CampusPull</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/status" 
              className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Track Order
            </Link>
            <Link 
              to="/admin/login" 
              className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
