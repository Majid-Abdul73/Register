import { Campaign } from '../../types/campaign';
import { Link } from 'react-router-dom';

interface FeaturedCampaignsProps {
  campaigns?: Campaign[];
  loading?: boolean;
  error?: Error | string;
  className?: string;
}

export default function FeaturedCampaigns({ campaigns, loading, error, className }: FeaturedCampaignsProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className || ''}`}>
      <div className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Featured</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-16">Loading...</div>
          ) : error ? (
            <div className="col-span-full text-center text-red-500 py-12">{errorMessage}</div>
          ) : (
            campaigns?.slice(0, 3).map((campaign, index) => (
              <Link 
                to={`/challenge/${campaign.id}`} 
                key={campaign.id}
                className={`bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow ${
                  index === 0 
                    ? 'col-span-1 md:col-span-2 lg:col-span-6' 
                    : 'col-span-1 lg:col-span-3'
                }`}
              >
                <div className={`relative ${index === 0 ? 'h-48 md:h-64' : 'h-48'}`}>
                  <span className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                    {campaign.category}
                  </span>
                  <img 
                    src={campaign.mediaUrl || '/assets/images/campaign-placeholder.jpg'}
                    alt={campaign.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {index === 0 ? (
                  <div className="p-4 grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-register-green">
                        <img src="/images/location.svg" alt="" className="w-4 h-4" />
                        <span className="text-sm">
                          {campaign.location?.city}, {campaign.location?.country}
                        </span>
                      </div>
                      <h3 className="font-semibold text-xl mb-2">{campaign.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {campaign.description}
                      </p>
                    </div>

                    {/* Right Column */}
                    <div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mb-4">
                        <div 
                          className="h-2 bg-register-green rounded-full"
                          style={{ 
                            width: `${Math.min((campaign.amountRaised / campaign.goal) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm font-semibold mb-4">
                        <span>Raised: ${campaign.amountRaised?.toLocaleString()}</span>
                        <span>Goal: ${campaign.goal?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img 
                          src={'/avatar.svg'} 
                          alt="" 
                          className="w-6 h-6 rounded-full shadow p-0.5 bg-[#D9D9D9]"
                        />
                        <span className="text-sm font-semibold text-gray-600">
                          {campaign.organizer?.name || 'Anonymous'}
                        </span>
                      </div>
                      <h1>makes this challenge complaint</h1>

                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-register-green">
                      <img src="/images/location.svg" alt="" className="w-4 h-4" />
                      <span className="text-sm">
                        {campaign.location?.city}, {campaign.location?.country}
                      </span>
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{campaign.name}</h3>
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
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}