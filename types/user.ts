export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  profileImage?: string;
  phone?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  balance?: number; // Bakiye
  isVerified: boolean;
  verificationToken?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
