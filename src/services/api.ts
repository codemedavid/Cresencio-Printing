// API Service for Printing Shop VIP System
// This service handles all API calls to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // VIP Member endpoints
  async registerVipMember(formData: FormData): Promise<ApiResponse<{ unique_id: string }>> {
    try {
      // For file uploads with FormData, we need to let the browser set the Content-Type header
      // to multipart/form-data with the proper boundary
      const response = await fetch(`${API_BASE_URL}/vip-members/register`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it automatically
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Registration failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('VIP registration request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  async loginVipMember(uniqueId: string): Promise<ApiResponse<any>> {
    return this.request('/vip-members/login', {
      method: 'POST',
      body: JSON.stringify({ unique_id: uniqueId }),
    });
  }

  async getVipMember(uniqueId: string): Promise<ApiResponse<any>> {
    return this.request(`/vip-members/${uniqueId}`);
  }

  // Job Order endpoints
  async createJobOrder(orderData: any): Promise<ApiResponse<{ job_order_number: string }>> {
    return this.request('/job-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getJobOrders(vipMemberId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/job-orders/member/${vipMemberId}`);
  }

  async updateJobOrderStatus(orderId: number, status: string): Promise<ApiResponse<JobOrder>> {
    return this.request(`/admin/job-orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateJobOrderAmount(orderId: number, amount: number): Promise<ApiResponse<JobOrder>> {
    return this.request(`/admin/job-orders/${orderId}/amount`, {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    });
  }

  async deleteJobOrder(orderId: number): Promise<ApiResponse<any>> {
    return this.request(`/admin/job-orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteJobOrders(orderIds: number[]): Promise<ApiResponse<any>> {
    return this.request('/admin/job-orders', {
      method: 'DELETE',
      body: JSON.stringify({ orderIds }),
    });
  }


  // Admin endpoints
  async getVipRegistrations(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/registrations');
  }

  async updateVipStatus(memberId: number, status: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/vip-members/${memberId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAllJobOrders(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/job-orders');
  }

  // Paper sizes endpoint
  async getPaperSizes(): Promise<ApiResponse<any[]>> {
    return this.request('/paper-sizes');
  }

  // File upload endpoint
  async uploadFile(file: File, orderId?: number): Promise<ApiResponse<{ file_path: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (orderId) {
        formData.append('order_id', orderId.toString());
      }

      // For file uploads, we need to let the browser set the Content-Type header
      // to multipart/form-data with the proper boundary
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it automatically
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Upload failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('File upload request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;
