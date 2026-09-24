import React from 'react';
import { SiteSettings } from '../types';
import { MapPin, Phone, Mail, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setCurrentTab }) => {
  return (
    <footer className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-100 border-t-4 border-amber-500 pt-16 pb-12 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-red-950 flex items-center justify-center font-serif text-2xl font-bold shadow">
              ॐ
            </div>
            <h3 className="text-2xl font-bold font-serif text-amber-100">{settings.templeName}</h3>
          </div>
          <p className="text-amber-200/80 text-sm leading-relaxed">
            {settings.heroDescription}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold font-serif text-amber-300 border-b border-amber-500/40 pb-2">त्वरित लिंक्स (Quick Links)</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button onClick={() => { setCurrentTab('home'); window.scrollTo(0, 0); }} className="hover:text-amber-300 transition">
                होम (Home)
              </button>
            </li>
            <li>
              <button onClick={() => { setCurrentTab('gallery'); window.scrollTo(0, 0); }} className="hover:text-amber-300 transition">
                गैलरी दर्शन (Gallery)
              </button>
            </li>
            <li>
              <button onClick={() => { setCurrentTab('donate'); window.scrollTo(0, 0); }} className="hover:text-amber-300 transition">
                ऑनलाइन दान (Online Donate)
              </button>
            </li>
            <li>
              <button onClick={() => { setCurrentTab('navratri'); window.scrollTo(0, 0); }} className="hover:text-amber-300 transition">
                नवरात्रि 9 दिन विशेष (Navratri)
              </button>
            </li>
            <li>
              <button onClick={() => { setCurrentTab('admin-login'); window.scrollTo(0, 0); }} className="hover:text-amber-300 transition">
                एडमिन लॉगिन (Admin Login)
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold font-serif text-amber-300 border-b border-amber-500/40 pb-2">संपर्क एवं स्थान (Contact Us)</h4>
          <div className="space-y-3 text-sm text-amber-200/90">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{settings.contactNumber}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{settings.email}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-amber-500/30 text-center text-xs text-amber-300/70">
        <p>{settings.footerText}</p>
      </div>
    </footer>
  );
};
