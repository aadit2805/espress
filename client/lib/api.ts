const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Cafe {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  drink_count?: number;
}

export interface Drink {
  id: number;
  cafe_id: number;
  drink_type: string;
  rating: number;
  notes: string | null;
  logged_at: string;
  cafe_name?: string;
  cafe_address?: string | null;
  cafe_city?: string | null;
}

export interface Stats {
  total_drinks: number;
  average_rating: number;
  top_cafes: { cafe_name: string; visit_count: number }[];
  drink_type_breakdown: { drink_type: string; count: number }[];
}

// Cafes
export const getCafes = async (): Promise<Cafe[]> => {
  const res = await fetch(`${API_URL}/api/cafes`);
  if (!res.ok) throw new Error('Failed to fetch cafes');
  return res.json();
};

export const createCafe = async (data: {
  name: string;
  address?: string;
  city?: string;
}): Promise<Cafe> => {
  const res = await fetch(`${API_URL}/api/cafes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create cafe');
  return res.json();
};

// Drinks
export const getDrinks = async (params?: {
  cafe_id?: number;
  sort?: string;
  order?: string;
}): Promise<Drink[]> => {
  const queryParams = new URLSearchParams();
  if (params?.cafe_id) queryParams.append('cafe_id', params.cafe_id.toString());
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.order) queryParams.append('order', params.order);

  const res = await fetch(`${API_URL}/api/drinks?${queryParams}`);
  if (!res.ok) throw new Error('Failed to fetch drinks');
  return res.json();
};

export const createDrink = async (data: {
  cafe_id: number;
  drink_type: string;
  rating: number;
  notes?: string;
  logged_at?: string;
}): Promise<Drink> => {
  const res = await fetch(`${API_URL}/api/drinks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create drink');
  return res.json();
};

export const deleteDrink = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/api/drinks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete drink');
};

// Stats
export const getStats = async (): Promise<Stats> => {
  const res = await fetch(`${API_URL}/api/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};
