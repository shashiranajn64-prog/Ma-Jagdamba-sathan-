import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Donation } from '../types';
import { Heart, Sparkles } from 'lucide-react';

interface TickerProps {
  showDonorNames: boolean;
}

export const Ticker: React.FC<TickerProps> = ({ showDonorNames }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'donations'),
        where('status', '==', 'Approved'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Donation[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Donation);
        });
        setDonations(list);
        setLoading(false);
      }, (error) => {
        console.warn('Ticker snapshot error:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Ticker initialization error:', err);
      setLoading(false);
    }
  }, []);

  if (loading || donations.length === 0) {
    return null; // Keep it completely empty if donation list is empty
  }

  return (
    <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-100 py-3 px-2 sm:px-6 shadow-inner border-y-2 border-amber-500 overflow-hidden relative flex items-center">
      <div className="flex items-center space-x-2 bg-amber-600 text-amber-950 px-3 py-1 rounded font-bold text-xs sm:text-sm uppercase tracking-wider shrink-0 z-10 shadow">
        <Heart className="w-4 h-4 text-red-950 fill-amber-300 animate-pulse" />
        <span>नवीनतम दान (Latest Donors):</span>
      </div>
      
      <div className="relative w-full overflow-hidden whitespace-nowrap ml-4">
        <div className="inline-block animate-marquee space-x-8 text-sm sm:text-base font-medium">
          {donations.map((d) => {
            const displayName = showDonorNames ? `${d.donorName} जी` : 'सद्भावना भक्त';
            return (
              <span key={d.id} className="inline-flex items-center space-x-2 bg-red-900/60 px-4 py-1 rounded-full border border-amber-500/40 shadow-sm">
                <span className="text-amber-300 font-semibold">{displayName}</span>
                <span className="text-amber-200/70">—</span>
                <span className="text-amber-400 font-bold">₹{d.amount.toLocaleString('en-IN')}</span>
                <span className="text-xs text-amber-200/80 bg-black/30 px-2 py-0.5 rounded">({d.purpose || 'General'})</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
