export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  profileImage?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
