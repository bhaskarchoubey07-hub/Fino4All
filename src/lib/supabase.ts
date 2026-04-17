import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for the database
export type Profile = {
  id: string
  full_name: string | null
  email: string
  monthly_income: number
  financial_goals: string[]
  created_at: string
}

export type Expense = {
  id: string
  user_id: string
  amount: number
  category: string
  note: string | null
  date: string
  created_at: string
}

export type Loan = {
  id: string
  user_id: string
  amount: number
  interest_rate: number
  tenure: number // months
  type: string
  risk_level: 'low' | 'medium' | 'high'
  created_at: string
}

export type Investment = {
  id: string
  user_id: string
  type: string
  amount_invested: number
  current_value: number
  risk_level: 'low' | 'medium' | 'high'
  created_at: string
}

export type Alert = {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'danger'
  is_read: boolean
  created_at: string
}
