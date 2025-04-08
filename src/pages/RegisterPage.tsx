import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface FormData {
  schoolName: string;
  country: string;
  city: string;
  schoolType: string;
  challenges: string[];
  contactName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    country: '',
    city: '',
    schoolType: '',
    challenges: [],
    contactName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const challenges = [
    'Resources', 'Health and safety', 'Infrastructure', 'Insufficient funding', 
    'Teacher shortages', 'Lack of resources', 'Transportation', 'Outdated technology'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChallengeToggle = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge]
    }));
  };

  const handleRegistration = async () => {
    try {
      setLoading(true);
      setError('');

      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Save school data in Firestore
      await setDoc(doc(db, 'schools', userCredential.user.uid), {
        schoolName: formData.schoolName,
        country: formData.country,
        city: formData.city,
        schoolType: formData.schoolType,
        challenges: formData.challenges,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Navigate to dashboard or success page
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the final step button to use handleRegistration
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section */}
      <div className="w-1/2 bg-register-light p-8 relative"> {/* Add relative positioning */}
        <div className="max-w-md mx-auto">
          

          <Link to="/" className="flex items-center mb-14">
            <span className="ml-1.5 font-semibold text-lg">Register</span>
            <div className="bg-register-green text-white text-xs font-semibold py-0.5 px-1.5 rounded">
              FUNDS
            </div>
          </Link>
          
          <p className="text-register-green text-sm mb-2">For School Administrators & Reps</p>
          
          {/* Step content remains the same but update image paths */}
          {step === 1 && (
            <>
              <h1 className="text-3xl font-bold mb-4">Get funded to improve <br /> STEAM Education in your <br />school</h1>
              <div className="mb-4">
                <img 
                  src="/images/classroom.jpg" 
                  alt="Modern Classroom"
                  className="rounded-lg w-full h-[240px] object-cover"
                />
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <h1 className="text-3xl font-semibold mb-4">Broadcast your challenges to donors who care</h1>
              <div className="mb-4">
                <img 
                  src="/images/teacher-student.jpg" 
                  alt="Teacher and Student" 
                  className="rounded-lg w-full"
                />
              </div>
            </>
          )}
          
          {step === 3 && (
            <>
              <h1 className="text-3xl font-semibold mb-4">Verified schools receive 2x more funding</h1>
              <div className="mb-4">
                <img 
                  src="/images/steam-class.jpg" 
                  alt="STEAM Class" 
                  className="rounded-lg w-full"
                />
              </div>
            </>
          )}
          
          {step === 4 && (
            <>
              <h1 className="text-3xl font-semibold mb-4">Your final step to start to receive funding</h1>
              <div className="mb-4">
                <img 
                  src="/images/students-happy.jpg" 
                  alt="Happy Students" 
                  className="rounded-lg w-full"
                />
              </div>
            </>
          )}
          
          <p className="text-gray-600 text-sm">
            Lorem ipsum dolor sit amet consectetur. Semper enim scelerisque in pellentesque amet
          </p>

          <div className="absolute bottom-16 left-8 right-8">
            <div className="max-w-md mx-auto">
              <div className="flex space-x-2">
                {[...Array(totalSteps)].map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full ${
                      index + 1 <= step ? 'bg-register-green w-8' : 'bg-gray-200 w-2'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 p-8 relative">
        <div className="max-w-md mx-auto">
          <div className="text-right mb-8">
            <span className="text-sm text-gray-600">Have an account already? </span>
            <Link to="/login" className="text-sm text-gray-900 font-medium hover:text-register-green">
              Login →
            </Link>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mt-14">Your School Basic Information</h2>
              <p className="text-gray-600 text-sm mb-8">
                Lorem ipsum dolor sit amet consectetur. Molestie leo nulla sed a facilisis aliquet massa.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Name of School</label>
                  <input
                    type="text"
                    placeholder="Provide the name of your school"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Country</label>
                    <select 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green appearance-none bg-white"
                    >
                      <option value="">Select your country</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Kenya">Kenya</option>
                      <option value="SouthAfrica">South Africa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">City</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green appearance-none bg-white"
                    >
                      <option value="">Select your city</option>
                      <option value="Accra">Accra</option>
                      <option value="Kumasi">Kumasi</option>
                      <option value="Tamale">Tamale</option>
                      <option value="Cape Coast">Cape Coast</option>
                      <option value="Takoradi">Takoradi</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Private/Public</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green appearance-none bg-white">
                    <option value="">Select one option</option>
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mt-14">What best describes the challenges your school faces?</h2>
              <p className="text-gray-600 text-sm mb-8">
                Select all that apply to help donors understand your needs better
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {challenges.map(challenge => (
                  <button
                    key={challenge}
                    type="button"
                    onClick={() => handleChallengeToggle(challenge)}
                    className={`px-4 py-2.5 rounded-full border text-sm transition-colors ${
                      formData.challenges.includes(challenge)
                        ? 'bg-register-green text-white border-register-green'
                        : 'border-gray-300 text-gray-700 hover:border-register-green'
                    }`}
                  >
                    {challenge}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mt-14">Contact Person Details</h2>
              <p className="text-gray-600 text-sm mb-8">
                Lorem ipsum dolor sit amet consectetur. Molestie leo nulla sed a facilisis aliquet massa.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Name of School Administrator or Representative</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Provide your name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@gmail.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+233 (555) 0000 000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mt-14">Secure your account</h2>
              <p className="text-gray-600 text-sm mb-8">
                Lorem ipsum dolor sit amet consectetur. Molestie leo nulla sed a facilisis aliquet massa.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Choose Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2">
                      <img src="/images/eye.svg" alt="Show password" className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Confirm password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2">
                      <img src="/images/eye.svg" alt="Show password" className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="w-4 h-4 border-gray-300 rounded text-register-green focus:ring-register-green"
                  />
                  <span className="text-sm text-gray-600">I accept the <Link to="/terms" className="text-register-green">Terms & Conditions</Link></span>
                </label>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={handleRegistration}
                disabled={loading || !formData.acceptTerms}
                className={`w-full py-2.5 rounded-md mt-6 ${
                  loading || !formData.acceptTerms
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-register-green hover:bg-register-green/90'
                } text-white`}
              >
                {loading ? 'Creating Account...' : 'Start Receiving Funds'}
              </button>
            </div>
          )}


          {step < 4 && (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="w-full bg-black text-white rounded-md py-2.5 mt-8 hover:bg-black/90 transition-colors"
            >
              Continue
            </button>
          )}
        </div>

        {/* Move progress bar to bottom */}
        <div className="absolute bottom-16 left-8 right-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="bg-gray-200 h-2 rounded-full">
                <div 
                  className="bg-register-green h-full rounded-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 transform translate-x-full ml-2 text-sm text-gray-600">
                {step === 1 ? '30%' : step === 2 ? '50%' : step === 3 ? '60%' : '100%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}