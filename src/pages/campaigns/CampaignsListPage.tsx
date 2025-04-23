import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';  // Add this import
import Sidebar from '../../components/Sidebar';
import DashboardHeader from '../../components/DashboardHeader';
import { useCampaignData } from '../../components/Data';

export default function CampaignsListPage() {
  const { data: allCampaigns, loading, error } = useCampaignData();
  const [sortOrder, setSortOrder] = useState<'Recent' | 'Oldest'>('Recent');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter campaigns for current user
  const campaigns = allCampaigns.filter(campaign => campaign.schoolId === auth.currentUser?.uid);

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as 'Recent' | 'Oldest');
  };

  // Sort campaigns based on selected order
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return sortOrder === 'Recent' ? dateB - dateA : dateA - dateB;
  });

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading campaigns: {error.toString()}</div>;
  }

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
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full lg:ml-64 transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Section */}
            <div className="w-full lg:flex-[2]">
              <div className="bg-register-green rounded-lg p-4 md:p-6 mb-6">
                <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-medium mb-2">
                  Broadcast your <br className="hidden md:block" />challenges to donors who care
                </h2>
                <p className="text-white/80 mb-4 text-sm md:text-base">
                  Lorem ipsum dolor sit amet consectetur. Semper enim scelerisque in pellentesque amet
                </p>
                <Link
                  to="/campaigns/new"
                  className="inline-flex items-center bg-white text-register-green px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:bg-gray-50 text-sm md:text-base"
                >
                  Create a New Campaign
                  <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Ongoing Campaigns */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Ongoing Campaign</h3>
                  <Link to="/campaigns" className="text-register-green flex items-center text-sm">
                    View all
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {loading && campaigns.length === 0 ? (
                  <div className="text-center py-8">Loading campaigns...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {sortedCampaigns.slice(0, 2).map(campaign => (
                      <div key={campaign.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="relative">
                          <img 
                            src={campaign.mediaUrl} 
                            alt={campaign.name}
                            className="w-full h-40 sm:h-48 object-cover"
                          />
                          <span className="absolute top-32 sm:top-40 left-3 bg-register-green text-white text-xs px-2 py-1 rounded-full">
                            {campaign.category}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-1 mb-2">
                          <img src="/images/location.svg" alt=""
                            className='h-4 w-4'
                            />
                            <span className="text-sm text-register-green">
                              {campaign.location ? `${campaign.location.city}, ${campaign.location.country}` : 'Loc not specified'}
                            </span>
                          </div>
                          <h3 className="font-medium mb-2">{campaign.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {campaign.description || "Lorem ipsum dolor sit amet consectetur. Semper enim scelerisque in pellentesque amet"}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                              <div 
                                className="h-2 bg-register-green rounded-full"
                                style={{ width: `${Math.min((campaign.amountRaised / campaign.goal) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm mb-4">
                            <div>
                              <span className="text-gray-500">Raised: </span>
                              <span className="font-medium">${campaign.amountRaised}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Goal: </span>
                              <span className="font-medium">${campaign.goal}</span>
                            </div>
                          </div>

                          <Link
                            to={`/campaigns/${campaign.id}`}
                            className="block w-full text-center py-2 rounded-md hover:bg-gray-100 bg-register-green-light transition-colors"
                          >
                            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 lg:gap-32">
                              View Campaign
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Recent Campaigns */}
            <div className="w-full lg:flex-1 mt-6 lg:mt-0">
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <h3 className="text-lg font-medium">Campaigns</h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Sort:</span>
                    <select 
                      className="text-sm border-none focus:outline-none text-gray-600"
                      value={sortOrder}
                      onChange={handleSortChange}
                    >
                      <option>Recent</option>
                      <option>Oldest</option>
                    </select>
                  </div>
                </div>
                <Link to="/campaigns" className="text-register-green flex items-center text-sm">
                  View all
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="space-y-4">
                {sortedCampaigns.slice(0, 5).map(campaign => (
                  <Link 
                    to={`/campaigns/${campaign.id}`}
                    key={campaign.id} 
                    className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'completed' ? 'bg-green-100 text-green-600' :
                          campaign.status === 'paused' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {new Date(campaign.startDate).toLocaleDateString('en-US', { 
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-medium mb-2">{campaign.name}</h4>

                    <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                      <span className="text-gray-600">Raised: ${campaign.amountRaised}</span>
                      <span className="text-gray-600">Goal: ${campaign.goal}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          campaign.status === 'completed' ? 'bg-green-500' :
                          campaign.status === 'paused' ? 'bg-orange-500' :
                          'bg-register-green'
                        }`}
                        style={{ width: `${Math.min((campaign.amountRaised / campaign.goal) * 100, 100)}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

