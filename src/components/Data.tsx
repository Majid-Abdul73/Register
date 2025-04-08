import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { collection, query, getDocs, getDoc, doc, where, orderBy, limit, startAfter, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useIndexedDB } from '../hooks/useIndexedDB';

// Interface definitions for data types
interface SchoolData {
  id: string;
  schoolName: string;
  country: string;
  city: string;
  schoolType: string;
  contactName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  studentPopulation: Number;
}

// Update the CampaignData interface to include all required fields
export interface CampaignData {
  id: string;
  name: string;
  description: string;
  goal: number;
  startDate: string;
  endDate: string;
  category: string;
  amountRaised: number;
  status: string;
  mediaUrl: string;
  schoolId: string;
  featured: boolean;
  createdAt: Date;
  location: {
    city: string;
    country: string;
  };
  organizer: {
    name: string;
    profileImage?: string;
  };
}

interface TransactionData {
  id: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  type: string;
}

// hook for data fetching with caching
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const CACHE_KEY_PREFIX = 'register_app_cache_';

interface CacheItem<T> {
  data: T[];
  timestamp: number;
  expiresAt: number;
}

export function useDataFetching<T>(
  collectionName: string,
  pageSize: number = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [memoryCache] = useState<Map<string, CacheItem<T>>>(new Map());

  // Check if cache is still valid
  const isCacheValid = useCallback((expiresAt: number) => {
    return Date.now() < expiresAt;
  }, []);

  // Get data from localStorage with improved error handling
  const getFromStorage = useCallback((key: string) => {
    try {
      const item = localStorage.getItem(CACHE_KEY_PREFIX + key);
      if (item) {
        const parsed = JSON.parse(item) as CacheItem<T>;
        if (isCacheValid(parsed.expiresAt)) {
          return parsed.data;
        }
        // Remove expired cache
        localStorage.removeItem(CACHE_KEY_PREFIX + key);
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
      // Clean up corrupted cache
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
    }
    return null;
  }, [isCacheValid]);

  // Save data to localStorage with improved error handling
  const saveToStorage = useCallback((key: string, data: T[]) => {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION
      };
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheItem));
      // Also update memory cache
      memoryCache.set(key, cacheItem);
    } catch (error) {
      console.error('Error saving to cache:', error);
      // If localStorage is full, clear old items
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        clearOldCache();
      }
    }
  }, [memoryCache]);

  // Clear old cache entries
  const clearOldCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    
    cacheKeys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item) as CacheItem<T>;
          if (!isCacheValid(parsed.expiresAt)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        localStorage.removeItem(key);
      }
    });
  }, [isCacheValid]);

  // Modified fetchData function with improved caching
  const fetchData = useCallback(async (searchTerm: string = '') => {
    try {
      setLoading(true);
      setError(null);

      // Generate cache key
      const cacheKey = `${collectionName}-${searchTerm}-${lastDoc?.id || 'initial'}`;

      // Check memory cache first (fastest)
      const memoryCacheItem = memoryCache.get(cacheKey);
      if (memoryCacheItem && isCacheValid(memoryCacheItem.expiresAt)) {
        setData(memoryCacheItem.data);
        setLoading(false);
        return;
      }

      // Check localStorage cache (slower than memory but faster than network)
      const storageCacheData = getFromStorage(cacheKey);
      if (storageCacheData) {
        setData(storageCacheData);
        // Update memory cache
        memoryCache.set(cacheKey, {
          data: storageCacheData,
          timestamp: Date.now(),
          expiresAt: Date.now() + CACHE_DURATION
        });
        setLoading(false);
        return;
      }

      // If no cache hit, fetch from Firebase
      let q = query(
        collection(db, collectionName),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (searchTerm) {
        q = query(q, where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setData([]);
        setHasMore(false);
        return;
      }

      const campaignsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch associated school data with error handling
      const campaignsWithSchoolData = await Promise.all(
        campaignsData.map(async (campaign: any) => {
          try {
            if (campaign.schoolId) {
              const schoolDoc = await getDoc(doc(db, 'schools', campaign.schoolId));
              if (schoolDoc.exists()) {
                const schoolData = schoolDoc.data();
                return {
                  ...campaign,
                  location: {
                    city: schoolData.city || 'Unknown City',
                    country: schoolData.country || 'Unknown Country'
                  },
                  organizer: {
                    name: schoolData.contactName || 'Unknown',
                    profileImage: schoolData.profileImage || '/default-avatar.png'
                  }
                };
              }
            }
            return {
              ...campaign,
              location: campaign.location || { city: 'Unknown City', country: 'Unknown Country' },
              organizer: campaign.organizer || { name: 'Unknown', profileImage: '/default-avatar.png' }
            };
          } catch (err) {
            console.error('Error fetching school data:', err);
            return campaign;
          }
        })
      ) as T[];

      // Update both memory and localStorage cache
      memoryCache.set(cacheKey, { 
        data: campaignsWithSchoolData, 
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION 
      });
      saveToStorage(cacheKey, campaignsWithSchoolData);

      setData(prevData => lastDoc ? [...prevData, ...campaignsWithSchoolData] : campaignsWithSchoolData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [collectionName, lastDoc, pageSize, memoryCache, isCacheValid, getFromStorage]);

  // Add cache clearing function
  const clearCache = useCallback(() => {
    // Clear memory cache
    memoryCache.clear();
    
    // Clear localStorage cache
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }, [memoryCache]);

  // Load more data function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(searchQuery);
    }
  }, [fetchData, loading, hasMore, searchQuery]);

  // Handle search function
  const handleSearch = useCallback((term: string) => {
    setSearchQuery(term);
    setLastDoc(null);
    setData([]);
    fetchData(term);
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData(searchQuery);
  }, [fetchData, searchQuery]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    handleSearch,
    clearCache
  };
}

// Export data hooks for specific collections
export const useSchoolData = () => useDataFetching<SchoolData>('schools');
interface CampaignPage {
  campaigns: CampaignData[];
  lastDoc: any;
  hasMore: boolean;
}

export function useCampaignData() {
  const [searchQuery, setSearchQuery] = useState('');
  const { saveToDB, getFromDB } = useIndexedDB();
  
  // Update the fetchCampaigns function return type
  const fetchCampaigns = async (context: {
    pageParam: DocumentData | null
  }): Promise<CampaignPage> => {
    try {
      // Try IndexedDB first
      const cachedData = await getFromDB('campaigns', 'allCampaigns');
      if (cachedData && !context.pageParam) {
        return {
          campaigns: cachedData as CampaignData[],
          lastDoc: null,
          hasMore: false
        };
      }

      let q = query(
        collection(db, 'campaigns'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (searchQuery) {
        q = query(
          q, 
          where('name', '>=', searchQuery), 
          where('name', '<=', searchQuery + '\uf8ff')
        );
      }

      if (context.pageParam) {
        q = query(q, startAfter(context.pageParam));
      }

      const snapshot = await getDocs(q);
      const campaigns = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          let schoolData = null;
          
          try {
            if (data.schoolId) {
              const schoolDoc = await getDoc(doc(db, 'schools', data.schoolId));
              if (schoolDoc.exists()) {
                schoolData = schoolDoc.data();
              }
            }
          } catch (error) {
            console.error('Error fetching school data:', error);
          }

          return {
            id: docSnapshot.id,
            ...data,
            name: data.name || '',
            description: data.description || '',
            category: data.category || '',
            status: data.status || 'active',
            mediaUrl: data.mediaUrl || '',
            schoolId: data.schoolId || '',
            featured: true, // Since we're querying for featured only
            createdAt: data.createdAt?.toDate?.() || new Date(),
            startDate: data.startDate || new Date().toISOString(),
            endDate: data.endDate || new Date().toISOString(),
            amountRaised: Number(data.amountRaised || 0),
            goal: Number(data.goal || 0),
            location: {
              city: schoolData?.city || data.location?.city || 'Unknown City',
              country: schoolData?.country || data.location?.country || 'Unknown Country'
            },
            organizer: {
              name: schoolData?.contactName || data.organizer?.name || 'Unknown',
              profileImage: schoolData?.profileImage || data.organizer?.profileImage || '/default-avatar.png'
            }
          } as CampaignData;
        })
      );
  
      // Save to IndexedDB if it's the first page
      if (!context.pageParam) {
        await saveToDB('campaigns', campaigns);
      }
  
      return {
        campaigns,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: !snapshot.empty && snapshot.docs.length === 10
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: loading,
    error
  } = useInfiniteQuery({
    queryKey: ['campaigns', searchQuery],
    queryFn: fetchCampaigns,
    getNextPageParam: (lastPage: CampaignPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: null,
    gcTime: 1000 * 60 * 30,
    staleTime: 1000 * 60 * 5,
  });

  const campaigns = useMemo(() => 
    data?.pages.flatMap(page => page.campaigns) ?? [],
    [data]
  );

  const handleSearch = useCallback((term: string) => {
    setSearchQuery(term);
  }, []);

  return {
    data: campaigns,
    loading,
    error,
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
    handleSearch
  };
}

export const useTransactionData = () => useDataFetching<TransactionData>('transactions');