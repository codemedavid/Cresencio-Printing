// VIP Member Types
export interface VipMember {
  id: number;
  unique_id: string;
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
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Paper Size Types
export interface PaperSize {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
}

// Job Order Types
export interface JobOrder {
  id: number;
  job_order_number: string;
  vip_member_id: number;
  delivery_type: 'pickup' | 'delivery';
  pickup_schedule?: string;
  receiver_name?: string;
  receiver_address?: string;
  receiver_mobile?: string;
  paper_sizes: string[];
  number_of_copies: number;
  instructions?: string;
  status: 'pending' | 'in_progress' | 'ready' | 'completed';
  created_at: string;
  updated_at: string;
  vip_member?: VipMember;
  files?: JobOrderFile[];
}

// Job Order File Types
export interface JobOrderFile {
  id: number;
  job_order_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

// Admin User Types
export interface AdminUser {
  id: number;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface VipRegistrationForm {
  full_name: string;
  address: string;
  email: string;
  mobile_number: string;
  customer_category: 'Student' | 'Senior Citizen' | 'Regular Customer' | 'PWD';
  school_name?: string;
  student_id_file?: File;
  senior_id_number?: string;
  senior_id_file?: File;
  pwd_id_number?: string;
  pwd_id_file?: File;
  verification_id_file?: File;
}

export interface JobOrderForm {
  delivery_type: 'pickup' | 'delivery';
  pickup_schedule?: string;
  receiver_name?: string;
  receiver_address?: string;
  receiver_mobile?: string;
  paper_sizes: string[];
  number_of_copies: number;
  instructions?: string;
  files: File[];
}

export interface LoginForm {
  unique_id: string;
}

// UI State Types
export type CustomerCategory = 'Student' | 'Senior Citizen' | 'Regular Customer' | 'PWD';
export type DeliveryType = 'pickup' | 'delivery';
export type OrderStatus = 'pending' | 'in_progress' | 'ready' | 'completed';
export type MemberStatus = 'pending' | 'approved' | 'rejected';