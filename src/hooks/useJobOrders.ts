import { useState, useEffect, useCallback } from 'react';
import { JobOrder, JobOrderForm, VipMember } from '../types';
import { apiService } from '../services/api';

// Storage key for localStorage
const STORAGE_KEY = 'cresencio_job_orders';

export const useJobOrders = () => {
  const [orders, setOrders] = useState<JobOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders from server API on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        // For now, we'll use localStorage as fallback
        // In a real app, you'd fetch from the server API
        const storedOrders = localStorage.getItem(STORAGE_KEY);
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          setOrders(parsedOrders);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, []);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      } catch (error) {
        console.error('Error saving orders to localStorage:', error);
      }
    }
  }, [orders, loading]);

  // Create a new job order
  const createOrder = useCallback(async (orderForm: JobOrderForm, vipMember: VipMember): Promise<JobOrder> => {
    try {
      // Upload files first
      const uploadedFiles = await Promise.all(
        orderForm.files.map(async (file) => {
          const uploadResult = await apiService.uploadFile(file);
          return {
            id: Date.now() + Math.random(),
            job_order_id: 0, // Will be set by server
            original_filename: file.name,
            stored_filename: uploadResult.data?.file_path || file.name,
            file_path: uploadResult.data?.file_path || URL.createObjectURL(file),
            file_size: file.size,
            file_type: file.type,
            created_at: new Date().toISOString()
          };
        })
      );

      // Create order data for API
      const orderData = {
        vip_member_id: vipMember.id,
        delivery_type: orderForm.delivery_type,
        pickup_schedule: orderForm.pickup_schedule,
        receiver_name: orderForm.receiver_name,
        receiver_address: orderForm.receiver_address,
        receiver_mobile: orderForm.receiver_mobile,
        paper_sizes: orderForm.paper_sizes,
        number_of_copies: orderForm.number_of_copies,
        instructions: orderForm.instructions,
        files: uploadedFiles // Include uploaded file information
      };

      // Call server API
      const result = await apiService.createJobOrder(orderData);
      
      if (result.success && result.data) {
        const newOrder: JobOrder = {
          id: Date.now(), // Temporary ID - server should return real ID
          job_order_number: result.data.job_order_number,
          vip_member_id: vipMember.id,
          delivery_type: orderForm.delivery_type,
          pickup_schedule: orderForm.pickup_schedule,
          receiver_name: orderForm.receiver_name,
          receiver_address: orderForm.receiver_address,
          receiver_mobile: orderForm.receiver_mobile,
          paper_sizes: orderForm.paper_sizes,
          number_of_copies: orderForm.number_of_copies,
          instructions: orderForm.instructions,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          vip_member: vipMember,
          files: uploadedFiles
        };

        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: number, status: JobOrder['status']) => {
    try {
      const response = await apiService.updateJobOrderStatus(orderId, status);
      
      if (response.success) {
        // Update local state with the response from server
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status, updated_at: new Date().toISOString() }
              : order
          )
        );
        console.log('Order status updated successfully:', response);
      } else {
        console.error('Failed to update order status:', response.error);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }, []);

  // Update order amount
  const updateOrderAmount = useCallback((orderId: number, amount: number) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, total_amount_to_pay: amount, updated_at: new Date().toISOString() }
          : order
      )
    );
  }, []);

  // Load orders from server for a specific member
  const loadOrdersForMember = useCallback(async (memberId: number) => {
    try {
      const result = await apiService.getJobOrders(memberId);
      if (result.success && result.data) {
        // Convert server data to JobOrder format
        const serverOrders: JobOrder[] = result.data.map((order: any) => ({
          id: order.id,
          job_order_number: order.job_order_number,
          vip_member_id: order.vip_member_id,
          delivery_type: order.delivery_type,
          pickup_schedule: order.pickup_schedule,
          receiver_name: order.receiver_name,
          receiver_address: order.receiver_address,
          receiver_mobile: order.receiver_mobile,
          paper_sizes: typeof order.paper_sizes === 'string' ? JSON.parse(order.paper_sizes) : order.paper_sizes,
          number_of_copies: order.number_of_copies,
          instructions: order.instructions,
          total_amount_to_pay: order.total_amount_to_pay,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at,
          vip_member: order.vip_member,
          files: order.files || []
        }));
        
        setOrders(serverOrders);
        return serverOrders;
      }
    } catch (error) {
      console.error('Error loading orders from server:', error);
    }
    return [];
  }, []);

  // Load all orders from server (for admin)
  const loadAllOrders = useCallback(async () => {
    try {
      const result = await apiService.getAllJobOrders();
      if (result.success && result.data) {
        // Convert server data to JobOrder format
        const serverOrders: JobOrder[] = result.data.map((order: any) => ({
          id: order.id,
          job_order_number: order.job_order_number,
          vip_member_id: order.vip_member_id,
          delivery_type: order.delivery_type,
          pickup_schedule: order.pickup_schedule,
          receiver_name: order.receiver_name,
          receiver_address: order.receiver_address,
          receiver_mobile: order.receiver_mobile,
          paper_sizes: typeof order.paper_sizes === 'string' ? JSON.parse(order.paper_sizes) : order.paper_sizes,
          number_of_copies: order.number_of_copies,
          instructions: order.instructions,
          total_amount_to_pay: order.total_amount_to_pay,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at,
          vip_member: order.vip_member,
          files: order.files || []
        }));
        
        setOrders(serverOrders);
        return serverOrders;
      }
    } catch (error) {
      console.error('Error loading all orders from server:', error);
    }
    return [];
  }, []);

  // Get orders by VIP member ID (from local state)
  const getOrdersByMemberId = useCallback((memberId: number): JobOrder[] => {
    return orders.filter(order => order.vip_member_id === memberId);
  }, [orders]);

  // Get order by ID
  const getOrderById = (orderId: number): JobOrder | undefined => {
    return orders.find(order => order.id === orderId);
  };

  // Delete order (for admin use)
  const deleteOrder = useCallback(async (orderId: number) => {
    try {
      const response = await apiService.deleteJobOrder(orderId);
      
      if (response.success) {
        // Remove order from local state
        setOrders(prev => prev.filter(order => order.id !== orderId));
        console.log('Order deleted successfully:', response);
        return true;
      } else {
        console.error('Failed to delete order:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }, []);

  // Bulk delete orders
  const bulkDeleteOrders = useCallback(async (orderIds: number[]) => {
    try {
      const response = await apiService.bulkDeleteJobOrders(orderIds);
      
      if (response.success) {
        // Remove deleted orders from local state
        setOrders(prev => prev.filter(order => !orderIds.includes(order.id)));
        console.log('Orders deleted successfully:', response);
        return { success: true, deletedCount: orderIds.length };
      } else {
        console.error('Failed to delete orders:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Get order statistics
  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      inProgress: orders.filter(o => o.status === 'in_progress').length,
      ready: orders.filter(o => o.status === 'ready').length,
      completed: orders.filter(o => o.status === 'completed').length,
    };
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    updateOrderAmount,
    getOrdersByMemberId,
    loadOrdersForMember,
    loadAllOrders,
    getOrderById,
    deleteOrder,
    bulkDeleteOrders,
    getOrderStats,
  };
};
