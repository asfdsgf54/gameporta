export interface Product {
  id: string;
  name: string;
  game: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  images: string[];
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  digitalStock?: string[];
  sellerId?: string; // Boşsa sistemindir
  sellerName?: string;
  isUserListing?: boolean;
  status?: 'active' | 'sold' | 'expired' | 'pending';
  expiryDate?: string;
}

export interface ProductFormData {
  name: string;
  game: string;
  category: string;
  price: string;
  description: string;
  features: string;
  images: string[];
  stock: string;
  featured: boolean;
  digitalStock?: string;
  status?: 'active' | 'sold' | 'expired' | 'pending';
}
