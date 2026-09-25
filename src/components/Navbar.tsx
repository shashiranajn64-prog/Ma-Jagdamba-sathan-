import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { Menu, X, Heart, Shield, UserCheck, Home, Calendar, Image as ImageIcon } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  settings: SiteSettings;
  userRole: 'admin' | 'staff' | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, settings, userRole }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'होम (Home)', icon: Home },
    { id: 'gallery', label: 'गैलरी (Gallery)', icon: ImageIcon },
    { id: 'donate', label: 'दान करें (Donate)', icon: Heart },
    { id: 'navratri', label: 'नवरात्रि – 9 दिन', icon: Calendar },
    { id: 'admin-login', label: userRole === 'admin' ? 'एडमिन डैशबोर्ड' : 'एडमिन लॉगिन', icon: Shield },
    { id: 'staff-login', label: userRole === 'staff' ? 'स्टाफ डैशबोर्ड' : 'स्टाफ लॉगिन', icon: UserCheck },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'admin-login' && userRole === 'admin') {
      setCurrentTab('admin-dashboard');
    } else if (id === 'staff-login' && userRole === 'staff') {
      setCurrentTab('staff-dashboard');
    } else {
      setCurrentTab(id);
    }
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-100 shadow-xl border-b-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Temple Brand Identity */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500 text-red-950 flex items-center justify-center font-serif text-2xl font-bold shadow-md border-2 border-amber-200 group-hover:scale-105 transition">
            ॐ
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-wide text-amber-100 group-hover:text-amber-200 transition">
              {settings.templeName || 'मां जगदंबा स्थान'}
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-300/90 font-medium">मथुरापुर, मुजफ्फरपुर, 843119 • सिद्धपीठ</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'admin-login' && currentTab === 'admin-dashboard') || (item.id === 'staff-login' && currentTab === 'staff-dashboard');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-red-950 shadow-md font-bold'
                    : 'text-amber-100 hover:bg-red-900/60 hover:text-amber-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-amber-200 hover:bg-red-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-red-950 border-t border-amber-500/40 px-4 pt-3 pb-6 space-y-2 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'admin-login' && currentTab === 'admin-dashboard') || (item.id === 'staff-login' && currentTab === 'staff-dashboard');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold flex items-center space-x-3 transition ${
                  isActive
                    ? 'bg-amber-500 text-red-950 font-bold'
                    : 'text-amber-100 hover:bg-red-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
