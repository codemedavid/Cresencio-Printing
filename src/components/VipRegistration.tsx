import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VipRegistrationForm, CustomerCategory } from '../types';
import Logo from './Logo';
import { User, Mail, Phone, MapPin, GraduationCap, UserCheck, FileText, Upload, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const VipRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VipRegistrationForm>({
    full_name: '',
    address: '',
    email: '',
    mobile_number: '',
    customer_category: 'Regular Customer',
  });
  const [errors, setErrors] = useState<Partial<VipRegistrationForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof VipRegistrationForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<VipRegistrationForm> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    }

    // Category-specific validations
    if (formData.customer_category === 'Student' && !formData.school_name?.trim()) {
      newErrors.school_name = 'School name is required for students';
    }

    if (formData.customer_category === 'Senior Citizen' && !formData.senior_id_number?.trim()) {
      newErrors.senior_id_number = 'Senior ID number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate unique ID
      const uniqueId = `VIP-${Date.now().toString().slice(-6)}`;
      setGeneratedId(uniqueId);
      setShowSuccessModal(true);
      
      // In a real app, you would save to database here
      console.log('Registration data:', formData);
      
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  const renderConditionalFields = () => {
    switch (formData.customer_category) {
      case 'Student':
        return (
          <>
            <div>
              <label htmlFor="school_name" className="form-label flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-gray-600" />
                School Name *
              </label>
              <input
                type="text"
                id="school_name"
                name="school_name"
                value={formData.school_name || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your school name"
              />
              {errors.school_name && <p className="form-error">{errors.school_name}</p>}
            </div>
            <div>
              <label htmlFor="student_id_file" className="form-label flex items-center">
                <Upload className="w-4 h-4 mr-2 text-gray-600" />
                Upload Student ID *
              </label>
              <FileUpload
                id="student_id_file"
                name="student_id_file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
            </div>
          </>
        );
      
      case 'Senior Citizen':
        return (
          <>
            <div>
              <label htmlFor="senior_id_number" className="form-label flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-600" />
                Senior ID Number *
              </label>
              <input
                type="text"
                id="senior_id_number"
                name="senior_id_number"
                value={formData.senior_id_number || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your senior ID number"
              />
              {errors.senior_id_number && <p className="form-error">{errors.senior_id_number}</p>}
            </div>
            <div>
              <label htmlFor="senior_id_file" className="form-label flex items-center">
                <Upload className="w-4 h-4 mr-2 text-gray-600" />
                Upload Senior ID *
              </label>
              <FileUpload
                id="senior_id_file"
                name="senior_id_file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
            </div>
          </>
        );
      
      case 'PWD':
        return (
          <>
            <div>
              <label htmlFor="pwd_id_number" className="form-label">
                PWD ID Number (Optional)
              </label>
              <input
                type="text"
                id="pwd_id_number"
                name="pwd_id_number"
                value={formData.pwd_id_number || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your PWD ID number"
              />
            </div>
            <div>
              <label htmlFor="pwd_id_file" className="form-label">
                Upload PWD ID (Optional)
              </label>
              <FileUpload
                id="pwd_id_file"
                name="pwd_id_file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
            </div>
          </>
        );
      
      default:
        return (
          <div>
            <label htmlFor="verification_id_file" className="form-label">
              Upload ID (Optional)
            </label>
            <FileUpload
              id="verification_id_file"
              name="verification_id_file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      {/* Decorative Background Elements */}
      <div className="decorative-circle decorative-circle-1"></div>
      <div className="decorative-circle decorative-circle-2"></div>
      <div className="decorative-circle decorative-circle-3"></div>
      
      <div className="max-w-lg mx-auto px-4 relative z-10">
        <div className="card-modern gradient-border">
          <div className="card-header text-center fade-in-up">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-3xl mb-6 shadow-2xl floating">
                <Logo size="md" showText={false} />
              </div>
              <Logo size="lg" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">VIP Registration</h1>
            <p className="text-gray-600 text-lg font-medium">
              Join our VIP program for priority service
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="form-label flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-600" />
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
              />
              {errors.full_name && <p className="form-error">{errors.full_name}</p>}
            </div>

            <div>
              <label htmlFor="address" className="form-label flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="form-input"
                placeholder="Enter your complete address"
              />
              {errors.address && <p className="form-error">{errors.address}</p>}
            </div>

            <div>
              <label htmlFor="email" className="form-label flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-600" />
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email address"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="mobile_number" className="form-label flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-600" />
                Mobile Number *
              </label>
              <input
                type="tel"
                id="mobile_number"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your mobile number"
              />
              {errors.mobile_number && <p className="form-error">{errors.mobile_number}</p>}
            </div>

            <div>
              <label htmlFor="customer_category" className="form-label flex items-center">
                <UserCheck className="w-4 h-4 mr-2 text-gray-600" />
                Customer Category *
              </label>
              <select
                id="customer_category"
                name="customer_category"
                value={formData.customer_category}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Regular Customer">Regular Customer</option>
                <option value="Student">Student</option>
                <option value="Senior Citizen">Senior Citizen</option>
                <option value="PWD">PWD</option>
              </select>
            </div>

            {renderConditionalFields()}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed hover-lift flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Registering...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Register
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 font-medium">
              Already have a VIP ID?{' '}
              <Link to="/login" className="text-primary hover:text-accent font-bold transition-colors duration-300 flex items-center justify-center">
                Login here
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-2xl pulse-animation">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gradient mb-4">Registration Successful!</h2>
              <div className="glass-card rounded-2xl p-6 mb-6">
                <p className="text-gray-700 mb-2 font-medium">Your VIP ID is:</p>
                <p className="text-2xl font-bold text-primary">{generatedId}</p>
              </div>
              <p className="text-gray-600 mb-8 text-lg">
                Please check your email for confirmation and keep your VIP ID safe.
              </p>
              <button
                onClick={handleModalClose}
                className="btn-primary hover-lift flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// File Upload Component
interface FileUploadProps {
  id: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ id, name, onChange, accept = "*" }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = {
        target: { files, name }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(fakeEvent);
    }
  };

  return (
    <div
      className={`file-upload ${isDragOver ? 'dragover' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById(id)?.click()}
    >
      <input
        type="file"
        id={id}
        name={name}
        onChange={onChange}
        accept={accept}
        className="hidden"
      />
      <div className="text-center">
        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-600">Drag or Click to Upload</p>
        <p className="text-sm text-gray-400 mt-1">PDF, PNG, JPG up to 10MB</p>
      </div>
    </div>
  );
};

export default VipRegistration;
