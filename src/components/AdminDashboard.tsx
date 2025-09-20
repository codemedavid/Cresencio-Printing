import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VipMember, JobOrder, MemberStatus, OrderStatus } from '../types';
import Logo from './Logo';
import { Users, FileText, Search, CheckCircle, XCircle, Eye, Edit, Trash2, Plus, Menu, X, Filter, Download, RefreshCw } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'registrations' | 'orders'>('registrations');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<JobOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Mock data - in real app, this would come from API
  const [registrations, setRegistrations] = useState<VipMember[]>([
    {
      id: 1,
      unique_id: 'VIP-123456',
      full_name: 'John Doe',
      address: '123 Main St, City, State',
      email: 'john.doe@example.com',
      mobile_number: '+1234567890',
      customer_category: 'Regular Customer',
      status: 'pending',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-10T09:00:00Z',
    },
    {
      id: 2,
      unique_id: 'VIP-789012',
      full_name: 'Jane Smith',
      address: '456 Oak St, City, State',
      email: 'jane.smith@example.com',
      mobile_number: '+1234567891',
      customer_category: 'Student',
      school_name: 'University of Example',
      status: 'approved',
      created_at: '2024-01-11T10:30:00Z',
      updated_at: '2024-01-11T10:30:00Z',
    },
    {
      id: 3,
      unique_id: 'VIP-345678',
      full_name: 'Bob Johnson',
      address: '789 Pine St, City, State',
      email: 'bob.johnson@example.com',
      mobile_number: '+1234567892',
      customer_category: 'Senior Citizen',
      senior_id_number: 'SC-12345',
      status: 'rejected',
      created_at: '2024-01-12T14:15:00Z',
      updated_at: '2024-01-12T14:15:00Z',
    },
  ]);

  const [orders, setOrders] = useState<JobOrder[]>([
    {
      id: 1,
      job_order_number: 'JO-2024001',
      vip_member_id: 1,
      delivery_type: 'pickup',
      pickup_schedule: '2024-01-15T10:00:00Z',
      paper_sizes: ['A4'],
      number_of_copies: 50,
      instructions: 'Black and white, double-sided',
      status: 'completed',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      vip_member: registrations[0],
    },
    {
      id: 2,
      job_order_number: 'JO-2024002',
      vip_member_id: 2,
      delivery_type: 'delivery',
      receiver_name: 'Jane Smith',
      receiver_address: '456 Oak St, City, State',
      receiver_mobile: '+1234567891',
      paper_sizes: ['Letter', 'Legal'],
      number_of_copies: 25,
      instructions: 'Color printing, single-sided',
      status: 'in_progress',
      created_at: '2024-01-12T14:30:00Z',
      updated_at: '2024-01-12T14:30:00Z',
      vip_member: registrations[1],
    },
    {
      id: 3,
      job_order_number: 'JO-2024003',
      vip_member_id: 1,
      delivery_type: 'pickup',
      paper_sizes: ['A4'],
      number_of_copies: 100,
      instructions: 'Binding required',
      status: 'pending',
      created_at: '2024-01-14T16:45:00Z',
      updated_at: '2024-01-14T16:45:00Z',
      vip_member: registrations[0],
    },
  ]);

  const handleStatusChange = (id: number, newStatus: MemberStatus | OrderStatus) => {
    if (activeTab === 'registrations') {
      setRegistrations(prev => 
        prev.map(reg => reg.id === id ? { ...reg, status: newStatus as MemberStatus } : reg)
      );
      } else {
      setOrders(prev => 
        prev.map(order => order.id === id ? { ...order, status: newStatus as OrderStatus } : order)
      );
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.job_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.vip_member?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'ready':
        return 'text-purple-600 bg-purple-100';
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

  const handleOrderClick = (order: JobOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
                <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-600 hover:text-primary mr-4 transition-colors duration-300"
                >
                <Menu className="w-6 h-6" />
                </button>
              <Link to="/" className="flex items-center space-x-3">
                <Logo size="md" />
                <span className="text-gray-700 font-semibold">Admin</span>
              </Link>
              </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-medium">Admin Dashboard</span>
                <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
              >
                Logout
                </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? '' : 'closed'} md:translate-x-0`}>
          <div className="p-8">
            <div className="mb-8">
              <Logo size="md" showText={false} />
              <h2 className="text-lg font-bold text-white mt-4">Admin Panel</h2>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('registrations')}
                className={`sidebar-item ${activeTab === 'registrations' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5" />
                  <span>Registrations</span>
            </div>
                </button>
                  <button
                onClick={() => setActiveTab('orders')}
                className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5" />
                  <span>Orders</span>
                </div>
              </button>
            </nav>
            </div>
              </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          <div className="p-6">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                  <button className="btn-primary flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
            </div>
          </div>
        </div>

            {/* Registrations Tab */}
            {activeTab === 'registrations' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-bold text-gray-900">VIP Registrations</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>VIP ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg.id}>
                          <td className="font-medium text-blue-600">{reg.unique_id}</td>
                          <td>{reg.full_name}</td>
                          <td className="capitalize">{reg.customer_category}</td>
                          <td>{reg.email}</td>
                          <td>{reg.mobile_number}</td>
                          <td>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(reg.status)}`}>
                              {reg.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              {reg.status === 'pending' && (
                                <>
                  <button
                                    onClick={() => handleStatusChange(reg.id, 'approved')}
                                    className="btn-success text-xs flex items-center"
                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approve
                  </button>
                  <button
                                    onClick={() => handleStatusChange(reg.id, 'rejected')}
                                    className="btn-danger text-xs flex items-center"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                  </button>
                                </>
                              )}
                              <button className="btn-secondary text-xs flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                      </button>
                    </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-bold text-gray-900">Job Orders</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Details</th>
                        <th>Actions</th>
                  </tr>
                </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="cursor-pointer hover:bg-blue-50" onClick={() => handleOrderClick(order)}>
                          <td className="font-medium text-blue-600">{order.job_order_number}</td>
                          <td>{order.vip_member?.full_name}</td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="capitalize">{order.delivery_type}</td>
                          <td>
                            <div className="text-sm">
                              <p><strong>Copies:</strong> {order.number_of_copies}</p>
                              <p><strong>Sizes:</strong> {order.paper_sizes.join(', ')}</p>
                        </div>
                      </td>
                          <td>
                            <div className="flex gap-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="ready">Ready</option>
                                <option value="completed">Completed</option>
                              </select>
                              <button className="btn-secondary text-xs flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                Files
                              </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                    </div>
                  </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-bold text-gray-500">Order Number:</span>
                  <p className="text-gray-900">{selectedOrder.job_order_number}</p>
          </div>
                <div>
                  <span className="text-sm font-bold text-gray-500">Status:</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace('_', ' ').toUpperCase()}
                  </span>
        </div>
                <div>
                  <span className="text-sm font-bold text-gray-500">Customer:</span>
                  <p className="text-gray-900">{selectedOrder.vip_member?.full_name}</p>
      </div>
                <div>
                  <span className="text-sm font-bold text-gray-500">Delivery Type:</span>
                  <p className="text-gray-900 capitalize">{selectedOrder.delivery_type}</p>
              </div>
                <div>
                  <span className="text-sm font-bold text-gray-500">Paper Sizes:</span>
                  <p className="text-gray-900">{selectedOrder.paper_sizes.join(', ')}</p>
              </div>
                <div>
                  <span className="text-sm font-bold text-gray-500">Copies:</span>
                  <p className="text-gray-900">{selectedOrder.number_of_copies}</p>
          </div>
              </div>
              
              {selectedOrder.instructions && (
                <div>
                  <span className="text-sm font-bold text-gray-500">Instructions:</span>
                  <p className="text-gray-900">{selectedOrder.instructions}</p>
              </div>
              )}
              
              {selectedOrder.delivery_type === 'delivery' && (
                <div>
                  <span className="text-sm font-bold text-gray-500">Delivery Details:</span>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p><strong>Receiver:</strong> {selectedOrder.receiver_name}</p>
                    <p><strong>Address:</strong> {selectedOrder.receiver_address}</p>
                    <p><strong>Mobile:</strong> {selectedOrder.receiver_mobile}</p>
              </div>
            </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <button className="btn-primary">Download Files</button>
                <button className="btn-secondary">Print Order</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;