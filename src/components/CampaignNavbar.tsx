import { Link } from 'react-router-dom';

export default function CampaignNavbar() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-semibold text-lg">Register</span>
            <div className="bg-register-green text-white text-xs font-semibold py-0.5 px-1.5 rounded ml-1">
              FUNDS
            </div>
          </Link>

          {/* Right Section with Search and User Menu */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Search Bar */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-50 border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-register-green"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* User Menu */}
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}