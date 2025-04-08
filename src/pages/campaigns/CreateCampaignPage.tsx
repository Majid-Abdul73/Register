import DashboardHeader from '../../components/DashboardHeader';
import CampaignForm from '../../components/CampaignForm';
import Sidebar from '../../components/Sidebar';

export default function CreateCampaignPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className=''>
      <DashboardHeader />
      </div>
            
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-52 p-20">
          <div className="max-w-2xl">
            <h1 className="text-xl text-white font-medium bg-register-green px-6 py-4 rounded-lg mb-6">
              Create a New Campaign
            </h1>
            <CampaignForm />
          </div>
        </div>
      </div>
    </div>
  );
}