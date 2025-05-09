import { Link } from 'react-router-dom';

interface CampaignGridProps {
  loading: boolean;
  error: string | null;
  campaigns: Campaign[];
}

interface Campaign {
    id: string;
    name: string;
    category: string;
    description: string;
    mediaUrl?: string;
    amountRaised: number;
    goal: number;
    location?: { city: string; country: string; };
    organizer?: { name: string; profileImage?: string; };
    schoolId?: string;
  }

export default function CampaignGrid({ loading, error, campaigns }: CampaignGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {loading ? (
        <div className="col-span-full text-center">Loading campaigns...</div>
      ) : error ? (
        <div className="col-span-full text-center text-red-500">{error}</div>
      ) : campaigns.length === 0 ? (
        <div className="col-span-full text-center">No campaigns found</div>
      ) : (
        campaigns.map((campaign: Campaign) => (
          <Link 
            to={`/challenge/${campaign.id}`}
            key={campaign.id} 
            className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <span className="absolute mt-40 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                {campaign.category}
              </span>
              <img 
                src={campaign.mediaUrl || '/assets/images/campaign-placeholder.jpg'}
                alt={campaign.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/images/campaign-placeholder.jpg';
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src="/images/location.svg" 
                  alt="Location" 
                  className="w-4 h-4"
                />
                <span className="text-sm text-register-green">
                  {campaign.location?.city}, {campaign.location?.country}
                </span>
              </div>
              <h3 className="font-medium mb-2">{campaign.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {campaign.description}
              </p>
          
              <div className="mb-4">
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-2 bg-register-green rounded-full"
                    style={{ 
                      width: `${Math.min((campaign.amountRaised / campaign.goal) * 100, 100)}%` 
                    }}
                  />
                </div> 
                <div className="flex justify-between text-sm -mb-4">
                  <span>Raised: ${campaign.amountRaised?.toLocaleString()}</span>
                  <span>Goal: ${campaign.goal?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}