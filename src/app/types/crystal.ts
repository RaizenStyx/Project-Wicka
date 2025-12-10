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