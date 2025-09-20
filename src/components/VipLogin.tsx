import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVip } from '../contexts/VipContext';
import { LoginForm } from '../types';
import Logo from './Logo';
import { User, LogIn, Info, ArrowRight } from 'lucide-react';

const VipLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentVip, setIsLoggedIn } = useVip();
  const [formData, setFormData] = useState<LoginForm>({
    unique_id: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ unique_id: value });
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.unique_id.trim()) {
      setError('VIP ID is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to validate VIP ID
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock VIP data - in real app, this would come from API
      const mockVipData = {
        id: 1,
        unique_id: formData.unique_id,
        full_name: 'John Doe',
        address: '123 Main St, City, State',
        email: 'john.doe@example.com',
        mobile_number: '+1234567890',
        customer_category: 'Regular Customer' as const,
        status: 'approved' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Accept any VIP ID that starts with VIP- and has at least 7 characters
      if (formData.unique_id.startsWith('VIP-') && formData.unique_id.length >= 7) {
        // Update the mock data to use the actual VIP ID entered
        const updatedVipData = {
          ...mockVipData,
          unique_id: formData.unique_id
        };
        
        // Set the VIP data in localStorage first
        localStorage.setItem('vipMember', JSON.stringify(updatedVipData));
        
        // Set the context state
        setCurrentVip(updatedVipData);
        setIsLoggedIn(true);
        
        // Navigate to profile
        navigate('/profile');
      } else {
        setError('Invalid VIP ID. Please check your ID and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background Elements */}
      <div className="decorative-circle decorative-circle-1"></div>
      <div className="decorative-circle decorative-circle-2"></div>
      <div className="decorative-circle decorative-circle-3"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="card-modern gradient-border">
          <div className="text-center mb-8 fade-in-up">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-3xl mb-6 shadow-2xl floating">
                <Logo size="md" showText={false} />
              </div>
              <Logo size="lg" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">VIP Login</h1>
            <p className="text-gray-600 text-lg font-medium">
              Enter your VIP ID to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="unique_id" className="form-label flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-600" />
                VIP ID
              </label>
              <input
                type="text"
                id="unique_id"
                name="unique_id"
                value={formData.unique_id}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter VIP-12345"
                autoComplete="off"
              />
              {error && <p className="form-error">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed hover-lift flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 font-medium">
              Don't have a VIP ID?{' '}
              <Link to="/register" className="text-primary hover:text-accent font-bold transition-colors duration-300 flex items-center justify-center">
                Register here
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </p>
          </div>

          {/* Demo VIP IDs */}
          <div className="mt-8 glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Demo VIP IDs:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>VIP-123456 (Regular Customer)</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>VIP-789012 (Student)</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>VIP-345678 (Senior Citizen)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipLogin;
