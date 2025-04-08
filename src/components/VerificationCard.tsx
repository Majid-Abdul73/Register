import { Link } from 'react-router-dom';

interface VerificationCardProps {
  hasContactInfo: boolean;
  hasAddress: boolean;
  hasPopulation: boolean;
  completedSteps: number;
}

export default function VerificationCard({ 
  hasContactInfo, 
  hasAddress, 
  hasPopulation,
  completedSteps 
}: VerificationCardProps) {
  const isVerificationComplete = completedSteps === 3;

  const getNextVerificationStep = () => {
    if (!hasContactInfo) return '/verification/contact';
    if (!hasAddress) return '/verification/address';
    if (!hasPopulation) return '/verification/population';
    return '/verification';
  };

  const getNextStepText = () => {
    if (!hasContactInfo) return 'Add Contact Information';
    if (!hasAddress) return 'Add School Address';
    if (!hasPopulation) return 'Update Student Population';
    return 'Complete Verification';
  };

  return (
    <div className="bg-register-green rounded-lg p-2 text-white">
      <h2 className="text-xl font-semibold mb-4">
        {isVerificationComplete ? 'Verification Complete' : 'Complete your verification'}
      </h2>
      <p className="text-sm opacity-80 mb-4">
        {isVerificationComplete 
          ? 'Your school is fully verified'
          : 'Verified schools receive 2x more funding'}
      </p>
      
      {!isVerificationComplete && (
        <div className="text-sm mb-4">
          <span className="font-medium">
            {3 - completedSteps} out of 3
          </span> steps remaining
        </div>
      )}

      <div className="space-y-3">
        <div className={`flex items-center gap-2 ${hasContactInfo ? '' : 'opacity-60'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Contact Information</span>
        </div>

        <div className={`flex items-center gap-2 ${hasAddress ? '' : 'opacity-60'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>School Address</span>
        </div>

        <div className={`flex items-center gap-2 ${hasPopulation ? '' : 'opacity-60'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Update school population data</span>
        </div>

        {!isVerificationComplete && (
          <Link
            to={getNextVerificationStep()}
            className="block w-full px-4 py-2.5 bg-white text-register-green text-center rounded-md hover:bg-gray-50 transition-colors mt-4"
          >
            {getNextStepText()}
          </Link>
        )}
      </div>
    </div>
  );
}