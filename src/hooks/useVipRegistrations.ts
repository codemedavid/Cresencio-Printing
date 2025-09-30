import { useState, useEffect } from 'react';
import { VipMember, MemberStatus } from '../types';
import { VipAuthService, deleteVipMemberByUniqueId } from '../services/vipAuth';

export const useVipRegistrations = () => {
  const [registrations, setRegistrations] = useState<VipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load registrations from Supabase
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await VipAuthService.getAllRegistrations();
      
      if (result.success && result.data) {
        setRegistrations(result.data);
      } else {
        setError(result.error || 'Failed to load registrations');
      }
    } catch (err) {
      console.error('Error loading VIP registrations:', err);
      setError('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  // Update member status
  const updateMemberStatus = async (memberUniqueId: string, newStatus: MemberStatus) => {
    try {
      setError(null);
      
      const result = await VipAuthService.updateMemberStatus(memberUniqueId, newStatus);
      
      if (result.success) {
        // Update local state
        setRegistrations(prev => 
          prev.map(member => 
            member.unique_id === memberUniqueId 
              ? { ...member, status: newStatus, updated_at: new Date().toISOString() }
              : member
          )
        );
      } else {
        setError(result.error || 'Failed to update member status');
      }
    } catch (err) {
      console.error('Error updating member status:', err);
      setError('Failed to update member status');
    }
  };

  // Bulk update member statuses
  const bulkUpdateMemberStatus = async (memberUniqueIds: string[], newStatus: MemberStatus) => {
    try {
      setError(null);
      
      // Update each member individually
      const updatePromises = memberUniqueIds.map(uniqueId => 
        VipAuthService.updateMemberStatus(uniqueId, newStatus)
      );
      
      const results = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        // Update local state
        setRegistrations(prev => 
          prev.map(member => 
            memberUniqueIds.includes(member.unique_id)
              ? { ...member, status: newStatus, updated_at: new Date().toISOString() }
              : member
          )
        );
      } else {
        setError('Some updates failed. Please try again.');
      }
    } catch (err) {
      console.error('Error bulk updating member statuses:', err);
      setError('Failed to update member statuses');
    }
  };

  // Add new registration (for when users register)
  const addRegistration = async (newMember: {
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
  }) => {
    try {
      setError(null);
      
      const result = await VipAuthService.registerUser(newMember);
      
      if (result.success && result.user) {
        // Add to local state
        setRegistrations(prev => [...prev, result.user!]);
        return result.user;
      } else {
        setError(result.error || 'Registration failed');
        throw new Error(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Error adding registration:', err);
      setError('Registration failed');
      throw err;
    }
  };

  // Update member by unique id (for attaching uploaded file URLs post-registration)
  const updateMemberByUniqueId = async (
    uniqueId: string,
    updates: Partial<{ student_id_file: string | null; senior_id_file: string | null; pwd_id_file: string | null; verification_id_file: string | null; }>
  ) => {
    const result = await VipAuthService.updateMemberByUniqueId(uniqueId, updates);
    if (result.success) {
      setRegistrations(prev => prev.map(m => m.unique_id === uniqueId ? { ...m, ...updates, updated_at: new Date().toISOString() } as any : m));
    }
    return result;
  };

  // Get registration by ID
  const getRegistrationById = (id: number) => {
    return registrations.find(reg => reg.id === id);
  };

  // Get registration by VIP ID
  const getRegistrationByVipId = async (uniqueId: string) => {
    try {
      // First check local state
      const localMember = registrations.find(reg => reg.unique_id === uniqueId);
      if (localMember) {
        return localMember;
      }

      // If not found locally, fetch from database
      const member = await VipAuthService.getMemberByVipId(uniqueId);
      return member;
    } catch (err) {
      console.error('Error getting registration by VIP ID:', err);
      return null;
    }
  };

  // Refresh registrations
  const refreshRegistrations = () => {
    loadRegistrations();
  };

  // Delete a registration by unique_id
  const deleteRegistration = async (uniqueId: string) => {
    const result = await deleteVipMemberByUniqueId(uniqueId);
    if (result.success) {
      setRegistrations(prev => prev.filter(r => r.unique_id !== uniqueId));
    } else {
      setError(result.error || 'Failed to delete member');
    }
    return result;
  };

  // Load registrations on mount
  useEffect(() => {
    loadRegistrations();
  }, []);

  return {
    registrations,
    loading,
    error,
    updateMemberStatus,
    bulkUpdateMemberStatus,
    addRegistration,
    getRegistrationById,
    getRegistrationByVipId,
    refreshRegistrations,
    deleteRegistration,
    updateMemberByUniqueId,
  };
};
