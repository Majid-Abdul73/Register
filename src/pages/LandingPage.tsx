import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCampaignData } from '../components/Data';
import FeaturedCampaigns from '../components/FeaturedCampaigns';

// Lazy load components
const Navbar = lazy(() => import('../components/Navbar'));
const HowItWorks = lazy(() => import('../components/HowItWorks'));


export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: campaigns, loading, error, handleSearch } = useCampaignData();


  // Featured Campaigns
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const recentCampaigns = useMemo(() =>
    campaigns?.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    ).slice(0, 8) || [],
    [campaigns]
  );

  // Convert error to string for components
  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar 
          variant="transparent" 
          customLinks={[
            { to: "/donate", text: "Campaigns" },
            { to: "/how-it-works", text: "How it Works" },
            { to: "/about-us", text: "About Register" }
          ]}
          className='fixed top-0 left-0 right-0 z-50'
        />
      </Suspense>

      {/* Keep existing hero section, but wrap with motion */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative pt-16"
      >
        {/* Background color container */}
        <div className="absolute inset-0 bg-register-green-light h-[79%]" />
        
        {/* Content container */}
        <div className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-register-black mb-6">
              Contribute to the improving <br /> equitable access to K-12 STEAM <br /> Education in Africa.
            </h1>
            <Link
              to="/donate"
              className="inline-block bg-register-green text-white px-6 py-3 rounded-3xl font-medium hover:bg-green-600 transition-colors mb-12"
            >
              Donate to a Cause
            </Link>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex-1">
                  <select 
                    className="w-full px-3 py-2 border-0 bg-transparent text-gray-500 focus:ring-0"
                    defaultValue=""
                  >
                    <option>Central</option>
                    <option>Greater Accra</option>
                    <option>Western</option>
                    <option>All Locations</option>
                  </select>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Basic Contributors"
                    className="w-full px-3 py-2 border-0 bg-transparent focus:ring-0"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <button className="p-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <FeaturedCampaigns 
        campaigns={recentCampaigns}
        loading={loading}
        error={error || undefined}
        className="-mt-10"
      />

      {/* Campaign Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Recent</h2>
            <Link 
              to="/campaigns" 
              className="text-register-green hover:text-green-600 transition-colors flex items-center gap-2"
            >
              View all Campaigns
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-16">Loading...</div>
            ) : error ? (
              <div className="col-span-full text-center text-red-500 py-12">{errorMessage}</div>
            ) : (
              recentCampaigns?.map(campaign => (
                <Link 
                  to={`/challenge/${campaign.id}`}
                  key={campaign.id}
                  className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <span className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      {campaign.category}
                    </span>
                    <img 
                      src={campaign.mediaUrl || '/assets/images/campaign-placeholder.jpg'}
                      alt={campaign.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-register-green">
                      <img src="/images/location.svg" alt="" className="w-4 h-4" />
                      <span className="text-sm">
                        {campaign.location?.city}, {campaign.location?.country}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl mb-2">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {campaign.description}
                    </p>
                    <div className="w-full h-2 bg-gray-100 rounded-full mb-2">
                      <div 
                        className="h-2 bg-register-green rounded-full"
                        style={{ 
                          width: `${Math.min((campaign.amountRaised / campaign.goal) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Raised: ${campaign.amountRaised?.toLocaleString()}</span>
                      <span>Goal: ${campaign.goal?.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <HowItWorks />
      </Suspense>
    </motion.div>
  );
}