// API Service for Printing Shop VIP System
// This service handles all API calls to the backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
    return this.request('/vip-members/register', {
      method: 'POST',
      body: formData,
    });
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

  async updateJobOrderStatus(orderId: number, status: string): Promise<ApiResponse<any>> {
    return this.request(`/job-orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
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
    const formData = new FormData();
    formData.append('file', file);
    if (orderId) {
      formData.append('order_id', orderId.toString());
    }

    return this.request('/upload', {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiService = new ApiService();
export default apiService;
