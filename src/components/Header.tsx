import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  const { categories } = useCategories();

  const handleCategoryClick = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const headerHeight = 80; // Header height
      const offset = headerHeight + 20; // Extra padding
      const elementPosition = element.offsetTop - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black-900/90 backdrop-blur-md border-b border-brown-200/20 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={onMenuClick}
            className="flex items-center space-x-4 text-white hover:text-brown-200 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-brown-600 to-brown-800 rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-glow transition-all duration-300">
              <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-2xl" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-noto font-bold text-white tracking-wide">Cresencio Printing</h1>
              <p className="text-xs text-brown-300 font-medium tracking-wider">PRINTING EXCELLENCE</p>
            </div>
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            {categories.slice(0, 4).map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="text-brown-200 hover:text-white transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105"
              >
                {category.name.toUpperCase()}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={onCartClick}
              className="relative p-3 text-brown-200 hover:text-white hover:bg-brown-800/50 rounded-2xl transition-all duration-300 group"
            >
              <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-bounce-gentle font-bold shadow-glow">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;