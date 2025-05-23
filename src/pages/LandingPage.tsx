import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCampaignData } from '../components/Data';
import FeaturedCampaigns from '../components/campaign/FeaturedCampaigns';

// Lazy load components
const Navbar = lazy(() => import('../components/Navbar'));
const HowItWorks = lazy(() => import('../components/HowItWorks'));

export default function LandingPage() {
  const { data: campaigns, loading, error } = useCampaignData();

  // Featured Campaigns
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

          </div>
        </div>
      </motion.div>

      <FeaturedCampaigns 
        campaigns={recentCampaigns}
        loading={loading}
        error={error || undefined}
        className="-mt-24"
      />

      {/* Campaign Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Recent</h2>
            <Link 
              to="/donate" 
              className="text-register-green bg-[#FFFFFF] shadow p-2 justify-between rounded-xl px-6 flex items-center gap-2"
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