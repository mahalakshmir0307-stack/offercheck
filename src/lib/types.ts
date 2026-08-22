export type WoodStatus = 'available' | 'reused' | 'discarded' | 'reserved';

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

export interface ProductSuggestion {
  name: string;
  description: string;
  min_length: number;
  min_width: number;
  min_thickness: number;
  estimated_value: number;
  icon: string;
}
