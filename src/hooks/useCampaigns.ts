import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useIndexedDB } from './useIndexedDB';
import { useMemo } from 'react';
import { Campaign } from '../types/campaign';

export const useCampaigns = () => {
  const { saveToDB, getFromDB } = useIndexedDB();

  const fetchCampaigns = async () => {
    // Try to get from IndexedDB first
    try {
      const cachedData = await getFromDB('campaigns', 'allCampaigns');
      if (cachedData) {
        return cachedData;
      }
    } catch (error) {
      console.warn('Error reading from IndexedDB:', error);
    }

    // If no cached data, fetch from Firestore
    const querySnapshot = await getDocs(collection(db, 'campaigns'));
    const campaigns = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Save to IndexedDB
    await saveToDB('campaigns', {
      id: 'allCampaigns',
      data: campaigns,
      timestamp: Date.now()
    });

    return campaigns;
  };

  const { data: campaigns, isLoading, error } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });

  // Memoize expensive computations
  const featuredCampaigns = useMemo(() => 
    campaigns?.filter(campaign => campaign.featured)
    .sort((a, b) => b.amountRaised - a.amountRaised)
  , [campaigns]);

  const activeCampaigns = useMemo(() => 
    campaigns?.filter(campaign => campaign.status === 'active')
  , [campaigns]);

  return {
    campaigns,
    featuredCampaigns,
    activeCampaigns,
    isLoading,
    error
  };
};