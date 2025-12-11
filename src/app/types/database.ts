export interface Crystal {
  id: string;
  name: string;
  meaning: string;
  element: 'Earth' | 'Air' | 'Fire' | 'Water' | 'Spirit';
  color: string;
  image_url: string | null;
  created_at: string;
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