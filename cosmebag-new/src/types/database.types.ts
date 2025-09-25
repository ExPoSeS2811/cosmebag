export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CosmeticBag {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  emoji: string;
  username: string | null;
  display_name: string | null;
  share_token: string;
  is_public: boolean;
  products_count: number;
  followers_count: number;
  following_count?: number;
  image_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface BagItem {
  id: string;
  bag_id: string;
  product_id: string;
  product_data: ProductData;
  status: 'owned' | 'wishlist';
  notes: string | null;
  added_at: string;
  rating: number | null;
  purchase_date: string | null;
  expiry_date: string | null;
  usage_context: string | null;
  is_favorite: boolean;
  priority: number | null;
  price_alert_threshold: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductData {
  name: string;
  brand: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
}

export interface AestheticPassport {
  id: string;
  user_id: string;
  skin_type: 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive';
  skin_concerns: string[];
  allergies: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CosmetologistVisit {
  id: string;
  user_id: string;
  visit_date: string;
  doctor_name: string | null;
  clinic_name: string | null;
  procedures: string[];
  recommendations: string | null;
  prescribed_products: string[];
  next_visit_date: string | null;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export interface BagFollower {
  id: string;
  follower_bag_id: string;
  following_bag_id: string;
  created_at: string;
}