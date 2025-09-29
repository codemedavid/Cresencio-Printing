import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVip } from '../contexts/VipContext';
import { useJobOrders } from '../hooks/useJobOrders';
import { JobOrder } from '../types';
import Logo from './Logo';
import { User, LogOut, Plus, FileText, RefreshCw } from 'lucide-react';

const VipProfile: React.FC = () => {
  const navigate = useNavigate();
  const { currentVip, logout } = useVip();
  const { getOrdersByMemberId, loadOrdersForMember, loading } = useJobOrders();
  const [allOrders, setAllOrders] = useState<JobOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'ready' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);

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

    // Load orders for the current VIP member from server
    const loadOrders = async () => {
      try {
        const ordersForMember = await loadOrdersForMember(currentVip.id);
        setAllOrders(ordersForMember);
      } catch (error) {
        console.error('Error loading orders:', error);
        // Fallback to local orders
        const localOrders = getOrdersByMemberId(currentVip.id);
        setAllOrders(localOrders);
      }
    };
    
    loadOrders();
  }, [currentVip?.id, navigate]);

  // Function to refresh orders
  const refreshOrders = async () => {
    if (!currentVip) return;
    
    setRefreshing(true);
    try {
      const ordersForMember = await loadOrdersForMember(currentVip.id);
      setAllOrders(ordersForMember);
    } catch (error) {
      console.error('Error refreshing orders:', error);
      // Fallback to local orders
      const localOrders = getOrdersByMemberId(currentVip.id);
      setAllOrders(localOrders);
    } finally {
      setRefreshing(false);
    }
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
        {/* Enhanced Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentVip.full_name}</h2>
                <p className="text-gray-600">VIP Member Profile</p>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(currentVip.status)}`}>
                  {currentVip.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Details Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-sm font-semibold text-gray-600">VIP ID:</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border border-blue-200">{currentVip.unique_id}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-sm font-semibold text-gray-600">Name:</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border border-blue-200">{currentVip.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-sm font-semibold text-gray-600">Email:</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border border-blue-200 break-all">{currentVip.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-sm font-semibold text-gray-600">Mobile:</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border border-blue-200">{currentVip.mobile_number}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Information Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Additional Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-sm font-semibold text-gray-600">Address:</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border border-green-200">{currentVip.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-sm font-semibold text-gray-600">Category:</span>
                    </div>
                    <div className="flex-1">
                      <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-white border border-green-200 text-gray-900">
                        {currentVip.customer_category}
                      </span>
                    </div>
                  </div>
                  {currentVip.school_name && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-20">
                        <span className="text-sm font-semibold text-gray-600">School:</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border border-green-200">{currentVip.school_name}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-sm font-semibold text-gray-600">Member Since:</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border border-green-200">
                        {new Date(currentVip.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order History</h2>
                <p className="text-gray-600">Track and manage your printing orders</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Refresh Button */}
                <button
                  onClick={refreshOrders}
                  disabled={refreshing}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-md"
                  title="Refresh orders"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                
                {/* Enhanced Status Filter */}
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                {/* Enhanced Create Button */}
                <Link 
                  to="/new-order" 
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Order
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced Order Summary */}
          {!loading && allOrders.length > 0 && (
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-gray-900">{allOrders.length}</div>
                  <div className="text-sm font-medium text-gray-600">Total</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-orange-600">{allOrders.filter(o => o.status === 'pending').length}</div>
                  <div className="text-sm font-medium text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-blue-600">{allOrders.filter(o => o.status === 'in_progress').length}</div>
                  <div className="text-sm font-medium text-gray-600">In Progress</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{allOrders.filter(o => o.status === 'ready').length}</div>
                  <div className="text-sm font-medium text-gray-600">Ready</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-green-600">{allOrders.filter(o => o.status === 'completed').length}</div>
                  <div className="text-sm font-medium text-gray-600">Completed</div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Content Area */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 text-lg">Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus.replace('_', ' ')} orders`}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {filterStatus === 'all' 
                  ? 'Start by creating your first printing order to see it here.'
                  : `You don't have any ${filterStatus.replace('_', ' ')} orders at the moment.`
                }
              </p>
              <Link 
                to="/new-order" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Order
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Enhanced Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Number</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors duration-200">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                              {order.job_order_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {order.delivery_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {order.total_amount_to_pay ? `₱${order.total_amount_to_pay.toFixed(2)}` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700 w-16">Copies:</span>
                              <span>{order.number_of_copies}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700 w-16">Sizes:</span>
                              <span>{order.paper_sizes.join(', ')}</span>
                            </div>
                            {order.files && order.files.length > 0 && (
                              <div className="flex items-center">
                                <span className="font-medium text-gray-700 w-16">Files:</span>
                                <span className="text-blue-600">📎 {order.files.length} uploaded</span>
                              </div>
                            )}
                            {order.instructions && (
                              <div className="flex items-start">
                                <span className="font-medium text-gray-700 w-16">Notes:</span>
                                <span className="text-gray-600">{order.instructions}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredOrders.length} of {allOrders.length} orders
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${(filteredOrders.length / Math.max(allOrders.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VipProfile;
