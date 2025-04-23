import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface PopulationUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: 'students' | 'teachers';
  formData: {
    male?: number;
    female?: number;
    steamInvolved?: number;
    nonSteamInvolved?: number;
  };
  onInputChange: (field: string, value: string) => void;
  onUpdate: () => void;
  isLoading: boolean;
}

export default function PopulationUpdateModal({
  isOpen,
  onClose,
  title,
  description,
  type,
  formData,
  onInputChange,
  onUpdate,
  isLoading
}: PopulationUpdateModalProps) {
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <Dialog.Title className="text-xl font-semibold text-register-green">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {description}
                </p>

                <div className="mt-4 space-y-4">
                  {type === 'students' ? (
                    <>
                      <div>
                        <label htmlFor="male" className="block text-sm font-medium text-gray-700">
                          Total Male Population
                        </label>
                        <input
                          type="number"
                          id="male"
                          min="0"
                          value={formData.male || 0}
                          onChange={(e) => onInputChange('male', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                        />
                      </div>
                      <div>
                        <label htmlFor="female" className="block text-sm font-medium text-gray-700">
                          Total Female Population
                        </label>
                        <input
                          type="number"
                          id="female"
                          min="0"
                          value={formData.female || 0}
                          onChange={(e) => onInputChange('female', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="steamInvolved" className="block text-sm font-medium text-gray-700">
                          Total Teacher Population
                        </label>
                        <input
                          type="number"
                          id="steamInvolved"
                          min="0"
                          value={formData.steamInvolved || 0}
                          onChange={(e) => onInputChange('steamInvolved', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                        />
                      </div>
                      <div>
                        <label htmlFor="nonSteamInvolved" className="block text-sm font-medium text-gray-700">
                          Total Number of Teacher involved in STEAM
                        </label>
                        <input
                          type="number"
                          id="nonSteamInvolved"
                          min="0"
                          value={formData.nonSteamInvolved || 0}
                          onChange={(e) => onInputChange('nonSteamInvolved', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onUpdate}
                    className="px-4 py-2 text-sm bg-register-green text-white rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}