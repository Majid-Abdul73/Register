import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import ContactSchool from './ContactSchool';

interface SchoolProfileProps {
  isOpen: boolean;
  onClose: () => void;
  school: {
    name: string;
    location: string;
    address: string;
    totalStudents: number;
    challenges: string[];
    representative: {
      name: string;
      role: string;
    };
  };
}

export default function SchoolProfile({ isOpen, onClose, school }: SchoolProfileProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
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
                    Profile of {school.name}
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

                <div className="mt-4">
                  <h3 className="text-sm text-gray-500">Top Challenges School Faces</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {school.challenges.map((challenge, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-green-100 text-register-green text-sm"
                      >
                        {challenge}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm text-gray-500">Location</h3>
                    <p className="mt-1">{school.location}</p>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm text-gray-500">School Address</h3>
                    <p className="mt-1">{school.address}</p>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm text-gray-500">Total Student Population</h3>
                    <p className="mt-1">{school.totalStudents}</p>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-medium">School Representative</h3>
                    <div className="mt-3 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="ml-3">
                        <p className="text-sm font-medium">{school.representative.name}</p>
                        <p className="text-sm text-gray-500">{school.representative.role}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="mt-6 w-full bg-register-green text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Contact School
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>

      <ContactSchool
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        recipient={{
          name: school.representative.name,
          role: school.representative.role
        }}
      />
    </Transition>
  );
}