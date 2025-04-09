import { lazy, Suspense, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useCampaignData } from '../components/Data';
import QuickShare from '../components/QuickShare';

const Navbar = lazy(() => import('../components/Navbar'));

const ChallengePage = () => {
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { id } = useParams();
  const { getFromDB, saveToDB } = useIndexedDB();
  const { data } = useCampaignData();

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar variant="transparent" className="fixed top-0 left-0 right-0 z-50" />
      </Suspense>

      <div className="mt-20">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All Campaigns
        </button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Part 1 & 2 - Main Content */}
          <div className="col-span-1 lg:col-span-8">
            {/* Campaign Images */}
            <div className="relative rounded-xl overflow-hidden mb-2">
              <img
                src={campaign.mediaUrl || ''}
                alt=""
                className="w-full h-[200px] md:h-[300px] object-cover"
              />
            </div>
            
            {/* Image Gallery */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="w-48 md:w-64 h-24 md:h-32 flex-shrink-0 rounded-lg overflow-hidden border-2 border-white">
                  <img
                    src={campaign.mediaUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-48 md:w-64 h-24 md:h-32 flex-shrink-0 rounded-lg overflow-hidden border-2 border-white bg-black/50 flex items-center justify-center text-white">
                +24
              </div>
            </div>

            {/* Campaign Info */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center gap-4 text-register-green">
                <div className="flex items-center gap-2">
                  <img src="/images/location.svg" alt="" className="w-5 h-5" />
                  <span className="text-sm md:text-base">{campaign.location?.city}, {campaign.location?.country}</span>
                </div>
              </div>
              
              <h1 className="text-xl md:text-2xl font-bold">{campaign.name}</h1>
            </div>

            {/* Description and Updates sections */}
            <div className="border-t-2 border-b-2 py-8 md:py-12">
              <p className="text-sm md:text-base text-gray-600">{campaign.description}</p>
            </div>

            {/* Mobile Action Buttons - Show only on mobile */}
            <div className="grid grid-cols-2 gap-3 my-6 lg:hidden">
              <button 
                onClick={() => navigate(`/donation/${campaign.id}`)}
                className="bg-register-green text-white py-3 rounded-lg font-medium text-sm"
              >
                Donate
              </button>
              <button 
                onClick={() => setIsShareOpen(true)}
                className="bg-black text-white py-3 rounded-lg font-medium text-sm"
              >
                Share
              </button>
            </div>

            {/* Organizer Section */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 pt-8 md:pt-12">Organizer</h2>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <img 
                  src={'/avatar.svg'} 
                  alt="" 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-lg">{campaign.organizer?.name}</h3>
                  <p className="text-sm text-gray-500">makes this challenge campaign</p>
                </div>
              </div>
            </div>
          </div>

          {/* Part 3 - Donation Info */}
          <div className="col-span-1 lg:col-span-4">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] lg:sticky lg:top-24">
              {/* Amount Raised */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">
                  ${campaign.amountRaised?.toLocaleString()} raised
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>${campaign.goal?.toLocaleString()} Goal</span>
                  <span>•</span>
                  <span>{campaign.donationCount || '5k'} donations</span>
                </div>

                {/* Progress Circle */}
                <div className="relative w-16 h-16 ml-auto -mt-12">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E6E6E6"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="3"
                      strokeDasharray={`${(campaign.amountRaised / campaign.goal) * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm">
                    40%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button className="w-full bg-register-green text-white py-3 rounded-lg font-medium mb-3">
                Donate
              </button>
              {/* // Update the Share button: */}
              <button 
                onClick={() => setIsShareOpen(true)} 
                className="w-full bg-black text-white py-3 rounded-lg font-medium mb-6"
              >
                Share
              </button>
              
              {/* // Add the QuickShare component: */}
              <QuickShare
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                campaign={{
                  name: campaign.name,
                  url: window.location.href
                }}
              />
              {/* Recent Donors */}
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
                    // { name: 'Erica Johnson', amount: 50 },
                    // { name: 'Michael Smith', amount: 75 },
                    // { name: 'Clara Oswald', amount: 60 },
                    // { name: 'Liam Neeson', amount: 90 }
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

        {/* Bottom Section - Other Campaigns */}
        <div className="mt-12 md:mt-24 border-t-2 py-8 md:py-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8">Other Campaigns</h2>
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-4 md:gap-6" style={{ width: 'max-content' }}>
                {data?.filter(c => c.id !== campaign.id).map((otherCampaign) => (
                  <div key={otherCampaign.id} className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ width: '300px', minWidth: '300px', maxWidth: '400px' }}>
                    <div className="h-36 md:h-48">
                      <img
                        src={otherCampaign.mediaUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-2 text-sm md:text-base">{otherCampaign.name}</h3>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span>Goal: ${otherCampaign.goal?.toLocaleString()}</span>
                        <span>Raised: ${otherCampaign.amountRaised?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;