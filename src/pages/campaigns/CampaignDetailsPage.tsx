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

  if (loading) return <div>Loading...</div>;
  if (!campaign) return <div>Campaign not found</div>;

  // Calculate donation progress
  const donationProgress = Math.min((campaign.amountRaised / campaign.goal) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <DashboardHeader />
      </div>
      
      {/* Main layout - Sidebar and Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="fixed left-0 top-16 bottom-0 bg-white">
          <Sidebar />
        </div>
        
        {/* Main content*/}
        <div className="flex-1 ml-64 p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="col-span-2">
              <Link to="/campaigns" className="flex items-center font-semibold text-lg mb-8">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Campaigns
              </Link>

              <div className="rounded-lg overflow-hidden">
                {/* Main Image */}
                <img 
                  src={campaign.mediaUrl} 
                  alt={campaign.name}
                  className="w-full h-96 object-cover"
                />
                {/* Thumbnail Images */}
                <div className="flex gap-2 relative mt-2">
                    <button className="aspect-[4/3] w-[150px] h-full object-cover rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl text-gray-400"></span>
                        <span className="text-sm text-gray-500">Add more images</span>
                    </button>
                </div>  

                <div className="py-4">
                  {/* Location & School */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <img src="/images/location.svg" alt="" 
                      className='w-5'/>
                      <span className="text-register-green">
                        {campaign.location ? `${campaign.location.city}, ${campaign.location.country}` : 'Location not specified'}
                      </span>
                    </div>
                  </div>
                 
                 
                  <div className='flex justify-between items-center w-full'>
                <h1 className="text-xl md:text-2xl font-bold">{campaign.name}</h1>
                <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 w-[160px]">
                  Edit Campaign Title
                </button>
              </div>

                  {/* category */}
                <div className="flex justify-between items-center w-full mt-4 mb-8">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                    {campaign.category}
                  </span>
                  <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 w-[130px]">
                    Edit Category
                  </button>
                </div>



                <div className="border-t-2 border-b-2 py-8 md:py-12">
              <div className="flex justify-between items-center w-full">
                <p className="text-sm md:text-base text-gray-600 flex-1 mr-4">{campaign.description}</p>
                <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 w-[130px]">
                  Edit Description
                </button>
              </div>
            </div>

            
            <div className="mb-6">
                <div className="flex justify-between items-center w-full mt-8 mb-4">
                  <h2 className="text-xl font-bold">Updates</h2>
                  <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 w-[130px]">
                    Add an Update
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center w-full mb-2">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <span>Yesterday</span>
                        <span>by {campaign.organizer?.name}</span>
                      </div>
                      <button className="text-gray-600 text-sm font-medium bg-register-gray/10 rounded py-2 w-[130px]">
                        Edit Update
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm flex-1 mr-4">
                      Lorem ipsum dolor sit amet consectetur. Ac lectus urna cras mattis aliquam. Quam tortor facilisi varius molestie ut quam sit euismod maecenas. Sit fringilla porta consequat amet. Vitae elementum pellentesque amet nulla porttitor ut amet diam purus. Cras enim ultricies quis non pulvinar turpis etiam.
                    </p>
                  </div>
                </div>
                <h1 className='underline font-bold mt-4'>See older updates</h1>
              </div>
                </div>

                <div className="rounded-lg shadow-sm p-4">
                <div className="flex gap-4">
                <button className="w-full py-2 rounded-md bg-register-black border text-white" >
                    Share
                  </button>
                  <button className="w-full py-2 rounded-md bg-register-red border text-white" >
                    Delete Campaign
                  </button>
                </div>
              </div>

              <div className="rounded-lg shadow-sm p-6">
                <h2 className="font-medium mb-4">Organizer</h2>
                <div className="flex items-center">
                  <img 
                    src={campaign.organizer?.profileImage || '/avatar.svg'} 
                    alt={campaign.organizer?.name || 'Anonymous'}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{campaign.organizer?.name }</p>
                    <p className="text-sm text-gray-500">Campaign organizer</p>
                  </div>
                </div>
              </div>

              </div>
            </div>

            {/* Right Column - Donation Info */}
            <div className="space-y-6">
              {/* Goals & Donation Card */}
              <h2 className="text-lg font-semibold mb-4">Goals & Donation</h2>

              <div className="bg-white rounded-lg shadow-sm p-4">
                
                {/* Circular Progress */}
                <div className="relative w-32 h-32 mx-auto mb-4">
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
                      className="text-2xl font-medium"
                      textAnchor="middle"
                      dy=".3em"
                      fill="currentColor"
                    >
                      {Math.round(donationProgress)}%
                    </text>
                  </svg>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold">${campaign.amountRaised.toLocaleString()} raised</h3>
                  <p className="text-gray-500 text-sm">${campaign.goal.toLocaleString()} Goal</p>
                </div>

                {/* Action Buttons */}
               
               <div>
               <button className="w-full py-2 bg-register-red text-white rounded-md mb-6">
                  Delete Campaign
                </button>

               <button className="w-full py-2 bg-register-green text-white rounded-md mb-6">
                  Mark as Completed
                </button>
               </div>
                
<div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-register-green" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-register-green">24 people are already donated</span>
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
                        <div className="font-medium">{donor.name}</div>
                        <div className="text-sm text-gray-600">${donor.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="text-register-green text-sm hover:text-green-700 border-register-green border font-semibold py-2 px-12 rounded">
                  View all Donors
                </button>

              </div>

                
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>
      // </div>
  );
}