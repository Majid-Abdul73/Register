import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import DashboardHeader from '../../components/DashboardHeader';
import Sidebar from '../../components/Sidebar';

interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  startDate: string;
  endDate: string;
  category: string;
  amountRaised: number;
  status: string;
  mediaUrl: string;
  schoolId: string;
  location?: {
    city: string;
    country: string;
  };
  organizer?: {
    name: string;
    profileImage?: string;
  };
}

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const docRef = doc(db, 'campaigns', id!);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Fetch school data for additional details
          const schoolDoc = await getDoc(doc(db, 'schools', data.schoolId));
          const schoolData = schoolDoc.exists() ? schoolDoc.data() : null;

          setCampaign({
            id: docSnap.id,
            ...data,
            mediaUrl: data.mediaUrl || '/campaign-placeholder.jpg',
            location: schoolData ? {
              city: schoolData.city,
              country: schoolData.country
            } : data.location,
            organizer: schoolData ? {
              name: schoolData.contactName,
              profileImage: schoolData.profileImage || '/avatar.svg'
            } : data.organizer || { name: 'Unknown', profileImage: '/default-avatar.png' },
            amountRaised: Number(data.amountRaised) || 0,
            goal: Number(data.goal) || 0
          } as Campaign);
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-register-green"></div>
    </div>
  );
  
  if (!campaign) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
        <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist or has been removed.</p>
        <Link to="/campaigns" className="text-register-green hover:underline">
          Return to all campaigns
        </Link>
      </div>
    </div>
  );

  // Calculate donation progress
  const donationProgress = Math.min((campaign.amountRaised / campaign.goal) * 100, 100);

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
        <div className="flex-1 p-4 md:p-6 lg:p-8 w-full transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Main Content - Full width on mobile, 2/3 on larger screens */}
            <div className="lg:col-span-2">
              <Link to="/campaigns" className="flex items-center font-semibold text-lg mb-6">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Campaigns
              </Link>

              <div className="rounded-lg overflow-hidden bg-white shadow-sm">
                {/* Main Image */}
                <img 
                  src={campaign.mediaUrl} 
                  alt={campaign.name}
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                />
                
                {/* Thumbnail Images */}
                <div className="flex gap-2 relative mt-2 p-2 overflow-x-auto">
                  <button className="flex-shrink-0 aspect-[4/3] w-[120px] sm:w-[150px] h-full object-cover rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl text-gray-400"></span>
                    <span className="text-xs sm:text-sm text-gray-500">Add more images</span>
                  </button>
                </div>  

                <div className="p-4">
                  {/* Location & School */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <img src="/images/location.svg" alt="" className="w-5"/>
                      <span className="text-register-green text-sm">
                        {campaign.location ? `${campaign.location.city}, ${campaign.location.country}` : 'Location not specified'}
                      </span>
                    </div>
                  </div>
                 
                  {/* Campaign Title */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-3 mb-4">
                    <h1 className="text-xl md:text-2xl font-bold">{campaign.name}</h1>
                    <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 px-4 w-full sm:w-auto">
                      Edit Campaign Title
                    </button>
                  </div>

                  {/* Category */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-3 mb-6">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs w-fit">
                      {campaign.category}
                    </span>
                    <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 px-4 w-full sm:w-auto">
                      Edit Category
                    </button>
                  </div>

                  {/* Description */}
                  <div className="border-t-2 border-b-2 py-6 md:py-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start w-full gap-4">
                      <p className="text-sm md:text-base text-gray-600 flex-1">{campaign.description}</p>
                      <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 px-4 w-full sm:w-auto flex-shrink-0">
                        Edit Description
                      </button>
                    </div>
                  </div>

                  {/* Updates */}
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-3 mt-6 mb-4">
                      <h2 className="text-xl font-bold">Updates</h2>
                      <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 px-4 w-full sm:w-auto">
                        Add an Update
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-3 mb-2">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <span>Yesterday</span>
                            <span>by {campaign.organizer?.name}</span>
                          </div>
                          <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 px-4 w-full sm:w-auto">
                            Edit Update
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Lorem ipsum dolor sit amet consectetur. Ac lectus urna cras mattis aliquam. Quam tortor facilisi varius molestie ut quam sit euismod maecenas. Sit fringilla porta consequat amet. Vitae elementum pellentesque amet nulla porttitor ut amet diam purus. Cras enim ultricies quis non pulvinar turpis etiam.
                        </p>
                      </div>
                    </div>
                    <button className="underline font-bold mt-4 text-sm">See older updates</button>
                  </div>
                </div>

                {/* Action Buttons - Mobile Only */}
                <div className="rounded-lg shadow-sm py-4 px-4 lg:hidden">
                  <div className="flex gap-4">
                    <button className="w-full py-2 rounded-md bg-register-black border text-white text-sm">
                      Share
                    </button>
                    <button className="w-full py-2 rounded-md bg-register-red border text-white text-sm">
                      Delete Campaign
                    </button>
                  </div>
                </div>

                {/* Organizer */}
                <div className="rounded-lg shadow-sm py-6 px-4">
                  <h2 className="font-medium mb-4">Organizer</h2>
                  <div className="flex items-center">
                    <img 
                      src={campaign.organizer?.profileImage || '/avatar.svg'} 
                      alt={campaign.organizer?.name || 'Anonymous'}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{campaign.organizer?.name}</p>
                      <p className="text-sm text-gray-500">Campaign organizer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="rounded-lg shadow-sm py-4 mt-6 hidden lg:block">
                <div className="flex gap-4">
                  <button className="w-full py-2 rounded-md bg-register-black border text-white">
                    Share
                  </button>
                  <button className="w-full py-2 rounded-md bg-register-red border text-white">
                    Delete Campaign
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Donation Info - Full width on mobile, 1/3 on larger screens */}
            <div className="space-y-6">
              {/* Goals & Donation Card */}
              <h2 className="text-lg font-semibold mb-4">Goals & Donation</h2>

              <div className="bg-white rounded-lg shadow-sm p-4">
                {/* Circular Progress */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-register-green"
                      strokeWidth="10"
                      strokeDasharray={`${donationProgress * 283 / 100} 283`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="50"
                      className="text-xl sm:text-2xl font-medium"
                      textAnchor="middle"
                      dy=".3em"
                      fill="currentColor"
                    >
                      {Math.round(donationProgress)}%
                    </text>
                  </svg>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-semibold">${campaign.amountRaised.toLocaleString()} raised</h3>
                  <p className="text-gray-500 text-sm">${campaign.goal.toLocaleString()} Goal</p>
                </div>

                {/* Action Buttons */}
                <div>
                  <button className="w-full py-2 bg-register-red text-white rounded-md mb-3 text-sm">
                    Delete Campaign
                  </button>

                  <button className="w-full py-2 bg-register-green text-white rounded-md mb-6 text-sm">
                    Mark as Completed
                  </button>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-register-green" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-register-green text-xs sm:text-sm">24 people are already donated</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Anonymous', amount: 0 },
                      { name: 'Anonymous', amount: 0 },
                      { name: 'Anonymous', amount: 0 },
                    ].map((donor, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        <div>
                          <div className="font-medium text-sm">{donor.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600">${donor.amount}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-4">
                    <button className="text-register-green text-xs sm:text-sm hover:text-green-700 border-register-green border font-semibold py-2 px-4 sm:px-8 rounded">
                      View all Donors
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}