import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';
import { SiteSettings } from './types';
import { initializeDatabaseDefaults, defaultSiteSettings } from './utils/seedData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Donate } from './pages/Donate';
import { Gallery } from './pages/Gallery';
import { Navratri } from './pages/Navratri';
import { AdminLogin } from './pages/AdminLogin';
import { StaffLogin } from './pages/StaffLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null);
  const [staffData, setStaffData] = useState<any>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    initializeDatabaseDefaults();

    // Load local settings first for instant publishing update persistence
    const localSettings = localStorage.getItem('siteSettings');
    if (localSettings) {
      try {
        setSettings(JSON.parse(localSettings));
      } catch (e) {}
    }

    const unsubscribe = onSnapshot(doc(db, 'siteSettings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setSettings(data);
        localStorage.setItem('siteSettings', JSON.stringify(data));
      }
      setLoading(false);
    }, (error) => {
      console.warn('Settings snapshot offline/error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center font-serif text-3xl font-bold text-red-950 mx-auto animate-pulse">
            ॐ
          </div>
          <p className="font-serif text-lg text-red-950 font-bold">माँ जगदंबा स्थान पोर्टल लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-stone-900 font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        settings={settings}
        userRole={userRole}
      />

      <main className="flex-1">
        {currentTab === 'home' && <Home settings={settings} setCurrentTab={setCurrentTab} />}
        {currentTab === 'donate' && <Donate settings={settings} />}
        {currentTab === 'gallery' && <Gallery />}
        {currentTab === 'navratri' && <Navratri />}
        
        {currentTab === 'admin-login' && (
          userRole === 'admin' ? (
            <AdminDashboard onLogout={() => setUserRole(null)} settings={settings} />
          ) : (
            <AdminLogin onLoginSuccess={(role) => { setUserRole(role); setCurrentTab('admin-dashboard'); }} />
          )
        )}
        {currentTab === 'admin-dashboard' && (
          <AdminDashboard onLogout={() => { setUserRole(null); setCurrentTab('home'); }} settings={settings} />
        )}

        {currentTab === 'staff-login' && (
          userRole === 'staff' ? (
            <StaffDashboard staffData={staffData} onLogout={() => setUserRole(null)} />
          ) : (
            <StaffLogin onLoginSuccess={(role, data) => { setUserRole(role); setStaffData(data); setCurrentTab('staff-dashboard'); }} />
          )
        )}
        {currentTab === 'staff-dashboard' && staffData && (
          <StaffDashboard staffData={staffData} onLogout={() => { setUserRole(null); setStaffData(null); setCurrentTab('home'); }} />
        )}
      </main>

      <Footer settings={settings} setCurrentTab={setCurrentTab} />
    </div>
  );
}
