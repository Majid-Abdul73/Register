import { useState } from 'react';
import { lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCampaignData } from '../components/Data';
import FeaturedCampaigns from '../components/campaign/FeaturedCampaigns';

const Navbar = lazy(() => import('../components/Navbar'));

export default function DonatePage() {
  const { data: campaigns, loading, error } = useCampaignData();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Convert error to string for display
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Memoize categories
  const categories = useMemo(() => [
    { id: 'all', name: 'All' },
    ...Array.from(new Set(campaigns?.map(campaign => campaign.category) || []))
      .filter(Boolean)
      .map(category => ({
        id: category,
        name: category
      }))
  ], [campaigns]);

  // Memoize filtered campaigns
  const filteredCampaigns = useMemo(() => 
    selectedCategory === 'all'
      ? campaigns
      : campaigns?.filter(campaign => campaign.category === selectedCategory),
    [campaigns, selectedCategory]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar 
          variant="transparent"
          customLinks={[
            { to: "/campaigns", text: "Campaigns" },
            { to: "/#", text: "How It Works" },
            { to: "/#", text: "About Register" }
          ]}
          className='fixed top-0 left-0 right-0 z-50'
        />
      </Suspense>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >

      <FeaturedCampaigns 
        campaigns={campaigns}
        loading={loading}
        error={error || undefined}
        className='mt-24'
      />

      {/* Campaign Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
        {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap mb-4
                  ${selectedCategory === category.id 
                    ? 'bg-register-green text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {category.name}
              </button>
            ))}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-16">Loading...</div>
            ) : error ? (
              <div className="col-span-full text-center text-red-500 py-12">{errorMessage}</div>
            ) : (
              filteredCampaigns?.map(campaign => (
                <Link 
                  to={`/challenge/${campaign.id}`} 
                  key={campaign.id}
                  className="block"
                >
                  <div 
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
                      <h3 className="font-medium mb-2">{campaign.name}</h3>
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
                      <div className="flex justify-between text-sm">
                        <span>Raised: ${campaign.amountRaised?.toLocaleString()}</span>
                        <span>Goal: ${campaign.goal?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
      
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}