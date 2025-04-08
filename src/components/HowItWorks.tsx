import { Link } from 'react-router-dom';

export default function HowItWorks() {
  // Steps content
  const steps = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'
  ];

  

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 -mt8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-register-green-light p-12 rounded-2xl">
          <div>
            <h2 className="text-3xl font-bold text-register-black mb-4">
              How Register<br />Funds Work
            </h2>
            <Link 
              to="/how-it-works" 
              className="hover:text-green-600 flex items-center text-sm font-medium"
            >
              Learn more
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="space-y-4 relative">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start relative">
                <div className="flex-shrink-0 mr-6 relative pt-2">
                  {/* Vertical line connecting dots */}
                  <div className="absolute top-5 left-0.5 w-0.5 h-20 bg-register-green"></div>
                  {/* Dot */}
                  <div className="w-2 h-2 rounded-full bg-register-green relative z-10"></div>
                </div>
                <div>
                  <h3 className="text-register-green text-lg font-bold mb-2">Short summary of step one</h3>
                  <p className="text-sm text-register-gray leading-relaxed">{step}</p>
                </div>
              </div>
            ))}
          </div>
          
        </div>

        {/* <div className="relative py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[120px] font-bold text-gray-400 gap-30"> Register </h2>
            <span className=" text-[100px] bg-gray-300 text-white font-bold px-6 rounded-lg">FUNDS</span>
          </div>
        </div>
      </div> */}

      <img src="/images/footer.svg" alt="footer image"
      className='mt-40' />


      </div>
   </div>
  );
}