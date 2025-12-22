export interface Cafe {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  created_at: Date;
}

export interface Drink {
  id: number;
  cafe_id: number;
  drink_type: string;
  rating: number;
  notes: string | null;
  logged_at: Date;
  created_at: Date;
}

export interface DrinkWithCafe extends Drink {
  cafe_name: string;
  cafe_address: string | null;
  cafe_city: string | null;
}

export interface Stats {
  total_drinks: number;
  average_rating: number;
  top_cafes: { cafe_name: string; visit_count: number }[];
  drink_type_breakdown: { drink_type: string; count: number }[];
}
