import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleLogout = async () => {
    try {
      setIsNavigating(true);
      await signOut(auth);
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  const isActiveRoute = (path: string) => {
    if (path === '/campaign/list' && location.pathname.startsWith('/campaign')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="w-60 bg-white flex flex-col fixed left-0 top-1 bottom-0">
      <div className={`flex-1 p-4 ${isNavigating ? 'opacity-50 pointer-events-none' : ''}`}>
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-2 rounded-lg ${
              isActiveRoute('/dashboard') ? 'text-register-green' : 'text-gray-600'
            } hover:bg-gray-50`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/campaigns"
            className={`flex items-center px-4 py-2 rounded-lg ${
              isActiveRoute('/campaigns') ? 'text-register-green' : 'text-gray-600'
            } hover:bg-gray-50`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Campaigns</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center px-4 py-2 rounded-lg ${
              isActiveRoute('/settings') ? 'text-register-green' : 'text-gray-600'
            } hover:bg-gray-50`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </Link>

          <Link
            to="/help"
            className={`flex items-center px-4 py-2 rounded-lg ${
              isActiveRoute('/settings') ? 'text-register-green' : 'text-gray-600'
            } hover:bg-gray-50`}
          >
           <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
            <path fill-rule="evenodd" clip-rule="evenodd" d="M21 6L20.25 5.25H3.75L3 6V20.5607L6.31066 17.25H20.25L21 16.5V6ZM19.5 6.75V15.75H5.68934L4.5 16.9393V6.75H19.5Z" fill="#02010e"></path> </g></svg>
            <span>Help & Support</span>
          </Link>

        </nav>
      </div>
      
      <div className="p-4 -mt-8 border-t border-gray-200 bg-white">
        <button
          className="flex items-center px-4 py-2 w-full text-gray-600 hover:bg-gray-50 rounded-lg"
          onClick={handleLogout}
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}