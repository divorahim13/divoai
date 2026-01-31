export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface UserProfile {
  id: string;
  email: string;
  usage_cost: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
