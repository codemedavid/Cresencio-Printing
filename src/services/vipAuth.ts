import { supabase } from '../lib/supabase';
import { VipMember } from '../types';

export interface VipLoginCredentials {
  unique_id: string;
  password?: string; // Optional for now, can be implemented later
}

export interface VipRegistrationData {
  full_name: string;
  address: string;
  email: string;
  mobile_number: string;
  customer_category: 'Student' | 'Senior Citizen' | 'Regular Customer' | 'PWD';
  school_name?: string;
  student_id_file?: string;
  senior_id_number?: string;
  senior_id_file?: string;
  pwd_id_number?: string;
  pwd_id_file?: string;
  verification_id_file?: string;
}

export interface VipAuthResult {
  success: boolean;
  user?: VipMember;
  error?: string;
}

export class VipAuthService {
  /**
   * Authenticate a VIP user by their unique ID
   * For now, we'll use a simple ID-based authentication
   * Password authentication can be added later
   */
  static async authenticateUser(credentials: VipLoginCredentials): Promise<VipAuthResult> {
    try {
      const { unique_id, password } = credentials;

      // Query the approved VIP members view
      const { data, error } = await supabase
        .from('approved_vip_members')
        .select('*')
        .eq('unique_id', unique_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return {
            success: false,
            error: 'Invalid VIP ID. Please check your ID and try again, or register for a new account.'
          };
        }
        throw error;
      }

      if (!data) {
        return {
          success: false,
          error: 'Invalid VIP ID. Please check your ID and try again, or register for a new account.'
        };
      }

      // Convert Supabase data to VipMember format
      const vipMember: VipMember = {
        id: parseInt(data.id.replace(/-/g, '').slice(0, 8), 16), // Convert UUID to number for compatibility
        unique_id: data.unique_id,
        full_name: data.full_name,
        address: data.address,
        email: data.email,
        mobile_number: data.mobile_number,
        customer_category: data.customer_category,
        school_name: data.school_name,
        senior_id_number: data.senior_id_number,
        pwd_id_number: data.pwd_id_number,
        status: 'approved',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return {
        success: true,
        user: vipMember
      };

    } catch (error) {
      console.error('VIP authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.'
      };
    }
  }

