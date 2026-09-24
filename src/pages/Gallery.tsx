import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GalleryItem } from '../types';
import { Image as ImageIcon, X } from 'lucide-react';

export const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Temple', 'Navratri', 'Durga Puja', 'Events', 'Bhajan/Kirtan', 'Community Service', 'Other'];

  useEffect(() => {
    const q = query(
      collection(db, 'gallery'),
      where('status', '==', 'Approved')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: GalleryItem[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as GalleryItem);
      });
      setItems(list);
      setLoading(false);
    }, (error) => {
      console.error('Gallery snapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
          <ImageIcon className="w-4 h-4 text-red-900" />
          <span>दिव्य दर्शन झाँकी</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-red-950">माँ जगदंबा स्थान गैलरी</h1>
        <p className="max-w-2xl mx-auto text-stone-600 text-sm sm:text-base">
          मंदिर के पावन प्रांगण, विभिन्न उत्सवों, नवरात्रि और अनुष्ठानों की सुंदर तस्वीरें।
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
              selectedCategory === cat
                ? 'bg-red-900 text-amber-200 shadow-md font-bold border border-amber-400'
                : 'bg-white text-stone-700 hover:bg-amber-100 border border-stone-200'
            }`}
          >
            {cat === 'All' ? 'सभी (All)' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-500 font-medium">गैलरी लोड हो रही है...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-amber-200 shadow-sm space-y-3">
          <ImageIcon className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-stone-600 font-medium">इस श्रेणी में अभी कोई तस्वीर उपलब्ध नहीं है।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-amber-200 group cursor-pointer hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden bg-stone-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                  <div className="text-amber-100 space-y-1">
                    <span className="text-[10px] bg-amber-600 text-red-950 font-bold px-2 py-0.5 rounded uppercase">
                      {item.category}
                    </span>
                    <p className="font-bold text-sm truncate">{item.title}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-1 bg-gradient-to-b from-white to-amber-50/40">
                <h3 className="font-bold text-red-950 text-base truncate">{item.title}</h3>
                {item.caption && <p className="text-xs text-stone-600 line-clamp-1">{item.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border-4 border-amber-500 relative">
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 bg-red-950 text-amber-200 p-2 rounded-full hover:bg-red-900 transition shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-h-[70vh] bg-black flex items-center justify-center">
              <img src={activeImage.imageUrl} alt={activeImage.title} className="max-h-[70vh] max-w-full object-contain" />
            </div>
            <div className="p-6 bg-white space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded">
                  {activeImage.category}
                </span>
                {activeImage.eventDate && <span className="text-xs text-stone-500">दिनांक: {activeImage.eventDate}</span>}
              </div>
              <h3 className="text-2xl font-bold font-serif text-red-950">{activeImage.title}</h3>
              {activeImage.caption && <p className="text-stone-700 text-sm">{activeImage.caption}</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
