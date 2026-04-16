export interface SupportMessage {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  message: string;
  response?: string;
  status: 'pending' | 'answered' | 'closed';
  createdAt: string;
  answeredAt?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SupportFormData {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}
