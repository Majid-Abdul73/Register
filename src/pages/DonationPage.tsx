import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';

const Navbar = lazy(() => import('../components/Navbar'));

export default function DonationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const docRef = doc(db, 'campaigns', id!);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Campaign not found');
      return { id: docSnap.id, ...docSnap.data() } as DocumentData;
    }
  });

  const predefinedAmounts = [50, 100, 150, 250];

  if (isLoading || !campaign) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar 
          variant="transparent" 
          className="fixed top-0 left-0 right-0 z-50"
          customLinks={[
            { to: "/campaigns", text: "Campaigns" },
            { to: "/#", text: "How It Works" },
            { to: "/#", text: "About Register" }
          ]}
        />
      </Suspense>

      <div className="max-w-2xl mx-auto px-4 py-8 mt-20">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Campaign
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Campaign Image */}
          <div className="h-48 rounded-xl overflow-hidden mb-6">
            <img
              src={campaign.mediaUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Supporting Text */}
          <div className="text-center mb-8">
            <h2 className="text-register-green font-medium mb-1">You're supporting</h2>
            <p className="text-gray-900">{campaign.name}</p>
          </div>

          {/* Donation Amount Selection */}
          <div className="space-y-6">
            <h3 className="text-center font-medium">Enter your donation</h3>
            
            {/* Predefined Amounts */}
            <div className="grid grid-cols-4 gap-3">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className={`py-2 rounded-lg border ${
                    selectedAmount === amount
                      ? 'border-register-green bg-register-green/5 text-register-green'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="00"
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-register-green/20 focus:border-register-green"
              />
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Your donation will support {campaign.name} in their mission to provide better educational facilities.
              </p>
            </div>

            {/* Continue Button */}
            <button
              className="w-full bg-register-green text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}