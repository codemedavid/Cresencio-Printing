import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  textColor?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '', textColor = 'text-gray-800' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden shadow-medium`}>
        <img 
          src="/logo.jpg" 
          alt="Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <div className={`logo font-bold ${textColor} ${textSizeClasses[size]}`}>
          Cresencio Printing
        </div>
      )}
    </div>
  );
};

export default Logo;
