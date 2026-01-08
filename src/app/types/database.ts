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

export interface PostCardProps {
  id: string; 
  currentUserId: string; 
  username: string;
  handle?: string | null;
  avatar_url?: string | null;
  subtitle?: string;
  timeAgo: string;
  content: string;
  currentUserRole?: string;
  profileUserRole?: string;
  image_url?: string | null; 
  likes: { user_id: string }[]; 
  commentsCount: number;
};

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

// --- TAROT SYSTEM TYPES ---

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

// 1. The data we save into the JSONB column
export interface SavedCardData {
  card_id: number;
  reversed: boolean;
  position_name: string; // e.g. "The Situation", "The Obstacle"
  position_index: number; // 0, 1, 2 (preserves order)
}

// 2. The Raw DB Row (What Supabase returns)
export interface TarotReadingRow {
  id: string;
  user_id: string;
  spread_name: string;
  query: string | null; // This will store the "Intention"
  notes: string | null;
  cards: SavedCardData[]; // typed JSONB
  created_at: string;
}

// 3. The Hydrated Object (For the UI)
// We merge the static card data (image, name) with the dynamic reading data (reversed status)
export interface HydratedTarotReading {
  id: string;
  spread_name: string;
  query: string | null;
  created_at: string;
  cards: Array<{
    info: TarotCard;       // The static DB data (Name, Image)
    reversed: boolean;     // Dynamic state
    position_name: string; // Dynamic context
  }>
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

export interface TarotDrawFlowProps {
  fullDeck: TarotCard[];
  cardBackUrl: string;
}

export interface DrawnCard {
  cardInfo: TarotCard;
  reversed: boolean;
  position: string;
}

export interface TarotGalleryProps {
  initialCards: TarotCard[];
  cardBack?: TarotCard | null; 
}


// Unified Interface for the Frontend
export interface WidgetCollectionItem {
  id: string
  user_image_url: string | null
  is_owned: boolean      
  is_wishlisted: boolean
  type: 'crystals' | 'herbs' | 'candles' | 'runes' | 'oils'
  data: {
    id: string
    name: string
    color?: string // Optional, primarily for crystals/candles
    description?: string
    meaning?: string
    image_url?: string | null
  }
}

export interface WidgetClientProps {
  items: WidgetCollectionItem[]
}

export interface GrimoireCardProps {
  id: string
  title: string
  subtitle?: string
  image?: string | null
  color?: string
  
  // User State
  isOwned: boolean
  isWishlisted: boolean
  hasUserImage?: boolean
  
  onToggleOwned: () => void
  onToggleWishlist: () => void
  onClick: () => void 
}