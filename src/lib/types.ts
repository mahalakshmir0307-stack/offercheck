export type WoodStatus = 'available' | 'reused' | 'discarded' | 'reserved';

export type ProductStatus = 'planned' | 'in_production' | 'completed' | 'sold';

export interface WoodPiece {
  id: string;
  user_id: string;
  wood_type: string;
  length_cm: number;
  width_cm: number;
  thickness_cm: number;
  quantity: number;
  status: WoodStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  wood_piece_id: string | null;
  name: string;
  product_type: string;
  quantity: number;
  estimated_value: number;
  estimated_cost: number;
  estimated_profit: number;
  wood_type: string | null;
  material_volume_cm3: number | null;
  actual_revenue: number | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  created_at: string;
}

export type ProductCategory =
  | 'seating'
  | 'tables'
  | 'storage'
  | 'decor'
  | 'kitchen'
  | 'panels'
  | 'frames'
  | 'hardware';

export interface ProductSuggestion {
  name: string;
  category: ProductCategory;
  description: string;
  min_length: number;
  min_width: number;
  min_thickness: number;
  estimated_value: number;
  estimated_profit: number;
  icon: string;
  images: string[];
  searchQuery: string;
  reason: string;
}

export interface ScoredSuggestion extends ProductSuggestion {
  matched: boolean;
  score: number;
  woodVolume: number;
  materialUtilization: number;
  estimatedCost: number;
  profitMargin: number;
  materialRequired: string;
  remainingMaterial: string;
  explanation: string;
}
