import React from 'react';
import { Link } from 'react-router-dom';
import { useVip } from '../contexts/VipContext';
import Logo from './Logo';
import { Crown, Bell, Zap, Printer, FileText, Smartphone } from 'lucide-react';

const Homepage: React.FC = () => {
  const { isLoggedIn, currentVip } = useVip();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="decorative-circle decorative-circle-1"></div>
      <div className="decorative-circle decorative-circle-2"></div>
      <div className="decorative-circle decorative-circle-3"></div>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Logo size="md" showText={false} />
              <h1 className="text-2xl font-bold text-gray-800">Cresencio Printing</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="text-gray-700 hover:text-primary font-medium transition-colors duration-300">
                    Profile
                  </Link>
                  <Link to="/new-order" className="text-gray-700 hover:text-primary font-medium transition-colors duration-300">
                    New Order
                  </Link>
                  <Link to="/admin" className="text-gray-700 hover:text-primary font-medium transition-colors duration-300">
                    Admin
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="text-gray-700 hover:text-primary font-medium transition-colors duration-300">
                    Register
                  </Link>
                  <Link to="/login" className="text-gray-700 hover:text-primary font-medium transition-colors duration-300">
                    Login
                  </Link>
                </>
              )}
            </nav>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8 fade-in-up">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-3xl mb-8 shadow-2xl floating overflow-hidden">
                <img src="/logo.jpg" alt="Cresencio Printing Logo" className="w-full h-full object-cover rounded-3xl" />
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-8 leading-tight">
                Welcome to Cresencio Printing
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
                Experience premium printing services with our VIP portal. 
                <span className="text-primary font-bold"> Skip the line</span> and get 
                <span className="text-accent font-bold"> priority service</span> for all your printing needs.
              </p>
            </div>
            
            {isLoggedIn ? (
              <div className="space-y-6 fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="glass-card rounded-2xl p-6 max-w-md mx-auto">
                  <p className="text-lg text-gray-700 font-medium">
                    Welcome back, <span className="font-bold text-primary">{currentVip?.full_name}</span>!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 justify-center mobile-stack">
                  <Link to="/profile" className="btn-primary mobile-full hover-lift">
                    View Profile
                  </Link>
                  <Link to="/new-order" className="btn-secondary mobile-full hover-lift">
                    Create New Order
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 justify-center mobile-stack fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link to="/register" className="btn-primary mobile-full hover-lift">
                  Register Now
                </Link>
                <Link to="/login" className="btn-outline mobile-full hover-lift">
                  Login with VIP ID
                </Link>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-modern text-center group hover:scale-105 transition-all duration-500 hover-lift fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl w-28 h-28 flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500 floating">
                <div className="relative">
                  <Zap className="w-16 h-16 text-white" />
                  <Crown className="w-6 h-6 text-white absolute -top-1 -right-1" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Priority Service</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Skip the line with VIP status and get your orders processed first with our premium service.</p>
            </div>
            
            <div className="card-modern text-center group hover:scale-105 transition-all duration-500 hover-lift fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl w-28 h-28 flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500 floating" style={{ animationDelay: '1s' }}>
                <div className="relative">
                  <Printer className="w-16 h-16 text-white" />
                  <FileText className="w-6 h-6 text-white absolute -top-1 -right-1" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Easy Ordering</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Submit your print jobs online with drag-and-drop file uploads and detailed specifications.</p>
            </div>
            
            <div className="card-modern text-center group hover:scale-105 transition-all duration-500 hover-lift fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl w-28 h-28 flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500 floating" style={{ animationDelay: '2s' }}>
                <div className="relative">
                  <Smartphone className="w-16 h-16 text-white" />
                  <Bell className="w-6 h-6 text-white absolute -top-1 -right-1" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Smart Notifications</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Get real-time updates on your order status and pickup/delivery notifications via email.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mb-6">
              <Logo size="lg" textColor="text-white" />
            </div>
            <p className="text-white mb-4 text-lg font-bold">Cresencio Printing and Services</p>
            <p className="text-gray-400 mb-6">
              Email: cresencioprintingservices@gmail.com | Phone: (083)887-1606
            </p>
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-500 text-sm">
                © 2024 Cresencio Printing and Services. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
