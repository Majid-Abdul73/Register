import { Link } from 'react-router-dom';

export default function DashboardHeader() {
  return (
    <>
      <div className="fixed top-4 left-6 z-50">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl">Register</span>
          <div className="bg-register-green text-white text-sm font-semibold py-0.5 px-2 rounded ml-2">
            FUNDS
          </div>
        </Link>
      </div>

      {/* Search and Notification Section */}
      <div className="fixed top-4 right-6 z-50 flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-register-green w-64"
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </>
  );
}