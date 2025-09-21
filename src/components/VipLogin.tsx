import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVip } from '../contexts/VipContext';
import { useVipRegistrations } from '../hooks/useVipRegistrations';
import { VipAuthService } from '../services/vipAuth';
import { LoginForm } from '../types';
import Logo from './Logo';
import { User, LogIn, Info, ArrowRight } from 'lucide-react';

const VipLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentVip, setIsLoggedIn } = useVip();
  const { registrations, getRegistrationByVipId } = useVipRegistrations();
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
      // Authenticate user using Supabase
      const authResult = await VipAuthService.authenticateUser({
        unique_id: formData.unique_id,
        password: undefined // For now, we're using ID-only authentication
      });
      
      if (authResult.success && authResult.user) {
        // Set the VIP data in localStorage first
        localStorage.setItem('vipMember', JSON.stringify(authResult.user));
        
        // Set the context state
        setCurrentVip(authResult.user);
        setIsLoggedIn(true);
        
        // Navigate to profile
        navigate('/profile');
      } else {
        // Check if user exists but is not approved
        const userExists = await getRegistrationByVipId(formData.unique_id);
        
        if (userExists) {
          if (userExists.status === 'pending') {
            setError('Your VIP registration is still pending approval. Please wait for admin approval.');
          } else if (userExists.status === 'rejected') {
            setError('Your VIP registration has been rejected. Please contact support for assistance.');
          } else {
            setError('Your VIP account status is invalid. Please contact support.');
          }
        } else {
          setError(authResult.error || 'Invalid VIP ID. Please check your ID and try again, or register for a new account.');
        }
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
            <button 
              onClick={() => navigate('/register')}
              className="btn-secondary hover-lift flex items-center justify-center mx-auto"
              type="button"
            >
              Register
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          {/* Available VIP IDs */}
          {registrations.length > 0 && (
            <div className="mt-8 glass-card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Available VIP IDs:
              </h3>
              <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                {registrations.slice(0, 5).map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        reg.status === 'approved' ? 'bg-green-500' :
                        reg.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span>{reg.unique_id} ({reg.customer_category})</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                      reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Only approved accounts can login. Register for a new VIP ID if you don't have one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VipLogin;
