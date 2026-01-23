import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? 'bg-primary text-white shadow-md'
          : 'text-gray-600 hover:bg-primary/10 hover:text-primary-dark'
      }`}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-secondary/80 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
            <div className="bg-primary p-2 rounded-xl shadow-lg group-hover:bg-primary-dark transition-colors duration-300">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-primary-dark font-sans">
              Project Paper
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/status">Track Order</NavLink>
            <div className="h-4 w-px bg-primary/20 mx-2" />
            <Link 
              to="/admin/login" 
              className="text-sm font-medium text-gray-400 hover:text-primary transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary-dark p-2 rounded-md hover:bg-primary/10 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-secondary border-b border-primary/10 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              className={`block px-3 py-3 rounded-lg text-base font-medium ${
                isActive('/') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-primary/10'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/status"
              className={`block px-3 py-3 rounded-lg text-base font-medium ${
                isActive('/status') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-primary/10'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Track Order
            </Link>
            <Link
              to="/admin/login"
              className="block px-3 py-3 rounded-lg text-base font-medium text-gray-500 hover:text-primary hover:bg-primary/5"
              onClick={() => setIsOpen(false)}
            >
              Admin Access
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
