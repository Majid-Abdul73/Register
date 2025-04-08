import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import DashboardHeader from '../../components/DashboardHeader';
import Sidebar from '@/components/Sidebar';
import { useCampaignData, useSchoolData } from '../../components/Data';
import VerificationCard from '../../components/VerificationCard';

// Interfaces for type checking with userSchool and userCampaigns
export interface School {
  id: string;
  schoolName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  studentPopulation?: number;
}

interface Campaign {
  id: string;
  schoolId: string;
  name: string;
  category: string;
  description: string;
  mediaUrl?: string;
  amountRaised: number;
  goal: number;
  location?: {
    city: string;
    country: string;
  };
}

export default function DashboardPage() {
  const { data: campaigns, loading: campaignsLoading } = useCampaignData();
  const { data: schools, loading: schoolsLoading } = useSchoolData();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalDonations: 0,
    studentPopulation: 0
  });

  const userSchool = schools?.find(school => school.id === auth.currentUser?.uid);
  const userCampaigns: Campaign[] = campaigns?.filter(campaign => campaign.schoolId === auth.currentUser?.uid) || [];

  // Verification status checks
  const hasContactInfo = Boolean(userSchool?.contactName && userSchool?.email && userSchool?.phone);
  const hasAddress = Boolean(userSchool?.city && userSchool?.country);
  const hasPopulation = Boolean(userSchool?.studentPopulation);
  
  const completedSteps = [hasContactInfo, hasAddress, hasPopulation].filter(Boolean).length;

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId || campaignsLoading || schoolsLoading) return;

    // Calculate stats
    const totalDonations = userCampaigns.reduce((sum, campaign) => sum + campaign.amountRaised, 0);
    
    setStats({
      totalCampaigns: userCampaigns.length,
      totalDonations,
      studentPopulation: Number(userSchool?.studentPopulation || 0)
    });
  }, [campaigns, schools, campaignsLoading, schoolsLoading, userCampaigns, userSchool]);

  if (campaignsLoading || schoolsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="">
      <DashboardHeader />
      </div>
      
      <div className="flex pt-16">
        <div className="w-60">
          <Sidebar />
        </div>
        
        <div className="flex-1 p-8">
          {/* Main Content */}
          <div className="flex gap-8">
            {/* Left Section */}
            <div className="flex-[3] space-y-6">
              {/* Header Card */}
              <div className="bg-register-green/10 rounded-lg p-16">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <img src="/images/location.svg" alt="" className="w-4 h-4" />
                  <span className="text-sm">
                    {userCampaigns.length > 0 
                      ? `${userCampaigns[userCampaigns.length - 1].location?.city}, ${userCampaigns[userCampaigns.length - 1].location?.country}`
                      : `${userSchool?.city}, ${userSchool?.country}`
                    }
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-register-green mb-4">
                  {userCampaigns.length > 0 
                    ? userCampaigns[userCampaigns.length - 1].name
                    : userSchool?.schoolName
                  }
                </h1>
                <div className="flex gap-4">
                  <Link 
                    to="/profile" 
                    className="px-6 py-2 bg-white rounded-md text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    View Profile
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link 
                    to="campaign/new" 
                    className="px-6 py-2 bg-white rounded-md text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    Create a New Campaign
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Ongoing Campaigns */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Ongoing Campaign</h2>
                  <Link to="/list" className="text-register-green flex items-center text-sm">
                    View all
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="space-y-4">
                  {userCampaigns.slice(0, 2).map(campaign => (
                    <div key={campaign.id} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex gap-6">
                        {/* Campaign Image */}
                        <div className="w-1/2 relative">
                          <div className="aspect-[16/8] rounded-lg overflow-hidden">
                            <img 
                              src={campaign.mediaUrl || "/images/campaign-placeholder.jpg"} 
                              alt={campaign.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute bottom-2 left-2 bg-register-green text-white rounded-xl px-2 py-1">
                            <span className="text-xs">{campaign.category}</span>
                          </div>
                        </div>

                        {/* Campaign Details */}
                        <div className="w-1/2">
                          <div className="flex items-center gap-2 mb-2">
                            <img src="/images/location.svg" alt="" className="w-4 h-4" />
                            <span className="text-sm text-register-green">
                              {campaign.location?.city}, {campaign.location?.country}
                            </span>
                          </div>
                          <h3 className="font-medium mb-2">{campaign.name}</h3>
                          <p className="text-sm text-gray-500 mb-4">{campaign.description}</p>
                          <div className="w-full h-2 bg-gray-100 rounded-full mb-2">
                            <div 
                              className="h-full bg-register-green rounded-full"
                              style={{ width: `${Math.min((campaign.amountRaised / campaign.goal) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Raised: ${campaign.amountRaised}</span>
                            <span>Goal: ${campaign.goal}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex-1 space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-lg p-6">
                <div className="space-y-2">
                  <div>
                    <h3 className="text-4xl font-bold text-register-green">
                      {String(stats.totalCampaigns).padStart(2, '0')}
                    </h3>
                    <p className="text-sm text-gray-600">Launched Campaigns</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-register-green">
                      ${(stats.totalDonations / 1000).toFixed(1)}K
                    </h3>
                    <p className="text-sm text-gray-600">Donations Received</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-register-green">
                      {stats.studentPopulation.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-600">Students Population</p>
                  </div>
                </div>
              </div>

              {/* Verification Card */}
              <VerificationCard
                hasContactInfo={hasContactInfo}
                hasAddress={hasAddress}
                hasPopulation={hasPopulation}
                completedSteps={completedSteps}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}