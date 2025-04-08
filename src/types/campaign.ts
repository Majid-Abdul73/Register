export interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  startDate: string;
  endDate: string;
  category: string;
  amountRaised: number;
  mediaUrl: string;
  schoolId: string;
  featured: boolean;  // Added this property
  status: string;     // Added this property
  location?: {
    city: string;
    country: string;
  };
  organizer?: {
    name: string;
    profileImage?: string;
  };
}