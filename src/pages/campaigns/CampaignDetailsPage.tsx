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
        <div className="w-64 fixed left-0 top-16 bottom-0 bg-white border-r">
          <Sidebar />
        </div>
        
        {/* Main content*/}
        <div className="flex-1 ml-64 p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="col-span-2">
              <Link to="/campaigns" className="flex items-center text-gray-600 mb-4">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Campaigns
              </Link>

              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                {/* Main Image */}
                <img 
                  src={campaign.mediaUrl} 
                  alt={campaign.name}
                  className="w-full h-96 object-cover"
                />
                {/* Thumbnail Images */}
                <div className="flex gap-2 p-4 border-b relative">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="w-24 h-24 rounded-lg overflow-hidden">
                      <img 
                        src={campaign.mediaUrl} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="p-6">
                  {/* Location & School */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">
                        {campaign.location ? `${campaign.location.city}, ${campaign.location.country}` : 'Location not specified'}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-semibold mb-4">{campaign.name}</h1>

                  {/* category */}
                 <div className="border-b pb-6 flex items-center gap-2 mb-4">
                    <span className="bg-register-green text-white px-3 py-1 rounded-full text-sm">
                      {campaign.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6">{campaign.description}</p>
                  
                  <div className="border-t pt-6">
                    <h2 className="text-2xl font-medium mb-4">Updates</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        September 21, John Johnson
                      </p>
                      <p className="text-sm mt-2">
                        Lorem ipsum dolor sit amet consectetur. Ut tellus ut in cursus sed sit aliquet. Turpis habitant
                        tellus in sagittis ut suspendisse nec.
                      </p>
                    </div>
                  </div>

                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex gap-4">
                  <button className="w-full py-2 rounded-md bg-register-green border text-white" >
                    Donate
                  </button>
                  <button className="w-full py-2 rounded-md bg-register-black border text-white" >
                    Share
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">Goals & Donation</h2>
                
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
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button className="px-6 py-2 bg-black text-white rounded-md">
                    Share
                  </button>
                  <button className="px-6 py-2 bg-black text-white rounded-md">
                    Edit
                  </button>
                </div>
                <button className="w-full py-2 bg-register-green text-white rounded-md mb-6">
                  Mark as Completed
                </button>

                {/* Donors List */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-register-green" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                    <p className="text-sm text-gray-600">... people are already donated</p>
                  </div>
                <div className='flex'>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <span>Anonymous</span>
                      </div>
                      <span className="text-gray-600">$0</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <span>Anonymous</span>
                      </div>
                      <span className="text-gray-600">$0</span>
                    </div>
                    
                  </div>
                </div>

                <button className="w-full py- bg-white text-white rounded-md text-register-green text-sm mt-4">
                    View all Donors
                  </button>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}