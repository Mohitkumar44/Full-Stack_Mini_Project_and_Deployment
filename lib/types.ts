export type Category =
  | 'Food'
  | 'Transport'
  | 'Education'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Health'
  | 'Travel'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Card'
  | 'Bank Transfer'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Travel',
  'Other',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Card',
  'Bank Transfer',
  'Other',
];

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: Category;
  description: string | null;
  payment_method: PaymentMethod | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface DashboardStats {
  totalSpending: number;
  monthlyBudget: number;
  remaining: number;
  transactions: number;
  budgetProgress: number;
  overBudget: boolean;
  byCategory: { category: string; amount: number; percentage: number }[];
  monthly: { month: string; amount: number }[];
  recent: Expense[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
