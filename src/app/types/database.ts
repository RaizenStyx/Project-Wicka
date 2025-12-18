export interface Crystal {
  id: string;
  name: string;
  meaning: string;
  element: 'Earth' | 'Air' | 'Fire' | 'Water' | 'Spirit';
  color: string;
  image_url: string | null;
  created_at: string;
  color_category: string;
  zodiac?: string;
  chakra?: string;
}

export interface UserCollectionItem {
  id: string;
  user_id: string;
  crystal_id: string;
  acquired_at: string;
  crystals?: Crystal; 
}

export interface Like {
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  // Optional: You might join the profile data when fetching
  author?: {
    username: string;
    avatar_url: string;
  };
}

export type ElementType = 'Fire' | 'Earth' | 'Air' | 'Water';
export type ModalityType = 'Cardinal' | 'Fixed' | 'Mutable';

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  element: ElementType;
  modality: ModalityType;
  ruling_planet: string;
  description: string;
  keywords: string[];
  date_display: string;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  image_url?: string;
}

export interface TarotCard {
  id: number; 
  name: string;
  suit: string | null;
  arcana_type: string; 
  number: number;      
  slug: string;        
  meaning_upright: string | null;
  meaning_reversed: string | null;
  description: string | null;
  image_url: string | null;
  element: string | null;
  astrology: string | null;
  numerical_keyword: string | null;
}