import { Link } from 'react-router-dom';

interface CampaignCardProps {
  id: string;
  name: string;
  category: string;
  raised: number;
  goal: number;
  date: string;
}

export default function CampaignCard({ id, name, category, raised, goal, date }: CampaignCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{date}</span>
        <span className={`px-2 py-1 rounded-full text-xs text-white ${
          category === 'Completed' ? 'bg-orange-500' : 'bg-register-green'
        }`}>
          {category}
        </span>
      </div>
      
      <Link to={`/campaigns/${id}`} className="text-gray-900 hover:text-register-green">
        <h3 className="font-medium text-sm mb-4">{name}</h3>
      </Link>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-500">Raised: </span>
          <span className="font-medium">${raised}</span>
        </div>
        <div>
          <span className="text-gray-500">Goal: </span>
          <span className="font-medium">${goal}</span>
        </div>
      </div>
    </div>
  );
}