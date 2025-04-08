import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useIndexedDB } from '../hooks/useIndexedDB';

const Navbar = lazy(() => import('../components/Navbar'));

const ChallengePage = () => {
  const { id } = useParams();
  const { getFromDB, saveToDB } = useIndexedDB();

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      try {
        // Try to get from IndexedDB first
        const cached = await getFromDB('campaigns', `campaign-${id}`);
        if (cached) return cached;
      } catch (error) {
        console.warn('IndexedDB error:', error);
        // Continue with Firestore fetch if IndexedDB fails
      }

      const campaignDoc = await getDoc(doc(db, 'campaigns', id!));
      if (!campaignDoc.exists()) throw new Error('Campaign not found');

      const data = campaignDoc.data();
      const schoolDoc = await getDoc(doc(db, 'schools', data.schoolId));
      const schoolData = schoolDoc.exists() ? schoolDoc.data() : null;

      const campaignData = {
        id: campaignDoc.id,
        ...data,
        location: schoolData ? {
          city: schoolData.city,
          country: schoolData.country
        } : data.location,
        organizer: schoolData ? {
          name: schoolData.contactName,
          profileImage: schoolData.profileImage
        } : data.organizer
      };

      // Save to IndexedDB
      try {
        await saveToDB(`campaign-${id}`, campaignData);
      } catch (error) {
        console.warn('Failed to save to IndexedDB:', error);
      }
      return campaignData;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!campaign) return <div>Campaign not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar variant="transparent" className="fixed top-0 left-0 right-0 z-50" />
      </Suspense>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-20"
      >
        {/* Back Button */}
        <button className="flex items-center gap-2 mb-4 text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All Campaigns
        </button>

        {/* Hero Section */}
        <div className="relative h-96 rounded-xl overflow-hidden mb-8">
          {/* Image Gallery */}
          <div className="absolute bottom-16 left-8 flex gap-2">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white">
                <img
                  src={campaign.mediaUrl || '/assets/images/campaign-placeholder.jpg'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
            <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm mb-4">
              {campaign.category}
            </span>
            <h1 className="text-4xl font-bold text-white mb-2">{campaign.name}</h1>
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <img src="/images/location.svg" alt="" className="w-5 h-5" />
                <span>{campaign.location?.city}, {campaign.location?.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <img 
                  src={campaign.organizer?.profileImage || '/avatar.svg'} 
                  alt="" 
                  className="w-6 h-6 rounded-full"
                />
                <span>{campaign.organizer?.name || 'Anonymous'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Views Count */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                ))}
              </div>
              <span className="text-gray-600">{campaign.views || 24839} views</span>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">24 hours live stream duration</span>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
              <h2 className="text-2xl font-semibold mb-4">About this campaign</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{campaign.description}</p>
            </div>

            {/* Updates Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
              <h2 className="text-2xl font-semibold mb-4">Updates</h2>
              <div className="border-l-2 border-gray-200 pl-4 ml-4">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Today</span>
                    <span className="text-gray-500">by {campaign.organizer?.name}</span>
                  </div>
                  <p className="text-gray-600">{campaign.updates?.[0] || 'No updates yet'}</p>
                </div>
              </div>
            </div>

            {/* Organizer Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Organizer</h2>
              <div className="flex items-center gap-4">
                <img
                  src={campaign.organizer?.profileImage || '/avatar.svg'}
                  alt=""
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{campaign.organizer?.name}</h3>
                  <p className="text-sm text-gray-600">on Behalf of</p>
                  <p className="font-medium">{campaign.name}</p>
                </div>
                <button className="ml-auto text-register-green border border-register-green px-4 py-2 rounded-lg hover:bg-register-green/10">
                  View Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Donation Box */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="mb-6">
                {/* Amount Raised */}
                <div className="flex items-baseline gap-1 mb-2">
                  <h2 className="text-2xl font-bold">${campaign.amountRaised?.toLocaleString() || '24,839'}</h2>
                  <span className="text-gray-600">raised</span>
                </div>
                
                {/* Goal and Donation Count */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>${campaign.goal?.toLocaleString() || '24,000'} Goal</span>
                  <span>•</span>
                  <span>{campaign.donationCount || '5k'} donations</span>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="absolute right-0 top-0 -translate-y-full mb-1 text-sm font-medium">
                    {Math.min(Math.round((campaign.amountRaised / campaign.goal) * 100), 100) || 40}%
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-register-green rounded-full"
                      style={{ 
                        width: `${Math.min((campaign.amountRaised / campaign.goal) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button className="w-full bg-register-green text-white py-3 px-6 rounded-lg font-medium hover:bg-register-green/90 transition-colors mb-3">
                Donate
              </button>
              <button className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-black/90 transition-colors mb-6">
                Share
              </button>

              {/* Donors List */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-register-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-register-green">24 people are already donated</span>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Anonymous', amount: 50 },
                    { name: 'Erica Johnson', amount: 50 },
                    { name: 'Michael Smith', amount: 75 },
                    { name: 'Clara Oswald', amount: 60 },
                    { name: 'Liam Neeson', amount: 90 }
                  ].map((donor, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div>
                        <div className="font-medium">{donor.name}</div>
                        <div className="text-sm text-gray-600">${donor.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Campaigns Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-8">Other Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-48">
                  <img
                    src={campaign.mediaUrl || '/assets/images/campaign-placeholder.jpg'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2">{campaign.name}</h3>
                  <div className="flex justify-between text-sm">
                    <span>Goal: ${campaign.goal?.toLocaleString()}</span>
                    <span>Raised: ${campaign.amountRaised?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChallengePage;