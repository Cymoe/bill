export interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  data?: any;
  suggestions?: string[];
}

export interface ChatData {
  id: number;
  title: string;
  preview: string;
  category: string;
  timestamp: string;
  isPinned: boolean;
  messageCount: number;
  lastValue: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  messages: Message[];
}

export interface Category {
  id: string;
  label: string;
  count: number;
  icon: React.ReactNode;
}

export interface QuickAction {
  icon: React.ReactNode;
  text: string;
  color: string;
  query: string;
}

export interface OverdueInvoice {
  client: string;
  amount: string;
  days: number;
  urgency: 'high' | 'medium' | 'low';
}

export interface ProfitAnalysisItem {
  type: string;
  profit: string;
  margin: string;
  projects: number;
}

export interface ColdLead {
  project: string;
  value: string;
  days: number;
  contact: string;
}
