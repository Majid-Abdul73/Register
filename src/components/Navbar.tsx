import { Link } from 'react-router-dom'
import { useState } from 'react'
import { auth } from '../config/firebase'
import { signOut } from 'firebase/auth'
import { toast, Toaster } from 'react-hot-toast'

interface NavbarProps {
  variant?: 'default' | 'transparent';
  customLinks?: Array<{ to: string; text: string }>;
  className?: string;
}

export default function Navbar({ 
  variant = 'default',
  customLinks,
  className = ''
}: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!', {
        duration: 3000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out. Please try again.', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const defaultLinks = [
    { to: "/dashboard", text: "Campaigns" },
    { to: "/how-it-works", text: "How it Works" },
    { to: "/features", text: "About Register" }
  ];

  const links = customLinks || defaultLinks;

  return (
    <div className={`w-full ${variant === 'default' ? 'bg-register-green-light' : 'bg-transparent'} py-2 ${className}`}>
      <Toaster />
      <div className={`max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 my-4 bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-2xl`}>
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="ml-1.5 font-bold text-lg">Register</span>
            <div className="bg-register-green text-white text-sm font-semibold py-0.5 px-1.5 rounded ml-2">
              FUNDS
            </div>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <div className="flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-lg font-semibold text-gray-700 hover:text-register-green"
              >
                {link.text}
              </Link>
            ))}
          </div>

          {/* Auth Buttons and User Profile */}
          <div className="flex items-center space-x-3 ml-8">
            {auth.currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2"
                >
                  <img
                    src={auth.currentUser.photoURL || "/avatar.svg"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/register"
                  className="text-md px-4 py-1 rounded-3xl text-white transition-colors bg-register-green hover:bg-register-green/90"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="text-md px-4 py-1 rounded-3xl text-white transition-colors bg-black hover:bg-black/90"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg mt-2 py-4 px-4">
            <div className="flex flex-col space-y-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-lg font-semibold text-gray-700 hover:text-register-green"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.text}
                </Link>
              ))}
              
              {auth.currentUser ? (
                <>
                  <Link
                    to="/profile"
                    className="text-lg font-semibold text-gray-700 hover:text-register-green"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-lg font-semibold text-gray-700 hover:text-register-green text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/register"
                    className="text-md px-4 py-1 rounded-3xl text-white transition-colors bg-register-green hover:bg-register-green/90 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="text-md px-4 py-1 rounded-3xl text-white transition-colors bg-black hover:bg-black/90 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
