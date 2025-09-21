import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVip } from '../contexts/VipContext';
import { useJobOrders } from '../hooks/useJobOrders';
import { JobOrder } from '../types';
import Logo from './Logo';
import { User, LogOut, Plus, FileText } from 'lucide-react';

const VipProfile: React.FC = () => {
  const navigate = useNavigate();
  const { currentVip, logout } = useVip();
  const { getOrdersByMemberId, loading } = useJobOrders();
  const [pendingOrders, setPendingOrders] = useState<JobOrder[]>([]);

  useEffect(() => {
    // Check if user is logged in via context or localStorage
    if (!currentVip) {
      // Double-check localStorage in case context hasn't updated yet
      const storedVip = localStorage.getItem('vipMember');
      if (storedVip) {
        // Don't redirect immediately, give context time to update
        return;
      } else {
        navigate('/login');
        return;
      }
    }

    // Load orders for the current VIP member
    const ordersForMember = getOrdersByMemberId(currentVip.id);
    
    // Filter only pending orders
    const pendingOnly = ordersForMember.filter(order => order.status === 'pending');
    setPendingOrders(pendingOnly);
  }, [currentVip, navigate, getOrdersByMemberId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'ready':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading if we don't have currentVip but there might be stored data
  if (!currentVip) {
    const storedVip = localStorage.getItem('vipMember');
    if (storedVip) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <Logo size="md" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Welcome, {currentVip.full_name}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4">Personal Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-bold text-gray-500">VIP ID:</span>
                  <p className="text-gray-900">{currentVip.unique_id}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-500">Full Name:</span>
                  <p className="text-gray-900">{currentVip.full_name}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-500">Email:</span>
                  <p className="text-gray-900">{currentVip.email}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-500">Mobile:</span>
                  <p className="text-gray-900">{currentVip.mobile_number}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4">Additional Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-bold text-gray-500">Address:</span>
                  <p className="text-gray-900">{currentVip.address}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-500">Category:</span>
                  <p className="text-gray-900">{currentVip.customer_category}</p>
                </div>
                {currentVip.school_name && (
                  <div>
                    <span className="text-sm font-bold text-gray-500">School:</span>
                    <p className="text-gray-900">{currentVip.school_name}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-bold text-gray-500">Status:</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(currentVip.status)}`}>
                    {currentVip.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Pending Orders</h2>
              <Link to="/new-order" className="btn-primary flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create New Order
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading orders...</p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No pending orders</p>
              <Link to="/new-order" className="btn-primary flex items-center justify-center mx-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Order
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => (
                    <tr key={order.id} className="cursor-pointer hover:bg-blue-50">
                      <td className="font-medium text-blue-600">{order.job_order_number}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="capitalize">{order.delivery_type}</td>
                      <td className="font-semibold text-green-600">
                        {order.total_amount_to_pay ? `₱${order.total_amount_to_pay.toFixed(2)}` : 'N/A'}
                      </td>
                      <td>
                        <div className="text-sm">
                          <p><strong>Copies:</strong> {order.number_of_copies}</p>
                          <p><strong>Sizes:</strong> {order.paper_sizes.join(', ')}</p>
                          {order.instructions && (
                            <p><strong>Instructions:</strong> {order.instructions}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VipProfile;
