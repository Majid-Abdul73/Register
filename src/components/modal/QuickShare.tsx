import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

interface QuickShareProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    name: string;
    url: string;
  };
}

export default function QuickShare({ isOpen, onClose, campaign }: QuickShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(campaign.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <Dialog.Title className="text-2xl font-semibold text-register-green">
                    Quick Share
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 border-4 rounded-full hover:text-gray-500">
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-2 gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className='grid'>
                    {/* <div className='text-sm'>Your unique link</div> */}
                    <input
                      type="text"
                      readOnly
                      value={campaign.url}
                      className="flex-1 pxc-0 bg-transparent border-none text-sm"
                    />
                    </div>
                    <button
                      onClick={handleCopy}
                      className="text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium mb-2">Reach more donors by sharing</h3>
                    <p className="text-gray-600 text-sm mb-6">
                      Help spread the word about this campaign by sharing with your friends and family.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => {
                          const url = encodeURIComponent(campaign.url);
                          const text = encodeURIComponent(`${campaign.name} campaign and help make a difference. Learn more at:`);
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
                        }}
                        className="flex items-center gap-2 bg-[#1877F2]/10 py-3 px-4 rounded-lg hover:bg-[#1877F2]/20 transition-colors"
                      >
                        <img src="/images/facebook.svg" alt="" className="" />
                        Facebook
                      </button>
                      <button 
                        onClick={() => {
                          const text = encodeURIComponent(`Check out ${campaign.name} campaign: ${campaign.url} `);
                          window.open(`https://wa.me/?text=${text}`, '_blank');
                        }}
                        className="flex items-center gap-2 bg-[#25D366]/10 py-3 px-4 rounded-lg hover:bg-[#25D366]/20 transition-colors"
                      >
                        <img src="/images/whatsapp.svg" alt="" className="" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}