import { useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import Sidebar from '../../components/Sidebar';
import SchoolProfile from '../../components/settings/SchoolProfile';
import Security from '../../components/settings/Security';
import Population from '../../components/settings/Population';
import Notifications from '../../components/settings/Notifications';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'profile', label: 'School Profile' },
    { id: 'security', label: 'Security' },
    { id: 'population', label: 'Population' },
    { id: 'notifications', label: 'Notifications' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <DashboardHeader />
      </div>
      
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-register-green text-white p-3 rounded-full shadow-lg"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Main layout - Sidebar and Content */}
      <div className="flex pt-16">
        {/* Sidebar - Hidden on mobile, shown with overlay when menu button is clicked */}
        <div className={`fixed left-0 top-16 bottom-0 bg-white z-40 w-64 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:static lg:block shadow-md`}>
          <Sidebar />
        </div>
        
        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
        
        {/* Main content - Full width on mobile, with margin on larger screens */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 w-full lg:ml-64 transition-all duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <h1 className="text-2xl font-semibold p-6">Settings</h1>
                <nav className="-mb-px flex overflow-x-auto pb-1 px-6 space-x-4 sm:space-x-8">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                        ${activeTab === tab.id 
                          ? 'border-register-green text-register-green' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === 'profile' && <SchoolProfile />}
                {activeTab === 'security' && <Security />}
                {activeTab === 'population' && <Population />}
                {activeTab === 'notifications' && <Notifications />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}