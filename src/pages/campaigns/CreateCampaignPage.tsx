import { useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import CampaignForm from '../../components/campaign/CampaignForm';
import Sidebar from '../../components/Sidebar';

export default function CreateCampaignPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="flex-1 p-4 md:p-6 lg:p-8 w-full transition-all duration-300">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-xl text-white font-medium bg-register-green px-4 py-3 md:px-6 md:py-4 rounded-lg mb-4 md:mb-6">
              Create a New Campaign
            </h1>
            <CampaignForm />
          </div>
        </div>
      </div>
    </div>
  );
}