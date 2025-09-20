import React, { createContext, useContext, useState, useEffect } from 'react';
import { VipMember, PaperSize } from '../types';

interface VipContextType {
  currentVip: VipMember | null;
  setCurrentVip: (vip: VipMember | null) => void;
  paperSizes: PaperSize[];
  setPaperSizes: (sizes: PaperSize[]) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  logout: () => void;
}

const VipContext = createContext<VipContextType | undefined>(undefined);

export const useVip = () => {
  const context = useContext(VipContext);
  if (context === undefined) {
    throw new Error('useVip must be used within a VipProvider');
  }
  return context;
};

export const VipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVip, setCurrentVip] = useState<VipMember | null>(null);
  const [paperSizes, setPaperSizes] = useState<PaperSize[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for stored VIP data on app load
    const storedVip = localStorage.getItem('vipMember');
    
    if (storedVip) {
      try {
        const vipData = JSON.parse(storedVip);
        setCurrentVip(vipData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored VIP data:', error);
        localStorage.removeItem('vipMember');
      }
    }
  }, []);

  const logout = () => {
    setCurrentVip(null);
    setIsLoggedIn(false);
    localStorage.removeItem('vipMember');
  };

  const value: VipContextType = {
    currentVip,
    setCurrentVip,
    paperSizes,
    setPaperSizes,
    isLoggedIn,
    setIsLoggedIn,
    logout,
  };

  return <VipContext.Provider value={value}>{children}</VipContext.Provider>;
};
