import { useState } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

//helper function
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function CampaignForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    media: null as File | null,
    category: '',
    description: '',
    donationTarget: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Check if user is authenticated
    if (!auth.currentUser) {
      setError('Please login to create a campaign');
      setIsSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      let mediaUrl = '';
      
      if (formData.media) {
        mediaUrl = await convertToBase64(formData.media);
      }

      const campaignData = {
        name: formData.name,
        mediaUrl,
        category: formData.category,
        description: formData.description,
        donationTarget: Number(formData.donationTarget),
        createdAt: new Date(),
        status: 'active',
        schoolId: auth.currentUser.uid,
        amountRaised: 0,
        goal: Number(formData.donationTarget)
      };

      const docRef = await addDoc(collection(db, 'campaigns'), campaignData);
      console.log('Campaign created with ID:', docRef.id);
      navigate('/dashboard');

      // Reset form
      setFormData({
        name: '',
        media: null,
        category: '',
        description: '',
        donationTarget: ''
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error creating campaign');
      console.error('Error creating campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, media: e.target.files![0] }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">
          {error}
        </div>
      )}
      {/* Name of your challenge */}
      <div>
        <h2 className="text-lg font-medium mb-2">Name of your challenge</h2>
        <p className="text-sm text-gray-500 mb-2">
          Lorem ipsum dolor sit amet consectetur. Molestie leo nulla sed a facilisis aliquet massa.
        </p>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
          placeholder="Enter the title of the campaign"
        />
      </div>

      {/* Upload Challenge Media */}
      <div>
        <h2 className="text-lg font-medium mb-2">Upload Challenge Media</h2>
        <p className="text-sm text-gray-500 mb-2">
          Lorem ipsum dolor sit amet consectetur. Molestie leo nulla sed a facilisis aliquet massa.
        </p>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files && files[0]) {
              setFormData(prev => ({ ...prev, media: files[0] }));
            }
          }}
        >
          {formData.media ? (
            <div className="relative">
              <img 
                src={URL.createObjectURL(formData.media)} 
                alt="Preview" 
                className="max-w-full max-h-[400px] mx-auto rounded"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, media: null }))}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm text-register-green mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaChange}
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="mt-4 inline-block cursor-pointer"
              >
                <div className="bg-white text-register-green border border-register-green px-4 py-2 rounded-md hover:bg-register-green hover:text-white transition-colors">
                  Select Files
                </div>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Select Challenge Category */}
      <div>
        <h2 className="text-lg font-medium mb-2">Select Challenge Category</h2>
        <p className="text-sm text-gray-500 mb-4">
          Lorem ipsum dolor sit amet consectetur. Molestie leo nulla sed a facilisis aliquet massa.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {['Resources', 'Health and safety', 'Infrastructure', 'Insufficient funding', 'Teacher shortages', 
          'Lack of resources', 'Transportation', 'Outdated technology'].map((cat, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                formData.category === cat
                  ? 'bg-register-green text-white hover:bg-green-600'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-lg font-medium mb-2">Description</h2>
        <p className="text-sm text-gray-500 mb-2">
          Lorem ipsum dolor sit amet consectetur. Molestie leo nulla sed a facilisis aliquet massa.
        </p>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
          placeholder="Enter your description"
        />
      </div>

      {/* Donation Target */}
      <div>
        <h2 className="text-lg font-medium mb-2">Donation Target</h2>
        <div className="relative inline-flex items-center">
          <span className="absolute left-3 text-gray-500">$</span>
          <input
            type="number"
            value={formData.donationTarget}
            onChange={(e) => setFormData(prev => ({ ...prev, donationTarget: e.target.value }))}
            className="w-64 pl-7 pr-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-register-green"
            placeholder="1000.00"
          />
          <select 
            className="absolute right-0 h-fulL px-8 text-gray-500 bg-transparent border-l border-gray-300 focus:outline-none focus:ring-1 focus:ring-register-green"
            style={{ borderRadius: '0 0.375rem 0.375rem 0' }}
          >
            <option>USD</option>
            <option>GHS</option>
            <option>N</option>
          </select>
        </div>
      </div>

      {/* Update Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`bg-register-green text-white px-6 py-2 rounded-md transition-colors ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
        }`}
      >
        {isSubmitting ? 'Creating campaign...' : 'Start your campaign'}
      </button>
    </form>
  );
}