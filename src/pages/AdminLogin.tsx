import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { Shield, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (role: 'admin') => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    // Check requested direct admin credentials
    if ((cleanId === '9709168876' || cleanId === 'admin@maajagdambasthan.org' || cleanId === 'admin') && cleanPass === '2026') {
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess('admin');
      }, 500);
      return;
    }

    try {
      // Try Firebase auth if email format is provided
      if (cleanId.includes('@')) {
        await signInWithEmailAndPassword(auth, cleanId, cleanPass);
        onLoginSuccess('admin');
        return;
      }

      setError('अमान्य एडमिन आईडी या पासवर्ड। कृपया सही क्रेडेंशियल दर्ज करें।');
      setLoading(false);
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('लॉगिन असफल। कृपया सही आईडी एवं पासवर्ड दर्ज करें।');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-amber-500 p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-red-900 text-amber-300 rounded-full flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-red-950">एडमिन लॉगिन (Admin Login)</h2>
          <p className="text-xs text-stone-500">माँ जगदंबा स्थान प्रबंधन पैनल</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-500 text-red-900 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700 uppercase">एडमिन आईडी / मोबाइल नंबर *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-5 h-5 text-stone-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="अपनी आईडी या मोबाइल नंबर दर्ज करें"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-800 text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700 uppercase">पासवर्ड (Password) *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड दर्ज करें"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-800 text-sm font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-900 hover:bg-red-950 text-amber-200 font-bold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition text-base disabled:opacity-50"
          >
            {loading ? <span>लॉगिन हो रहा है...</span> : (
              <>
                <span>लॉगिन करें (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-500">अधिकृत ट्रस्ट प्रशासक के लिए सुरक्षित पोर्टल</p>
        </div>

      </div>
    </div>
  );
};
