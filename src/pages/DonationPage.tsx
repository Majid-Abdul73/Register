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
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'apple' | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

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
            { to: "/how-it-works", text: "How it Works" },
            { to: "/about-us", text: "About Register" }
          ]}
        />
      </Suspense>

        <div className='absolute px-6 p-10'>
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-4 text-gray-600 mb-6"
          >
            <img src="/images/back.svg" alt="" 
            className='h-4 w-2'
            />
            Campaign
          </button>
        </div>

      <div className="max-w-2xl mx-auto px-4 py-32 mt-20">      
        {/* Main Content */}
        <div className="bg-white rounded-2xl px-6 shadow-sm">
          {/* Campaign Image */}
          <div className="h-48 rounded-xl overflow-hidden mb-6">
            <img
              src={campaign.mediaUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

        <div className='md:p-20 md:-mt-24'>
          {/* Supporting Text */}
          <div className="mb-8 border-b-2 py-5">
            <h2 className="text-register-green font-semibold text-2xl mb-1">You're supporting</h2>
            <p className="text-gray-900">{campaign.name}</p>
          </div>

          {/* Donation Amount Selection */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-register-green">Enter your donation</h3>
            
            {/* Predefined Amounts */}
            <div className="grid grid-cols-4 gap-3">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(selectedAmount === amount ? null : amount);
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
                placeholder={selectedAmount ? selectedAmount.toString() : ".00"}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-register-green/20 focus:border-register-green"
              />
            </div>

            {/* Description */}
            <div className="py-4 rounded-lg mb-8">
              <h1 className='mb-2'>Lorem ipsum </h1>
              <p className="text-md text-gray-600">
                {/* Your donation will support {campaign.name} in their mission to provide better educational facilities. */}
                Lorem ipsum dolor sit amet consectetur. Ac lectus urna cras mattis aliquam. 
                Quam tortor facilisi varius molestie ut quam sit euismod maecenas. 
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <h3 className="font-medium">Select Payment Method</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('apple')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${
                    paymentMethod === 'apple' 
                      ? 'border-register-green bg-register-green/5' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src="/images/apple-pay.svg" alt="Apple Pay" className="w-14 h-10" />
                    <span>Donate with Apple Pay</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border ${
                    paymentMethod === 'apple' 
                      ? 'border-4 border-register-green' 
                      : 'border-gray-300'
                  }`} />
                </button>

                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${
                    paymentMethod === 'stripe' 
                      ? 'border-register-green bg-register-green/5' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src="/images/stripe.svg" alt="Credit Card" className="w-14 h-10" />
                    <span>Donate with Credit or Debit</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border ${
                    paymentMethod === 'stripe' 
                      ? 'border-4 border-register-green' 
                      : 'border-gray-300'
                  }`} />
                </button>
              </div>
            </div>

            {/* Payment Details Form - Show only when stripe is selected */}
            {paymentMethod === 'stripe' && (
              <div className="space-y-4 mt-6 border p-8 rounded-xl">
                <div>
                  <label className="block text-ms font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-register-green/20 focus:border-register-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-register-green/20 focus:border-register-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="9304 XXXX XXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-register-green/20 focus:border-register-green"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">MM/YY</label>
                    <input
                      type="text"
                      placeholder="06/2025"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-register-green/20 focus:border-register-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="XXX"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-register-green/20 focus:border-register-green"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name on Card</label>
                  <input
                    type="text"
                    placeholder="9304 XXXX XXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-register-green/20 focus:border-register-green"
                  />
                </div>
              </div>
            )}

            {/* Total Amount */}
            <div className="pt-12">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600 font-semibold text-xl">Your Total Donation</span>
                <span className="text-xl font-semibold">
                  ${selectedAmount || customAmount || '0.00'}
                </span>
              </div>
              
              {/* Description */}
              <div className="py-8 text-gray-500 font-medium">
              <h1>Lorem ipsum dolor sit amet consectetur. Ac lectus urna cras mattis aliquam. 
                Quam tortor facilisi varius molestie ut quam sit euismod maecenas. 
              </h1>
              </div>

              <button
                className="w-full bg-register-green text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!paymentMethod || (!selectedAmount && !customAmount)}
              >
                Donate
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}