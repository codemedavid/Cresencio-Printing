import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVip } from '../contexts/VipContext';
import { useJobOrders } from '../hooks/useJobOrders';
import { JobOrder } from '../types';
import Logo from './Logo';
import { User, LogOut, Plus, FileText, RefreshCcw } from 'lucide-react';

const VipProfile: React.FC = () => {
  const navigate = useNavigate();
  const { currentVip, logout } = useVip();
  const { getOrdersByMemberId, loading } = useJobOrders();
  const [allOrders, setAllOrders] = useState<JobOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'ready' | 'completed'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Run once when dependencies change meaningfully
    if (!currentVip) {
      const storedVip = localStorage.getItem('vipMember');
      if (!storedVip) {
        navigate('/login');
      }
      return;
    }

    const ordersForMember = getOrdersByMemberId(currentVip.id);
    setAllOrders(ordersForMember);
  }, [currentVip?.id, navigate, getOrdersByMemberId]);

  const handleRefresh = () => {
    if (!currentVip) return;
    setIsRefreshing(true);
    // Re-read orders from the hook (local storage-backed)
    const refreshed = getOrdersByMemberId(currentVip.id);
    setAllOrders(refreshed);
    // Small delay for UX
    setTimeout(() => setIsRefreshing(false), 300);
  };

  // Filter orders based on selected status
  const filteredOrders = filterStatus === 'all' 
    ? allOrders 
    : allOrders.filter(order => order.status === filterStatus);

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
        {/* Profile Section - redesigned */}
        <div className="card mb-8">
          {/* Gradient header strip to match reference */}
          <div className="flex items-center justify-between rounded-2xl p-5 mb-6" style={{background: 'linear-gradient(180deg, #F5F3FF 0%, #FCE7F3 100%)'}}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md" style={{backgroundColor: '#7C3AED', color: 'white'}}>
                <User className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentVip.full_name}</h2>
                <p className="text-sm text-gray-500">VIP Member Profile</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200">
              {currentVip.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0">
            <div className="rounded-xl border p-5 bg-[#EEF4FF] border-[#D6E4FF]">
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white" style={{backgroundColor: '#2563EB'}}>
                  <User className="w-4 h-4" />
                </span>
                Personal Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">VIP ID</label>
                  <input readOnly value={currentVip.unique_id} className="w-full form-input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Name</label>
                  <input readOnly value={currentVip.full_name} className="w-full form-input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Email</label>
                  <input readOnly value={currentVip.email} className="w-full form-input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Mobile</label>
                  <input readOnly value={currentVip.mobile_number} className="w-full form-input" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-5 bg-[#E9FBF0] border-[#BDE5C8]">
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white" style={{backgroundColor: '#16A34A'}}>
                  {/* simple square icon */}
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="2"></rect></svg>
                </span>
                Additional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Address</label>
                  <input readOnly value={currentVip.address} className="w-full form-input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Category</label>
                  <input readOnly value={currentVip.customer_category} className="w-full form-input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Member Since</label>
                  <input readOnly value={new Date(currentVip.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} className="w-full form-input" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="card">
          <div className="card-header">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">Order History</h2>
              <div className="flex items-stretch sm:items-center gap-3 flex-wrap">
                {/* Status Filter */}
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700" htmlFor="order-filter">Filter:</label>
                  <select
                    id="order-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto justify-center"
                >
                  <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <Link to="/new-order" className="btn-primary flex items-center mobile-full justify-center w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Order
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {!loading && allOrders.length > 0 && (
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                <div className="flex items-center justify-between sm:block">
                  <span className="text-gray-500 sm:block sm:mb-1">Total</span>
                  <span className="text-gray-900 font-semibold">{allOrders.length}</span>
                </div>
                <div className="flex items-center justify-between sm:block">
                  <span className="text-orange-500 sm:block sm:mb-1">Pending</span>
                  <span className="text-orange-600 font-semibold">{allOrders.filter(o => o.status === 'pending').length}</span>
                </div>
                <div className="flex items-center justify-between sm:block">
                  <span className="text-blue-500 sm:block sm:mb-1">In Progress</span>
                  <span className="text-blue-600 font-semibold">{allOrders.filter(o => o.status === 'in_progress').length}</span>
                </div>
                <div className="flex items-center justify-between sm:block">
                  <span className="text-yellow-500 sm:block sm:mb-1">Ready</span>
                  <span className="text-yellow-600 font-semibold">{allOrders.filter(o => o.status === 'ready').length}</span>
                </div>
                <div className="flex items-center justify-between sm:block">
                  <span className="text-green-500 sm:block sm:mb-1">Completed</span>
                  <span className="text-green-600 font-semibold">{allOrders.filter(o => o.status === 'completed').length}</span>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus.replace('_', ' ')} orders`}
              </p>
              {filterStatus === 'all' && (
                <Link to="/new-order" className="btn-primary flex items-center justify-center mx-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Order
                </Link>
              )}
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
                  {filteredOrders.map((order) => (
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


