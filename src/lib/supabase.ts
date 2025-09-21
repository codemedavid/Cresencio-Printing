import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  console.error('- VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.error('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
  console.error('Please create a .env file with your Supabase credentials.');
  throw new Error('Missing Supabase environment variables. Please check the console for details.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          icon: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          base_price: number;
          category: string;
          popular: boolean;
          available: boolean;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          base_price: number;
          category: string;
          popular?: boolean;
          available?: boolean;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          base_price?: number;
          category?: string;
          popular?: boolean;
          available?: boolean;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      variations: {
        Row: {
          id: string;
          menu_item_id: string;
          name: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          name: string;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          name?: string;
          price?: number;
          created_at?: string;
        };
      };
      add_ons: {
        Row: {
          id: string;
          menu_item_id: string;
          name: string;
          price: number;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          name: string;
          price: number;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          name?: string;
          price?: number;
          category?: string;
          created_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          account_number: string;
          account_name: string;
          qr_code_url: string;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          account_number: string;
          account_name: string;
          qr_code_url: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          account_number?: string;
          account_name?: string;
          qr_code_url?: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      vip_accounts: {
        Row: {
          id: string;
          unique_id: string;
          full_name: string;
          address: string;
          email: string;
          mobile_number: string;
          customer_category: 'Student' | 'Senior Citizen' | 'Regular Customer' | 'PWD';
          school_name: string | null;
          student_id_file: string | null;
          senior_id_number: string | null;
          senior_id_file: string | null;
          pwd_id_number: string | null;
          pwd_id_file: string | null;
          verification_id_file: string | null;
          password_hash: string | null;
          salt: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
          last_login: string | null;
          login_attempts: number;
          locked_until: string | null;
          email_verified: boolean;
          verification_token: string | null;
          reset_token: string | null;
          reset_token_expires: string | null;
        };
        Insert: {
          id?: string;
          unique_id: string;
          full_name: string;
          address: string;
          email: string;
          mobile_number: string;
          customer_category: 'Student' | 'Senior Citizen' | 'Regular Customer' | 'PWD';
          school_name?: string | null;
          student_id_file?: string | null;
          senior_id_number?: string | null;
          senior_id_file?: string | null;
          pwd_id_number?: string | null;
          pwd_id_file?: string | null;
          verification_id_file?: string | null;
          password_hash?: string | null;
          salt?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
          email_verified?: boolean;
          verification_token?: string | null;
          reset_token?: string | null;
          reset_token_expires?: string | null;
        };
        Update: {
          id?: string;
          unique_id?: string;
          full_name?: string;
          address?: string;
          email?: string;
          mobile_number?: string;
          customer_category?: 'Student' | 'Senior Citizen' | 'Regular Customer' | 'PWD';
          school_name?: string | null;
          student_id_file?: string | null;
          senior_id_number?: string | null;
          senior_id_file?: string | null;
          pwd_id_number?: string | null;
          pwd_id_file?: string | null;
          verification_id_file?: string | null;
          password_hash?: string | null;
          salt?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
          email_verified?: boolean;
          verification_token?: string | null;
          reset_token?: string | null;
          reset_token_expires?: string | null;
        };
      };
    };
    Views: {
      approved_vip_members: {
        Row: {
          id: string;
          unique_id: string;
          full_name: string;
          address: string;
          email: string;
          mobile_number: string;
          customer_category: 'Student' | 'Senior Citizen' | 'Regular Customer' | 'PWD';
          school_name: string | null;
          senior_id_number: string | null;
          pwd_id_number: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
      };
    };
    Functions: {
      authenticate_vip_user: {
        Args: {
          p_unique_id: string;
          p_password: string;
        };
        Returns: {
          id: string;
          unique_id: string;
          full_name: string;
          email: string;
          mobile_number: string;
          customer_category: 'Student' | 'Senior Citizen' | 'Regular Customer' | 'PWD';
          status: 'pending' | 'approved' | 'rejected';
          school_name: string | null;
          senior_id_number: string | null;
          pwd_id_number: string | null;
        }[];
      };
      generate_vip_id: {
        Args: {};
        Returns: string;
      };
      hash_password: {
        Args: {
          password: string;
          salt: string;
        };
        Returns: string;
      };
      verify_password: {
        Args: {
          password: string;
          salt: string;
          hash: string;
        };
        Returns: boolean;
      };
    };
  };
};