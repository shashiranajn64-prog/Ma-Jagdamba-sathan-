import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SiteSettings, Notice, GalleryItem, NavratriDay } from '../types';
import { Ticker } from '../components/Ticker';
import { Heart, Calendar, Image as ImageIcon, Bell, MapPin, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface HomeProps {
  settings: SiteSettings;
  setCurrentTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ settings, setCurrentTab }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<GalleryItem[]>([]);
  const [navratriDays, setNavratriDays] = useState<NavratriDay[]>([]);

  useEffect(() => {
    const noticesQuery = query(collection(db, 'notices'), where('isActive', '==', true), orderBy('createdAt', 'desc'), limit(5));
    const unsubNotices = onSnapshot(noticesQuery, (snapshot) => {
      const list: Notice[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Notice));
      setNotices(list);
    });

    const galleryQuery = query(collection(db, 'gallery'), where('status', '==', 'Approved'), limit(6));
    const unsubGallery = onSnapshot(galleryQuery, (snapshot) => {
      const list: GalleryItem[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as GalleryItem));
      setGalleryPreviews(list);
    });

    const navratriQuery = query(collection(db, 'navratri'));
    const unsubNavratri = onSnapshot(navratriQuery, (snapshot) => {
      const list: NavratriDay[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as NavratriDay));
      list.sort((a, b) => a.dayNumber - b.dayNumber);
      setNavratriDays(list.slice(0, 3));
    });

    return () => {
      unsubNotices();
      unsubGallery();
      unsubNavratri();
    };
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-white overflow-hidden shadow-2xl border-b-4 border-amber-500">
        <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(${settings.heroImageUrl})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-red-950/40 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/50 px-4 py-1.5 rounded-full text-amber-200 text-sm font-semibold backdrop-blur-sm shadow-md animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>सिद्धपीठ माँ जगदम्बा स्थान, मथुरापुर, मुजफ्फरपुर, 843119</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-wide text-amber-100 drop-shadow-md">
            {settings.heroHeading || 'शक्तिपीठ माँ जगदंबा स्थान'}
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-amber-200/90 leading-relaxed font-sans">
            {settings.heroDescription}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => { setCurrentTab('donate'); window.scrollTo(0, 0); }}
              className="bg-amber-500 hover:bg-amber-600 text-red-950 font-bold px-8 py-3.5 rounded-xl shadow-xl flex items-center space-x-2 transform hover:scale-105 transition"
            >
              <Heart className="w-5 h-5 fill-red-950 text-amber-500" />
              <span>ऑनलाइन दान करें (Donate Now)</span>
            </button>
            <button
              onClick={() => { setCurrentTab('navratri'); window.scrollTo(0, 0); }}
              className="bg-red-900/80 hover:bg-red-800 text-amber-200 border-2 border-amber-500 font-semibold px-8 py-3.5 rounded-xl shadow-xl flex items-center space-x-2 backdrop-blur-sm transform hover:scale-105 transition"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>नवरात्रि 9 दिन विशेष</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Donation Scrolling Ticker */}
      <Ticker showDonorNames={settings.showDonorNamesPublicly} />

      {/* Important Notices Section */}
      {notices.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500/10 via-red-900/5 to-amber-500/10 border-2 border-amber-500/60 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-900 text-amber-300 rounded-lg shadow">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-red-950">महत्वपूर्ण सूचनाएँ (Notice Board)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notices.map((notice) => (
                <div key={notice.id} className="bg-white p-5 rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition space-y-2 relative overflow-hidden">
                  {notice.isPinned && (
                    <span className="absolute top-0 right-0 bg-red-900 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                      Pinned 📌
                    </span>
                  )}
                  <h3 className="font-bold text-red-900 text-base">{notice.title}</h3>
                  <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">{notice.content}</p>
                  <p className="text-xs text-stone-400 pt-2 border-t">दिनांक: {notice.publishDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Temple Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-6 sm:p-10">
          <div className="space-y-6">
            <div className="inline-block bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-sm font-bold">
              मंदिर परिचय (About Temple)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-red-950">
              माँ जगदंबा स्थान — आस्था एवं विश्वास का पावन केंद्र
            </h2>
            <p className="text-stone-700 leading-relaxed text-base">
              {settings.aboutText}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h4 className="font-bold text-red-900 text-lg">दैनिक आरती</h4>
                <p className="text-sm text-stone-600">प्रातः 05:30 & सायं 07:30</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h4 className="font-bold text-red-900 text-lg">अन्नदान सेवा</h4>
                <p className="text-sm text-stone-600">प्रतिदिन दोपहर 12 बजे से</p>
              </div>
            </div>
          </div>
          <div className="relative h-72 sm:h-96 rounded-xl overflow-hidden shadow-lg border-4 border-amber-200">
            <img
              src={settings.heroImageUrl}
              alt="Maa Jagdamba Sthan"
              className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
            />
          </div>
        </div>
      </div>

      {/* Navratri Preview */}
      {navratriDays.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-amber-800 font-bold text-sm tracking-wider uppercase">पवित्र अनुष्ठान</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-red-950">नवरात्रि – 9 दिन विशेष दर्शन</h2>
            </div>
            <button
              onClick={() => { setCurrentTab('navratri'); window.scrollTo(0, 0); }}
              className="text-red-900 font-bold text-sm flex items-center space-x-1 hover:text-red-950 transition"
            >
              <span>सभी 9 दिन देखें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {navratriDays.map((day) => (
              <div key={day.dayNumber} className="bg-white rounded-xl overflow-hidden shadow-lg border border-amber-200 flex flex-col justify-between">
                <div className="relative h-48 overflow-hidden">
                  <img src={day.imageUrl} alt={day.deviName} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-red-900 text-amber-300 font-bold px-3 py-1 rounded-full text-xs shadow">
                    दिन {day.dayNumber} — {day.date}
                  </div>
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-serif text-red-900">{day.deviName}</h3>
                    <p className="text-sm text-stone-600 line-clamp-2">{day.description}</p>
                  </div>
                  <button
                    onClick={() => { setCurrentTab('navratri'); window.scrollTo(0, 0); }}
                    className="w-full bg-amber-100 hover:bg-amber-200 text-red-950 font-semibold py-2 rounded-lg text-sm transition text-center"
                  >
                    पूजा विवरण देखें
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Preview */}
      {galleryPreviews.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-amber-800 font-bold text-sm tracking-wider uppercase">दिव्य झाँकी</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-red-950">मंदिर गैलरी (Gallery Preview)</h2>
            </div>
            <button
              onClick={() => { setCurrentTab('gallery'); window.scrollTo(0, 0); }}
              className="text-red-900 font-bold text-sm flex items-center space-x-1 hover:text-red-950 transition"
            >
              <span>संपूर्ण गैलरी देखें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryPreviews.map((item) => (
              <div key={item.id} className="relative h-40 rounded-xl overflow-hidden shadow-md group border-2 border-amber-200">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                  <p className="text-amber-100 text-xs font-medium truncate">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact & Location Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-50 rounded-2xl p-8 shadow-xl border-2 border-amber-500 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-serif text-amber-200">मंदिर में पधारें (Visit Us)</h3>
            <p className="text-amber-100/90 text-sm leading-relaxed">
              माँ जगदंबा के दर्शन हेतु प्रतिदिन हज़ारों श्रद्धालु आते हैं। मंदिर समिति सभी भक्तों का हार्दिक स्वागत करती है।
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{settings.contactNumber}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md border border-amber-400/30 text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto" />
            <h4 className="text-xl font-bold font-serif text-amber-200">सुरक्षित एवं पारदर्शी दान</h4>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              आपका हर एक रुपया मंदिर के जीर्णोद्धार, अन्नदान और धार्मिक आयोजनों में पूरी पारदर्शिता के साथ उपयोग किया जाता है।
            </p>
            <button
              onClick={() => { setCurrentTab('donate'); window.scrollTo(0, 0); }}
              className="bg-amber-500 hover:bg-amber-600 text-red-950 font-bold px-6 py-2.5 rounded-lg text-sm shadow transition"
            >
              दान रसीद प्राप्त करें
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
