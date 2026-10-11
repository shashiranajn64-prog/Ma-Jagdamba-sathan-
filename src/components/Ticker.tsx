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

  // Duplicate array so marquee loop has continuous seamless coverage without blank gaps
  const displayItems = donations.length < 5 
    ? [...donations, ...donations, ...donations, ...donations] 
    : [...donations, ...donations];

  return (
    <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-100 py-2 sm:py-3 px-2 sm:px-6 shadow-inner border-y-2 border-amber-500 overflow-hidden relative flex items-center">
      {/* Mobile-friendly Badge */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 px-2.5 sm:px-3 py-1 rounded-lg font-bold text-[11px] sm:text-xs uppercase tracking-wider shrink-0 z-20 shadow-md">
        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-950 fill-amber-300 animate-pulse shrink-0" />
        <span className="sm:hidden font-extrabold">नवीनतम दान:</span>
        <span className="hidden sm:inline">नवीनतम दान (Latest Donors):</span>
      </div>
      
      {/* Left & Right gradient edge fades */}
      <div className="pointer-events-none absolute left-24 sm:left-48 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-red-950 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-amber-950 to-transparent z-10" />

      {/* Marquee Scroller */}
      <div className="relative w-full overflow-hidden whitespace-nowrap ml-2 sm:ml-4 select-none touch-pan-x">
        <div className="inline-block animate-marquee space-x-3 sm:space-x-6 text-xs sm:text-sm font-medium hover:[animation-play-state:paused] active:[animation-play-state:paused] cursor-pointer">
          {displayItems.map((d, index) => {
            const displayName = showDonorNames ? `${d.donorName} जी` : 'सद्भावना भक्त';
            return (
              <span 
                key={`${d.id}-${index}`} 
                className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-red-900/80 hover:bg-red-800/90 transition px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full border border-amber-500/40 shadow-sm"
              >
                <span className="text-amber-200 font-bold truncate max-w-[120px] sm:max-w-none">{displayName}</span>
                <span className="text-amber-400/80 font-mono text-[10px] sm:text-xs">•</span>
                <span className="text-amber-300 font-extrabold bg-black/40 px-1.5 sm:px-2 py-0.5 rounded text-[11px] sm:text-xs">
                  ₹{d.amount.toLocaleString('en-IN')}
                </span>
                {d.purpose && (
                  <span className="hidden xs:inline text-[10px] sm:text-xs text-amber-100/70 bg-amber-950/60 px-1.5 py-0.5 rounded">
                    {d.purpose}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
