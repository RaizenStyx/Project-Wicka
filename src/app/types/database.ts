// export interface Crystal {
//   id: string;
//   name: string;
//   meaning: string;
//   element: 'Earth' | 'Air' | 'Fire' | 'Water' | 'Spirit';
//   color: string;
//   image_url: string | null;
//   created_at: string;
//   color_category: string;
//   zodiac?: string;
//   chakra?: string;
// }

// export interface UserCollectionItem {
//   id: string;
//   user_id: string;
//   crystal_id: string;
//   acquired_at: string;
//   crystals?: Crystal; 
// }

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
  body_part: string[];
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

// 1. Helper for UI components (Dropdowns/Badges)
export interface DatabaseItem {
  id: string;
  name: string;
  image_url?: string;
}

// 2. Base Interface (Shared fields)
export interface BaseRitualBlock {
  id: string;
  title: string;
  intent: string | null;
  content: string | null;
  moon_phase: string | null;
  
  // Smart Arrays
  linked_crystals: string[];
  linked_herbs: string[];
  linked_candles: string[];
  linked_deities: string[];
  linked_runes: string[];
  linked_essential_oils: string[];
}

// 3. User Spells (Community Content)
export interface Spell extends BaseRitualBlock {
  user_id: string;
  ingredients: string | null; // Legacy text field
  is_ritual: boolean;
  is_private: boolean;
  is_published: boolean;
  created_at: string;
}

// 4. Extended Spell (With Profile info for Cards)
export interface ExtendedSpell extends Spell {
  profiles?: {
    username: string;
    handle: string;
    role: string;
    avatar_url?: string;
  } | null;
}

// 5. Common Rituals (Curated Content)
export interface CommonRitual extends BaseRitualBlock {
  description: string | null;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_time: string | null;
  image_url: string | null;
  created_at: string;
}
