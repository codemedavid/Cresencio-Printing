import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VipMember, JobOrder, MemberStatus, OrderStatus } from '../types';
import Logo from './Logo';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useJobOrders } from '../hooks/useJobOrders';
import { 
  Users, FileText, Search, CheckCircle, XCircle, Eye, 
  Menu, X, Download, LogOut, Bell, 
  Clock, UserCheck, BarChart3, Edit, Save, XCircle as XCircleIcon,
  FileDown
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, adminUser, logout, isLoading } = useAdminAuth();
  const { orders, updateOrderStatus, updateOrderAmount } = useJobOrders();
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'orders'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<JobOrder | null>(null);
  const [selectedMember, setSelectedMember] = useState<VipMember | null>(null);
  const [editingAmount, setEditingAmount] = useState<number | null>(null);
  const [tempAmount, setTempAmount] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  
  // Redirect if not authenticated (but wait for loading to complete)
  useEffect(() => {
    console.log('AdminDashboard: isLoading =', isLoading, 'isAuthenticated =', isAuthenticated);
    if (!isLoading && !isAuthenticated) {
      console.log('AdminDashboard: redirecting to login');
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

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


  // Statistics
  const stats = {
    totalMembers: registrations.length,
    pendingMembers: registrations.filter(r => r.status === 'pending').length,
    approvedMembers: registrations.filter(r => r.status === 'approved').length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const updateMemberStatus = (id: number, status: MemberStatus) => {
    // Find the member to get their name for confirmation
    const member = registrations.find(reg => reg.id === id);
    const memberName = member?.full_name || 'Unknown Member';
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to change the status of ${memberName} (${member?.unique_id}) to "${status}"?`
    );
    
    if (confirmed) {
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === id 
            ? { ...reg, status, updated_at: new Date().toISOString() }
            : reg
        )
      );
    }
  };

  const handleUpdateOrderStatus = (id: number, status: OrderStatus) => {
    updateOrderStatus(id, status);
  };

  const startEditingAmount = (orderId: number, currentAmount?: number) => {
    setEditingAmount(orderId);
    setTempAmount(currentAmount?.toString() || '');
  };

  const saveAmount = (orderId: number) => {
    const amount = parseFloat(tempAmount);
    if (!isNaN(amount) && amount >= 0) {
      updateOrderAmount(orderId, amount);
    }
    setEditingAmount(null);
    setTempAmount('');
  };

  const cancelEditingAmount = () => {
    setEditingAmount(null);
    setTempAmount('');
  };

  const toggleFileSelection = (orderId: number) => {
    setSelectedFiles(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const downloadFile = async (file: any) => {
    console.log('Downloading file:', file);
    
    // Create a demo file content based on file type
    let fileContent = '';
    let mimeType = file.file_type;
    
    if (file.file_type.includes('pdf')) {
      mimeType = 'application/pdf';
      fileContent = `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(${file.original_filename}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n298\n%%EOF`;
    } else if (file.file_type.includes('image')) {
      // Create a simple 1x1 pixel image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(file.original_filename, 10, 50);
      }
      fileContent = canvas.toDataURL('image/png');
      mimeType = 'image/png';
    } else if (file.file_type.includes('word') || file.file_type.includes('document')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileContent = `Content of ${file.original_filename}\n\nThis is a demo document created for download.\nFile size: ${formatFileSize(file.file_size)}\nUploaded: ${new Date().toLocaleDateString()}`;
    } else if (file.file_type.includes('excel') || file.file_type.includes('spreadsheet')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileContent = `Content of ${file.original_filename}\n\nThis is a demo spreadsheet created for download.\nFile size: ${formatFileSize(file.file_size)}\nUploaded: ${new Date().toLocaleDateString()}`;
    } else if (file.file_type.includes('powerpoint') || file.file_type.includes('presentation')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      fileContent = `Content of ${file.original_filename}\n\nThis is a demo presentation created for download.\nFile size: ${formatFileSize(file.file_size)}\nUploaded: ${new Date().toLocaleDateString()}`;
    } else {
      mimeType = 'text/plain';
      fileContent = `Content of ${file.original_filename}\n\nThis is a demo file created for download.\nFile size: ${formatFileSize(file.file_size)}\nUploaded: ${new Date().toLocaleDateString()}`;
    }
    
    // Create blob and download
    try {
      let blob;
      if (file.file_type.includes('image')) {
        // For images, use the data URL directly
        const response = await fetch(fileContent);
        blob = await response.blob();
      } else {
        blob = new Blob([fileContent], { type: mimeType });
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`Successfully downloaded: ${file.original_filename}`);
    } catch (error) {
      console.error('Download error:', error);
      alert(`Error downloading file: ${file.original_filename}`);
    }
  };

  const downloadAllFilesForOrder = async (order: JobOrder) => {
    if (!order.files || order.files.length === 0) {
      alert('No files available for this order');
      return;
    }
    
    console.log(`Downloading all files for order ${order.job_order_number}:`, order.files);
    
    // Download each file individually with a small delay
    for (let i = 0; i < order.files.length; i++) {
      const file = order.files[i];
      console.log(`Downloading file ${i + 1}/${order.files.length}: ${file.original_filename}`);
      
      // Add a small delay between downloads to avoid browser blocking
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      await downloadFile(file);
    }
    
    console.log(`Successfully downloaded ${order.files.length} files for order ${order.job_order_number}`);
  };

  const bulkDownloadFiles = async () => {
    const selectedOrders = orders.filter(order => selectedFiles.includes(order.id));
    const totalFiles = selectedOrders.reduce((sum, order) => sum + (order.files?.length || 0), 0);
    
    if (totalFiles === 0) {
      alert('No files available for download in selected orders');
      return;
    }
    
    console.log('Bulk downloading files for orders:', selectedOrders);
    
    // Download all files from all selected orders
    let downloadedCount = 0;
    for (const order of selectedOrders) {
      if (order.files && order.files.length > 0) {
        console.log(`Downloading files for order: ${order.job_order_number}`);
        for (const file of order.files) {
          downloadedCount++;
          console.log(`Downloading file ${downloadedCount}/${totalFiles}: ${file.original_filename}`);
          
          // Add a small delay between downloads
          if (downloadedCount > 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          await downloadFile(file);
        }
      }
    }
    
    console.log(`Successfully downloaded ${downloadedCount} files from ${selectedOrders.length} orders`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  };

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const bulkUpdateMemberStatus = (status: MemberStatus) => {
    const selectedMembersList = registrations.filter(reg => selectedMembers.includes(reg.id));
    const memberNames = selectedMembersList.map(reg => `${reg.full_name} (${reg.unique_id})`).join(', ');
    
    const confirmed = window.confirm(
      `Are you sure you want to change the status of ${selectedMembersList.length} members to "${status}"?\n\nMembers: ${memberNames}`
    );
    
    if (confirmed) {
      setRegistrations(prev => 
        prev.map(reg => 
          selectedMembers.includes(reg.id)
            ? { ...reg, status, updated_at: new Date().toISOString() }
            : reg
        )
      );
      setSelectedMembers([]);
    }
  };

  const getMemberJobOrders = (memberId: number) => {
    return orders.filter(order => order.vip_member_id === memberId);
  };

  const handleMemberClick = (member: VipMember) => {
    setSelectedMember(member);
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.job_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.vip_member?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'approved':
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'in_progress':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <Logo size="md" showText={false} />
                <div className="ml-3">
                  <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Cresencio Printing Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{adminUser?.username}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden">
            <Logo size="md" showText={false} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'registrations', label: 'VIP Members', icon: Users },
                { id: 'orders', label: 'Job Orders', icon: FileText },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                  <p className="text-gray-600">Welcome back, {adminUser?.username}! Here's what's happening today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Members</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Members</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingMembers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <UserCheck className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Approved Members</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.approvedMembers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Recent VIP Registrations</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {registrations.slice(0, 3).map((reg) => (
                          <div key={reg.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{reg.full_name}</p>
                              <p className="text-sm text-gray-500">{reg.unique_id}</p>
                            </div>
                            <span className={getStatusBadge(reg.status)}>{reg.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Job Orders</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{order.job_order_number}</p>
                              <p className="text-sm text-gray-500">{order.vip_member?.full_name || 'Unknown'}</p>
                            </div>
                            <span className={getStatusBadge(order.status)}>{order.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Registrations Tab */}
            {activeTab === 'registrations' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">VIP Member Management</h2>
                    <p className="text-gray-600">Review and manage VIP member registrations</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    {selectedMembers.length > 0 && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => bulkUpdateMemberStatus('approved')}
                          className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve ({selectedMembers.length})
                        </button>
                        <button 
                          onClick={() => bulkUpdateMemberStatus('rejected')}
                          className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject ({selectedMembers.length})
                        </button>
                      </div>
                    )}
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search members..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registrations Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembers(registrations.map(r => r.id));
                                } else {
                                  setSelectedMembers([]);
                                }
                              }}
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRegistrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300"
                                checked={selectedMembers.includes(reg.id)}
                                onChange={() => toggleMemberSelection(reg.id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <button
                                  onClick={() => handleMemberClick(reg)}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                                >
                                  {reg.full_name}
                                </button>
                                <div className="text-sm text-gray-500">{reg.unique_id}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{reg.email}</div>
                              <div className="text-sm text-gray-500">{reg.mobile_number}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reg.customer_category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className={getStatusBadge(reg.status)}>{reg.status}</span>
                                <select
                                  value={reg.status}
                                  onChange={(e) => updateMemberStatus(reg.id, e.target.value as MemberStatus)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-2"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900" title="View Details">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Order Management</h2>
                    <p className="text-gray-600">Track and manage printing job orders</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    {selectedFiles.length > 0 && (
                      <button 
                        onClick={bulkDownloadFiles}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Bulk Download ({selectedFiles.length})
                      </button>
                    )}
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFiles(orders.map(o => o.id));
                                } else {
                                  setSelectedFiles([]);
                                }
                              }}
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300"
                                checked={selectedFiles.includes(order.id)}
                                onChange={() => toggleFileSelection(order.id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{order.job_order_number}</div>
                              <div className="text-sm text-gray-500">{order.delivery_type}</div>
                              <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{order.vip_member?.full_name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{order.vip_member?.unique_id || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{order.number_of_copies} copies</div>
                              <div className="text-sm text-gray-500">{order.paper_sizes.join(', ')}</div>
                              <div className="text-xs text-blue-600 font-medium">
                                📎 {order.files?.length || 0} files uploaded
                              </div>
                              {order.instructions && (
                                <div className="text-xs text-gray-400 truncate max-w-xs" title={order.instructions}>
                                  {order.instructions}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingAmount === order.id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={tempAmount}
                                    onChange={(e) => setTempAmount(e.target.value)}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                  <button
                                    onClick={() => saveAmount(order.id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={cancelEditingAmount}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <XCircleIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    ₱{order.total_amount_to_pay?.toFixed(2) || '0.00'}
                                  </span>
                                  <button
                                    onClick={() => startEditingAmount(order.id, order.total_amount_to_pay)}
                                    className="text-gray-400 hover:text-blue-600"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="ready">Ready</option>
                                <option value="completed">Completed</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => downloadAllFilesForOrder(order)}
                                  className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                  title="Download Files"
                                  disabled={!order.files || order.files.length === 0}
                                >
                                  <FileDown className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Number</label>
                  <p className="text-sm text-gray-900">{selectedOrder.job_order_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={getStatusBadge(selectedOrder.status)}>{selectedOrder.status}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{selectedOrder.vip_member?.full_name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Copies</label>
                  <p className="text-sm text-gray-900">{selectedOrder.number_of_copies}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Paper Sizes</label>
                  <p className="text-sm text-gray-900">{selectedOrder.paper_sizes.join(', ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Type</label>
                  <p className="text-sm text-gray-900">{selectedOrder.delivery_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount to Pay</label>
                  <p className="text-lg font-bold text-green-600">₱{selectedOrder.total_amount_to_pay?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submission Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Instructions</label>
                <p className="text-sm text-gray-900 mt-1">{selectedOrder.instructions}</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Files ({selectedOrder.files?.length || 0})
                </label>
                {selectedOrder.files && selectedOrder.files.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid gap-2">
                      {selectedOrder.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.original_filename}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.file_size)} • {file.file_type}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadFile(file)}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            <FileDown className="h-3 w-3 mr-1" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => downloadAllFilesForOrder(selectedOrder)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Download All Files
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No files uploaded for this order</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Job History Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Job Order History</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedMember.full_name} ({selectedMember.unique_id})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Member Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900">{selectedMember.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">VIP ID</label>
                    <p className="text-sm text-gray-900">{selectedMember.unique_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedMember.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <p className="text-sm text-gray-900">{selectedMember.mobile_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900">{selectedMember.customer_category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={getStatusBadge(selectedMember.status)}>{selectedMember.status}</span>
                  </div>
                </div>
              </div>

              {/* Job Orders */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Job Orders ({getMemberJobOrders(selectedMember.id).length})</h4>
                
                {getMemberJobOrders(selectedMember.id).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getMemberJobOrders(selectedMember.id).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.job_order_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{order.number_of_copies} copies</div>
                              <div className="text-sm text-gray-500">{order.paper_sizes.join(', ')}</div>
                              <div className="text-xs text-gray-400">{order.delivery_type}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₱{order.total_amount_to_pay?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={getStatusBadge(order.status)}>{order.status}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedMember(null);
                                    setSelectedOrder(order);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => downloadAllFilesForOrder(order)}
                                  className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                  title="Download Files"
                                  disabled={!order.files || order.files.length === 0}
                                >
                                  <FileDown className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No job orders found</p>
                    <p className="text-sm">This member hasn't submitted any orders yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;