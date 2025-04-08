import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useIndexedDB } from '../hooks/useIndexedDB';

const Navbar = lazy(() => import('../components/Navbar'));

const ChallengePage = () => {
  const { id } = useParams();
  const { getFromDB, saveToDB } = useIndexedDB();

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      // Try to get from IndexedDB first
      const cached = await getFromDB('campaigns', `campaign-${id}`);
      if (cached) return cached;

      const campaignDoc = await getDoc(doc(db, 'campaigns', id!));
      if (!campaignDoc.exists()) throw new Error('Campaign not found');

      const data = campaignDoc.data();
      const schoolDoc = await getDoc(doc(db, 'schools', data.schoolId));
      const schoolData = schoolDoc.exists() ? schoolDoc.data() : null;

      const campaignData = {
        id: campaignDoc.id,
        ...data,
        location: schoolData ? {
          city: schoolData.city,
          country: schoolData.country
        } : data.location,
        organizer: schoolData ? {
          name: schoolData.contactName,
          profileImage: schoolData.profileImage
        } : data.organizer
      };

      // Save to IndexedDB
      await saveToDB(`campaign-${id}`, campaignData);
      return campaignData;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!campaign) return <div>Campaign not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar variant="transparent" className="fixed top-0 left-0 right-0 z-50" />
      </Suspense>

      {/* Wrap main content sections with motion */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* ... existing campaign details content ... */}
      </motion.div>
    </motion.div>
  );
};

export default ChallengePage;