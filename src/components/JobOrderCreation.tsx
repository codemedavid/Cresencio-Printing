import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVip } from '../contexts/VipContext';
import { useJobOrders } from '../hooks/useJobOrders';
import { JobOrderForm, PaperSize } from '../types';
import Logo from './Logo';
import { FileText, Upload, CheckCircle, ArrowLeft, Printer, Package, Truck, User, Calendar, Copy, X } from 'lucide-react';

const JobOrderCreation: React.FC = () => {
  const navigate = useNavigate();
  const { currentVip, paperSizes, setPaperSizes } = useVip();
  const { createOrder } = useJobOrders();
  const [formData, setFormData] = useState<JobOrderForm>({
    delivery_type: 'pickup',
    paper_sizes: [],
    number_of_copies: 1,
    files: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedOrderNumber, setGeneratedOrderNumber] = useState('');

  useEffect(() => {
    if (!currentVip) {
      navigate('/login');
      return;
    }

    // Load paper sizes
    if (paperSizes.length === 0) {
      // Mock data - in real app, this would come from API
      const mockPaperSizes: PaperSize[] = [
        { id: 1, name: 'A4', description: 'Standard A4 size (210 x 297 mm)', active: true, created_at: new Date().toISOString() },
        { id: 2, name: 'Letter', description: 'US Letter size (8.5 x 11 inches)', active: true, created_at: new Date().toISOString() },
        { id: 3, name: 'Legal/Folio', description: 'Legal size (8.5 x 14 inches)', active: true, created_at: new Date().toISOString() },
      ];
      setPaperSizes(mockPaperSizes);
    }
  }, [currentVip, navigate, paperSizes.length, setPaperSizes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else if (name === 'paper_sizes') {
      // Handle paper sizes separately
      return;
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePaperSizeChange = (sizeName: string) => {
    setFormData(prev => ({
      ...prev,
      paper_sizes: prev.paper_sizes.includes(sizeName)
        ? prev.paper_sizes.filter(size => size !== sizeName)
        : [...prev.paper_sizes, sizeName]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Files selected:', files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = validTypes.includes(fileExtension);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        alert(`File ${file.name} is not a supported format. Please upload PDF, DOC, DOCX, JPG, or PNG files.`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`File ${file.name} is too large. Please upload files smaller than 10MB.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...validFiles]
      }));
      console.log('Valid files added:', validFiles);
    }
    
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    console.log('Validating form with data:', formData);

    if (formData.paper_sizes.length === 0) {
      newErrors.paper_sizes = 'Please select at least one paper size';
    }

    if (formData.number_of_copies < 1) {
      newErrors.number_of_copies = 'Number of copies must be at least 1';
    }

    if (formData.delivery_type === 'delivery') {
      if (!formData.receiver_name?.trim()) {
        newErrors.receiver_name = 'Receiver name is required for delivery';
      }
      if (!formData.receiver_address?.trim()) {
        newErrors.receiver_address = 'Receiver address is required for delivery';
      }
      if (!formData.receiver_mobile?.trim()) {
        newErrors.receiver_mobile = 'Receiver mobile number is required for delivery';
      }
    }

    if (formData.delivery_type === 'pickup' && !formData.pickup_schedule) {
      newErrors.pickup_schedule = 'Pickup schedule is required';
    }

    if (formData.files.length === 0) {
      newErrors.files = 'Please upload at least one file';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Current VIP:', currentVip);
    
    if (!currentVip) {
      console.error('No current VIP found');
      alert('Please log in to create an order');
      return;
    }
    
    if (!validateForm()) {
      console.error('Form validation failed:', errors);
      return;
    }

    console.log('Form validation passed, creating order...');
    setIsSubmitting(true);

    try {
      // Create the order using the hook (now async)
      const newOrder = await createOrder(formData, currentVip);
      
      console.log('Order created successfully:', newOrder);
      
      // Set the generated order number for display
      setGeneratedOrderNumber(newOrder.job_order_number);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/profile');
  };

  if (!currentVip) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/profile" className="flex items-center space-x-3 text-gray-700 hover:text-primary transition-colors duration-300">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Profile</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {currentVip.full_name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern">
          <div className="card-header text-center">
            <div className="mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Create New Order</h1>
            <p className="text-gray-600 text-lg">
              Submit your print job with detailed specifications
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Type */}
            <div>
              <label htmlFor="delivery_type" className="form-label flex items-center">
                <Truck className="w-4 h-4 mr-2 text-gray-600" />
                Delivery Type *
              </label>
              <select
                id="delivery_type"
                name="delivery_type"
                value={formData.delivery_type}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {formData.delivery_type === 'pickup' && (
              <div>
                <label htmlFor="pickup_schedule" className="form-label flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                  Schedule Pickup *
                </label>
                <input
                  type="datetime-local"
                  id="pickup_schedule"
                  name="pickup_schedule"
                  value={formData.pickup_schedule || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  min={new Date().toISOString().slice(0, 16)}
                />
                {errors.pickup_schedule && <p className="form-error">{errors.pickup_schedule}</p>}
              </div>
            )}

            {formData.delivery_type === 'delivery' && (
              <>
                <div>
                  <label htmlFor="receiver_name" className="form-label flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-600" />
                    Receiver Name *
                  </label>
                  <input
                    type="text"
                    id="receiver_name"
                    name="receiver_name"
                    value={formData.receiver_name || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter receiver's full name"
                  />
                  {errors.receiver_name && <p className="form-error">{errors.receiver_name}</p>}
                </div>

                <div>
                  <label htmlFor="receiver_address" className="form-label">
                    Receiver Address *
                  </label>
                  <textarea
                    id="receiver_address"
                    name="receiver_address"
                    value={formData.receiver_address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-input"
                    placeholder="Enter complete delivery address"
                  />
                  {errors.receiver_address && <p className="form-error">{errors.receiver_address}</p>}
                </div>

                <div>
                  <label htmlFor="receiver_mobile" className="form-label">
                    Receiver Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="receiver_mobile"
                    name="receiver_mobile"
                    value={formData.receiver_mobile || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter receiver's mobile number"
                  />
                  {errors.receiver_mobile && <p className="form-error">{errors.receiver_mobile}</p>}
                </div>
              </>
            )}

            {/* Paper Sizes */}
            <div>
              <label className="form-label flex items-center">
                <Package className="w-4 h-4 mr-2 text-gray-600" />
                Paper Sizes *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paperSizes.map((size) => (
                  <label key={size.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.paper_sizes.includes(size.name)}
                      onChange={() => handlePaperSizeChange(size.name)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{size.name}</span>
                      {size.description && (
                        <p className="text-xs text-gray-500">{size.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {errors.paper_sizes && <p className="form-error">{errors.paper_sizes}</p>}
            </div>

            {/* Number of Copies */}
            <div>
              <label htmlFor="number_of_copies" className="form-label flex items-center">
                <Copy className="w-4 h-4 mr-2 text-gray-600" />
                Number of Copies *
              </label>
              <input
                type="number"
                id="number_of_copies"
                name="number_of_copies"
                value={formData.number_of_copies}
                onChange={handleInputChange}
                min="1"
                className="form-input"
              />
              {errors.number_of_copies && <p className="form-error">{errors.number_of_copies}</p>}
            </div>

            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="form-label">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions || ''}
                onChange={handleInputChange}
                rows={3}
                className="form-input"
                placeholder="E.g., Black and white, double-sided, binding required"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="form-label flex items-center">
                <Upload className="w-4 h-4 mr-2 text-gray-600" />
                Upload Files *
              </label>
              <FileUpload
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              
              {/* File List */}
              {formData.files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Uploaded Files ({formData.files.length}):
                  </h4>
                  <div className="space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* File Upload Validation Error */}
            {errors.files && (
              <p className="form-error text-center">{errors.files}</p>
            )}
            
            {/* General validation errors */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || formData.files.length === 0}
              onClick={() => console.log('Submit button clicked', { isSubmitting, filesLength: formData.files.length, formData })}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Order...
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5 mr-2" />
                  Submit Order
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Order Submitted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your Job Order Number is: <span className="font-bold text-blue-600">{generatedOrderNumber}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You will receive an email confirmation shortly. You can track your order status in your profile.
              </p>
              <button
                onClick={handleModalClose}
                className="btn-primary"
              >
                View Profile
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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onChange, accept = "*" }) => {
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
    console.log('Files dropped:', files);
    
    if (files.length > 0) {
      const fakeEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(fakeEvent);
    }
  };

  const handleClick = () => {
    console.log('File upload clicked');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div
      className={`file-upload ${isDragOver ? 'dragover' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        id="file-upload"
        onChange={onChange}
        accept={accept}
        multiple
        className="hidden"
      />
      <div className="text-center">
        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-600">Drag files here or click to upload</p>
        <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG up to 10MB each</p>
      </div>
    </div>
  );
};

export default JobOrderCreation;
