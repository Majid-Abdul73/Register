import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
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

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-1/2 bg-register-light p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <Link to="/" className="flex items-center mb-8 md:mb-14">
            <span className="ml-1.5 font-semibold text-lg">Register</span>
            <div className="bg-register-green text-white text-xs font-semibold py-0.5 px-1.5 rounded">
              FUNDS
            </div>
          </Link>
          
          <p className="text-register-green text-sm mb-2">For School Administrators & Reps</p>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Lorem ipsum dolor sit amet consectetur eu quam</h1>
          <div className="mb-4 hidden md:block">
            <img 
              src="/images/students-happy.jpg" 
              alt="Happy Students"
              className="rounded-lg w-full h-[240px] object-cover"
            />
          </div>
          
          <p className="text-gray-600 text-sm hidden md:block">
            Lorem ipsum dolor sit amet consectetur. Semper enim scelerisque in pellentesque amet
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <div className="text-right mb-4 md:mb-8">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-sm text-gray-900 font-medium hover:text-register-green">
              Sign up →
            </Link>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-xl font-semibold mt-6 md:mt-14">Sign into Register Funds</h2>
              <p className="text-gray-600 text-sm">
                Lorem ipsum dolor sit amet consectetur. Molestie leo nulla sed a facilisis aliquet massa.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@gmail.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2">
                    <img src="/images/eye.svg" alt="Show password" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-md ${
                  loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-register-green hover:bg-register-green/90'
                } text-white`}
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}