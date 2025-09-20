import { useState, useEffect } from 'react';
import { JobOrder, JobOrderForm, VipMember } from '../types';

// Storage key for localStorage
const STORAGE_KEY = 'cresencio_job_orders';

export const useJobOrders = () => {
  const [orders, setOrders] = useState<JobOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders from localStorage on mount
  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem(STORAGE_KEY);
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        setOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
    } finally {
      setLoading(false);
    }
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
  const createOrder = (orderForm: JobOrderForm, vipMember: VipMember): JobOrder => {
    const newOrder: JobOrder = {
      id: Date.now(), // Simple ID generation - in real app, use proper ID generation
      job_order_number: `JO-${Date.now().toString().slice(-6)}`,
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
      files: orderForm.files.map((file, index) => ({
        id: Date.now() + index,
        job_order_id: Date.now(),
        original_filename: file.name,
        stored_filename: `file_${Date.now()}_${index}_${file.name}`,
        file_path: URL.createObjectURL(file), // For demo purposes - in real app, upload to server
        file_size: file.size,
        file_type: file.type,
        created_at: new Date().toISOString()
      }))
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  // Update order status
  const updateOrderStatus = (orderId: number, status: JobOrder['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status, updated_at: new Date().toISOString() }
          : order
      )
    );
  };

  // Update order amount
  const updateOrderAmount = (orderId: number, amount: number) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, total_amount_to_pay: amount, updated_at: new Date().toISOString() }
          : order
      )
    );
  };

  // Get orders by VIP member ID
  const getOrdersByMemberId = (memberId: number): JobOrder[] => {
    return orders.filter(order => order.vip_member_id === memberId);
  };

  // Get order by ID
  const getOrderById = (orderId: number): JobOrder | undefined => {
    return orders.find(order => order.id === orderId);
  };

  // Delete order (for admin use)
  const deleteOrder = (orderId: number) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

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
    getOrderById,
    deleteOrder,
    getOrderStats,
  };
};