  /**
   * Register a new VIP user
   */
  static async registerUser(registrationData: VipRegistrationData): Promise<VipAuthResult> {
    try {
      // Check if Supabase is properly configured
      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      // Generate a unique VIP ID (secure, non-sequential: VIP-ABC-1234)
      const generateCandidate = () => {
        const letters = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
        const numbers = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        return `VIP-${letters}-${numbers}`;
      };

      const ensureUniqueVipId = async (): Promise<string> => {
        for (let attempt = 0; attempt < 10; attempt++) {
          const candidate = generateCandidate();
          const { data, error } = await supabase
            .from('vip_accounts')
            .select('unique_id')
            .eq('unique_id', candidate)
            .maybeSingle();
          if (error) {
            // If error is no rows, proceed; otherwise throw
            if ((error as any).code && (error as any).code !== 'PGRST116') {
              throw error;
            }
          }
          if (!data) {
            return candidate;
          }
        }
        throw new Error('Failed to generate a unique VIP ID after multiple attempts');
      };

      const generatedId = await ensureUniqueVipId();

      // Prepare the data for insertion
      const vipAccountData = {
        unique_id: generatedId,
        full_name: registrationData.full_name,
        address: registrationData.address,
        email: registrationData.email,
        mobile_number: registrationData.mobile_number,
        customer_category: registrationData.customer_category,
        school_name: registrationData.school_name || null,
        student_id_file: registrationData.student_id_file || null,
        senior_id_number: registrationData.senior_id_number || null,
        senior_id_file: registrationData.senior_id_file || null,
        pwd_id_number: registrationData.pwd_id_number || null,
        pwd_id_file: registrationData.pwd_id_file || null,
        verification_id_file: registrationData.verification_id_file || null,
        status: 'pending' as const,
      };

      // Insert the new VIP account
      const { data, error } = await supabase
        .from('vip_accounts')
        .insert(vipAccountData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting VIP account:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after insertion');
      }

      // Convert to VipMember format
      const vipMember: VipMember = {
        id: parseInt(data.id.replace(/-/g, '').slice(0, 8), 16),
        unique_id: data.unique_id,
        full_name: data.full_name,
        address: data.address,
        email: data.email,
        mobile_number: data.mobile_number,
        customer_category: data.customer_category,
        school_name: data.school_name,
        senior_id_number: data.senior_id_number,
        pwd_id_number: data.pwd_id_number,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return {
        success: true,
        user: vipMember
      };

    } catch (error: any) {
      console.error('VIP registration error:', error);
      
      // Handle specific error cases
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('email')) {
          return {
            success: false,
            error: 'An account with this email already exists.'
          };
        }
        if (error.message.includes('unique_id')) {
          return {
            success: false,
            error: 'This VIP ID is already taken. Please try again.'
          };
        }
      }

      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Get all VIP registrations (for admin use)
   */
  static async getAllRegistrations(): Promise<{ success: boolean; data?: VipMember[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('vip_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert to VipMember format
      const vipMembers: VipMember[] = data.map(account => ({
        id: parseInt(account.id.replace(/-/g, '').slice(0, 8), 16),
        unique_id: account.unique_id,
        full_name: account.full_name,
        address: account.address,
        email: account.email,
        mobile_number: account.mobile_number,
        customer_category: account.customer_category,
        school_name: account.school_name,
        student_id_file: account.student_id_file,
        senior_id_number: account.senior_id_number,
        senior_id_file: account.senior_id_file,
        pwd_id_number: account.pwd_id_number,
        pwd_id_file: account.pwd_id_file,
        verification_id_file: account.verification_id_file,
        status: account.status,
        created_at: account.created_at,
        updated_at: account.updated_at,
      }));

      return {
        success: true,
        data: vipMembers
      };

    } catch (error) {
      console.error('Error fetching VIP registrations:', error);
      return {
        success: false,
        error: 'Failed to fetch registrations.'
      };
    }
  }

  /**
   * Update VIP member fields by unique_id
   */
  static async updateMemberByUniqueId(uniqueId: string, updates: Partial<{
    student_id_file: string | null;
    senior_id_file: string | null;
    pwd_id_file: string | null;
    verification_id_file: string | null;
    school_name: string | null;
    senior_id_number: string | null;
    pwd_id_number: string | null;
  }>): Promise<{ success: boolean; error?: string }>
  {
    try {
      const { error } = await supabase
        .from('vip_accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('unique_id', uniqueId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error updating VIP member:', err);
      return { success: false, error: 'Failed to update VIP member' };
    }
  }

  /**
   * Update VIP member status (for admin use)
   */
  static async updateMemberStatus(
    memberUniqueId: string, 
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('vip_accounts')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('unique_id', memberUniqueId);

      if (error) {
        throw error;
      }

      return { success: true };

    } catch (error) {
      console.error('Error updating member status:', error);
      return {
        success: false,
        error: 'Failed to update member status.'
      };
    }
  }

  /**
   * Get VIP member by unique ID
   */
  static async getMemberByVipId(uniqueId: string): Promise<VipMember | null> {
    try {
      const { data, error } = await supabase
        .from('vip_accounts')
        .select('*')
        .eq('unique_id', uniqueId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: parseInt(data.id.replace(/-/g, '').slice(0, 8), 16),
        unique_id: data.unique_id,
        full_name: data.full_name,
        address: data.address,
        email: data.email,
        mobile_number: data.mobile_number,
        customer_category: data.customer_category,
        school_name: data.school_name,
        student_id_file: data.student_id_file,
        senior_id_number: data.senior_id_number,
        senior_id_file: data.senior_id_file,
        pwd_id_number: data.pwd_id_number,
        pwd_id_file: data.pwd_id_file,
        verification_id_file: data.verification_id_file,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

    } catch (error) {
      console.error('Error fetching VIP member:', error);
      return null;
    }
  }

  /**
   * Check if a VIP ID exists and is approved
   */
  static async isVipIdValid(uniqueId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('approved_vip_members')
        .select('id')
        .eq('unique_id', uniqueId)
        .single();

      return !error && !!data;

    } catch (error) {
      return false;
    }
  }
}

// New: Delete VIP member by unique_id
export async function deleteVipMemberByUniqueId(uniqueId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('vip_accounts')
      .delete()
      .eq('unique_id', uniqueId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting VIP member:', err);
    return { success: false, error: err?.message || 'Failed to delete member' };
  }
}
