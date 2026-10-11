import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { NavratriDay } from '../types';
import { defaultNavratriDays } from '../utils/seedData';
import { NavratriEditModal } from '../components/NavratriEditModal';
import { 
  Sparkles, Clock, Gift, Award, BookOpen, Volume2, VolumeX, Scroll, Flame, 
  Edit, RefreshCw, CheckCircle, Shield, ChevronRight 
} from 'lucide-react';

export const Navratri: React.FC = () => {
  const [days, setDays] = useState<NavratriDay[]>(() => {
    try {
      const cached = localStorage.getItem('navratri_days_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultNavratriDays;
  });
  const [loading, setLoading] = useState(false);
  const [speakingDay, setSpeakingDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | number>('all');
  const [editingDay, setEditingDay] = useState<NavratriDay | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'navratri'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        const cached = localStorage.getItem('navratri_days_cache');
        if (cached) {
          try {
            setDays(JSON.parse(cached));
            setLoading(false);
            return;
          } catch (e) {}
        }
        setDays(defaultNavratriDays);
        setLoading(false);
        return;
      }

      const list: NavratriDay[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as NavratriDay;
        list.push({
          ...data,
          dayNumber: Number(data.dayNumber) || 1
        });
      });
      list.sort((a, b) => a.dayNumber - b.dayNumber);

      // Prioritize Firestore entries for all days without overriding any saved values
      const finalDays: NavratriDay[] = [];
      for (let i = 1; i <= 9; i++) {
        const found = list.find((d) => d.dayNumber === i);
        if (found) {
          finalDays.push(found);
        } else {
          const def = defaultNavratriDays.find((d) => d.dayNumber === i);
          if (def) finalDays.push(def);
        }
      }

      const extraDays = list.filter((d) => d.dayNumber > 9);
      const allDays = [...finalDays, ...extraDays];

      setDays(allDays);
      try {
        localStorage.setItem('navratri_days_cache', JSON.stringify(allDays));
      } catch (e) {}
      setLoading(false);
    }, (error) => {
      console.warn('Navratri snapshot error, using cached or default days:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSyncAllDefaults = async () => {
    if (!confirm('चेतावनी: क्या आप सभी 9 दिनों को मूल डिफ़ॉल्ट डेटा में रीसेट करना चाहते हैं? आपके द्वारा किए गए सभी कस्टम बदलाव रीसेट हो जाएंगे।')) {
      return;
    }
    setSyncing(true);
    try {
      for (const day of defaultNavratriDays) {
        await setDoc(doc(db, 'navratri', `day_${day.dayNumber}`), day);
      }
      try {
        localStorage.setItem('navratri_days_cache', JSON.stringify(defaultNavratriDays));
      } catch (e) {}
      setDays(defaultNavratriDays);
      setSyncMessage('सभी 9 दिन सफलतापूर्वक मूल डिफ़ॉल्ट में रीसेट हो गए हैं!');
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (e) {
      console.error('Sync error:', e);
      alert('रीसेट करने में त्रुटि हुई।');
    } finally {
      setSyncing(false);
    }
  };

  const handleSpeak = (day: NavratriDay) => {
    if (!('speechSynthesis' in window)) {
      alert('आपका ब्राउज़र स्पीच सिंथेसिस (AI Voice) का समर्थन नहीं करता है।');
      return;
    }

    const synth = window.speechSynthesis;

    if (speakingDay === day.dayNumber) {
      synth.cancel();
      setSpeakingDay(null);
      return;
    }

    synth.cancel();

    const textToSpeak = `नवरात्रि का ${day.date}। देवी ${day.deviName}। ${day.description} ${day.katha || ''} मंत्र है: ${day.mantra || ''}। पूजा विधि: ${day.pujanVidhi || ''}। भोग प्रसाद है: ${day.bhogPrasad}।`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;

    utterance.onend = () => {
      setSpeakingDay(null);
    };

    utterance.onerror = () => {
      setSpeakingDay(null);
    };

    setSpeakingDay(day.dayNumber);
    synth.speak(utterance);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      
      {/* Top Header */}
      <div className="text-center space-y-4 bg-gradient-to-r from-[#4a0000] via-red-900 to-[#4a0000] text-amber-50 p-6 sm:p-10 rounded-3xl shadow-2xl border-2 border-[#ff7a00] relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 bg-[#ff7a00] text-red-950 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow">
          <Sparkles className="w-4 h-4 fill-red-950" />
          <span>पवित्र चैत्र एवं शारदीय नवरात्रि</span>
        </div>
        
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-serif text-amber-200">
          नवरात्रि – 9 दिन विशेष कथा, मंत्र एवं पूजा विधान
        </h1>
        
        <p className="max-w-3xl mx-auto text-amber-100/90 text-xs sm:text-base leading-relaxed">
          माता दुर्गा के नौ पावन स्वरूपों की कथाएँ, सिद्ध मंत्र, स्टेप-बाय-स्टेप पूजा विधि और AI वॉइस श्रवण। 
          आप किसी भी दिन का विवरण और तस्वीर कभी भी संपादित (Edit) कर सकते हैं।
        </p>

        {/* Sync / Management Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSyncAllDefaults}
            disabled={syncing}
            className="inline-flex items-center space-x-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'रीसेट हो रहा है...' : 'मूल डिफ़ॉल्ट में रीसेट करें (Reset Defaults)'}</span>
          </button>
        </div>

        {syncMessage && (
          <div className="mt-2 inline-block bg-emerald-600/90 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
            {syncMessage}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow ${
            activeTab === 'all'
              ? 'bg-[#4a0000] text-amber-200 border-2 border-[#ff7a00]'
              : 'bg-white text-stone-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          सभी 9 रूप (All Days)
        </button>
        {days.map((d) => (
          <button
            key={d.dayNumber}
            onClick={() => setActiveTab(d.dayNumber)}
            className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow ${
              activeTab === d.dayNumber
                ? 'bg-[#ff7a00] text-red-950 border-2 border-[#4a0000]'
                : 'bg-white text-stone-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            दिन {d.dayNumber}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-500 font-medium text-lg">नवरात्रि विवरण लोड हो रहा है...</div>
      ) : (
        <div className="space-y-10 sm:space-y-12">
          {days
            .filter((d) => activeTab === 'all' || d.dayNumber === activeTab)
            .map((day) => (
              <div
                key={day.dayNumber}
                className="bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch"
              >
                {/* Left Image & Quick Info */}
                <div className="lg:col-span-5 relative min-h-[320px] sm:min-h-[380px] lg:min-h-full bg-stone-900">
                  <img
                    src={day.imageUrl}
                    alt={day.deviName}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback image if broken
                      (e.target as HTMLImageElement).src = defaultNavratriDays[day.dayNumber - 1]?.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay gradient and action buttons */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 flex flex-col justify-between p-5 sm:p-6 text-white">
                    <div className="flex justify-between items-start gap-2">
                      <span className="bg-[#4a0000] text-amber-300 font-bold px-3.5 py-1.5 rounded-full text-xs sm:text-sm shadow-md border border-[#ff7a00]">
                        दिन {day.dayNumber} — {day.date}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingDay(day)}
                          className="bg-amber-500 hover:bg-amber-600 text-red-950 font-bold px-3 py-1.5 rounded-full text-xs shadow-lg flex items-center space-x-1 transition transform active:scale-95"
                          title="संपादित करें (Edit)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>एडिट</span>
                        </button>

                        {/* Audio Speak Button */}
                        <button
                          type="button"
                          onClick={() => handleSpeak(day)}
                          className={`p-2 sm:px-3 sm:py-1.5 rounded-full shadow-lg transition flex items-center space-x-1 text-xs font-bold ${
                            speakingDay === day.dayNumber
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : 'bg-red-900/90 hover:bg-red-800 text-amber-200 border border-amber-400'
                          }`}
                          title="AI Voice (ऑडियो सुनें)"
                        >
                          {speakingDay === day.dayNumber ? (
                            <>
                              <VolumeX className="w-4 h-4" />
                              <span className="hidden sm:inline">रोकें</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              <span className="hidden sm:inline">कथा सुनें</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="inline-block bg-amber-500/30 text-amber-200 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
                        नवदुर्गा स्वरूप #{day.dayNumber}
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-bold font-serif text-amber-200 drop-shadow">
                        {day.deviName}
                      </h2>
                      <p className="text-xs text-amber-100/90 font-medium">
                        सिद्धपीठ माँ जगदम्बा स्थान, मथुरापुर
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Content: Description, Katha, Mantra, Puja Vidhi */}
                <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-white">
                  <div className="space-y-4">
                    
                    {/* Header bar on card with Edit quick-link */}
                    <div className="flex justify-between items-center border-b border-amber-200/80 pb-3">
                      <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        {day.date}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingDay(day)}
                        className="text-xs text-amber-800 hover:text-red-900 font-bold flex items-center space-x-1 underline decoration-amber-400"
                      >
                        <Edit className="w-3 h-3" />
                        <span>विवरण / फोटो बदलें (Edit)</span>
                      </button>
                    </div>

                    <p className="text-stone-700 leading-relaxed text-sm sm:text-base font-medium">
                      {day.description}
                    </p>

                    {/* Mantra Box */}
                    {day.mantra && (
                      <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-400/70 space-y-1 shadow-inner">
                        <div className="flex items-center space-x-2 text-red-950 font-bold text-xs sm:text-sm">
                          <Flame className="w-4 h-4 text-[#ff7a00]" />
                          <span>सिद्ध मंत्र (Mantra)</span>
                        </div>
                        <p className="font-serif italic text-red-900 text-sm sm:text-base font-bold">
                          "{day.mantra}"
                        </p>
                      </div>
                    )}

                    {/* Pauranik Katha */}
                    {day.katha && (
                      <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex items-center space-x-2 text-[#4a0000] font-bold text-sm sm:text-base">
                          <Scroll className="w-4 h-4 text-[#ff7a00]" />
                          <span>पौराणिक कथा (Mythological Katha)</span>
                        </div>
                        <p className="text-stone-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                          {day.katha}
                        </p>
                      </div>
                    )}

                    {/* Pujan Vidhi */}
                    {day.pujanVidhi && (
                      <div className="bg-red-950 text-amber-50 p-4 sm:p-5 rounded-2xl space-y-2 shadow">
                        <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm sm:text-base">
                          <BookOpen className="w-4 h-4 text-[#ff7a00]" />
                          <span>विशेष पूजन विधि (Step-by-Step Puja Vidhi)</span>
                        </div>
                        <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                          {day.pujanVidhi}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Grid for Timing, Bhog, Special Program */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-amber-100">
                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 space-y-1">
                      <div className="flex items-center space-x-1.5 text-red-900 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>पूजा समय</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-tight">{day.timing}</p>
                    </div>

                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 space-y-1">
                      <div className="flex items-center space-x-1.5 text-red-900 font-bold text-xs">
                        <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>भोग प्रसाद</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-tight">{day.bhogPrasad}</p>
                    </div>

                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 space-y-1">
                      <div className="flex items-center space-x-1.5 text-red-900 font-bold text-xs">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>विशेष कार्यक्रम</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-tight">{day.specialProgram}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingDay && (
        <NavratriEditModal
          day={editingDay}
          onClose={() => setEditingDay(null)}
          onSaveSuccess={(updated) => {
            setDays((prev) => {
              const next = prev.map((d) => d.dayNumber === updated.dayNumber ? updated : d);
              try {
                localStorage.setItem('navratri_days_cache', JSON.stringify(next));
              } catch (e) {}
              return next;
            });
          }}
        />
      )}

    </div>
  );
};

// Helper functions for default kathas, mantras, and pujan vidhi
function getDefaultKatha(dayNumber: number, name: string): string {
  switch (dayNumber) {
    case 1:
      return 'पूर्वजन्म में ये दक्ष प्रजापति की पुत्री थीं, तब इनका नाम सती था। इनका विवाह भगवान शिव से हुआ था। एक बार दक्ष ने महायज्ञ किया जिसमें शिवजी को आमंत्रित नहीं किया। सती के जाने पर उनका अपमान हुआ जिससे व्यथित होकर सती ने योगाग्नि द्वारा अपने शरीर को भस्म कर दिया। अगले जन्म में इन्होंने हिमालय राज के घर जन्म लिया और शैलपुत्री कहलाईं।';
    case 2:
      return 'माँ ब्रह्मचारिणी का यह रूप तपस्या का प्रतीक है। पूर्वजन्म में हिमालय की पुत्री के रूप में इन्होंने देवर्षि नारद के उपदेश से भगवान शिव को पति के रूप में पाने के लिए अत्यंत कठिन तपस्या की थी। सहस्रों वर्षों तक इन्होंने केवल कंदमूल-फल और फिर सूखे पतों को खाकर तप किया, जिससे इनका नाम ब्रह्मचारिणी पड़ा।';
    case 3:
      return 'माँ चंद्रघंटा के मस्तक पर घंटे के आकार का अर्धचंद्र सुशोभित है। पौराणिक कथाओं के अनुसार, असुरों और देवताओं के भीषण युद्ध के समय माँ ने दैत्यराज महिषासुर का वध करने के लिए इस दिव्य रूप को धारण किया था। इनके गले में सफेद फूलों की माला और घंटे की भयंकर ध्वनि से राक्षस थर्रा उठते हैं।';
    case 4:
      return 'जब सृष्टि का अस्तित्व नहीं था, चारों तरफ अंधकार था, तब माँ कूष्मांड ने अपनी हल्की सी मंद मुस्कान से ब्रह्मांड की रचना की थी। इन्हें अण्ड यानी ब्रह्मांड की जननी माना जाता है। इनकी इसी शक्ति से सूर्य देव को ऊर्जा प्राप्त होती है।';
    case 5:
      return 'भगवान स्कंद (कार्तिकेय) की माता होने के कारण इन्हें स्कंदमाता कहा जाता है। स्कंद जी देवताओं की सेना के सेनापति हैं। माँ अपने इस रूप में अपने पुत्र स्कंद को अपनी गोद में बिठाए हुए हैं। इनकी उपासना से साधक को अलौकिक ज्ञान और मोक्ष की प्राप्ति होती है।';
    case 6:
      return 'महर्षि कात्यायन ने माँ भगवती की कठोर तपस्या की थी, जिससे प्रसन्न होकर आदिशक्ति ने उनकी पुत्री के रूप में जन्म लिया था। माँ कात्यायनी ने महिषासुर का वध करके देवताओं को भयमुक्त किया था। इनकी कृपा से विवाह में आने वाली बाधाएँ दूर होती हैं।';
    case 7:
      return 'माँ कालरात्रि दुष्टों का संहार करने वाली महाशक्ति हैं। इनका रूप अत्यंत भयंकर है, वर्ण अंधकार की भांति काला है और बाल बिखरे हुए हैं। रक्तबीज और शुंभ-निशुंभ के वध के समय माँ ने यह विकराल रूप धारण किया था। ये अपने भक्तों को हमेशा शुभ फल देती हैं, इसलिए इन्हें \'शुभंकरी\' भी कहते हैं।';
    case 8:
      return 'कठोर तपस्या के कारण माँ गौरी का वर्ण काला पड़ गया था, तब भगवान शिव ने गंगाजल से उनका अभिषेक किया जिससे वे अत्यंत गौर वर्ण की हो गईं और महागौरी कहलाईं। इनकी कृपा से असंभव कार्य भी संभव हो जाते हैं।';
    case 9:
      return 'माँ सिद्धिदात्री सभी प्रकार की अणिमा, महिमा, गरिमा, लघिमा, प्राप्ति, प्राकाम्य, ईशित्व और वशित्व—इन आठ सिद्धियों को प्रदान करने वाली हैं। भगवान शिव ने भी इनकी कृपा से ही ये सभी सिद्धियाँ प्राप्त की थीं।';
    default:
      return 'माँ भगवती दुर्गा का यह पावन स्वरूप भक्तों के समस्त कष्टों का निवारण करता है और उनके जीवन में सुख-समृद्धि लाता है।';
  }
}

// Helper for Mantras
function getDefaultMantra(dayNumber: number, name: string): string {
  switch (dayNumber) {
    case 1:
      return 'ॐ देवी शैलपुत्र्यै नमः';
    case 2:
      return 'ॐ देवी ब्रह्मचारिण्यै नमः';
    case 3:
      return 'ॐ देवी चंद्रघण्टायै नमः';
    case 4:
      return 'ॐ देवी कूष्माण्डायै नमः';
    case 5:
      return 'ॐ देवी स्कन्दमात्रै नमः';
    case 6:
      return 'ॐ देवी कात्यायन्यै नमः';
    case 7:
      return 'ॐ देवी कालरात्र्यै नमः';
    case 8:
      return 'ॐ देवी महागौर्यै नमः';
    case 9:
      return 'ॐ देवी सिद्धिदात्र्यै नमः';
    default:
      return 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे';
  }
}

// Helper for Pujan Vidhi
function getDefaultPujanVidhi(dayNumber: number, name: string): string {
  switch (dayNumber) {
    case 1:
      return '1. प्रातः स्नान कर शुद्ध वस्त्र धारण करें।\n2. घटस्थापना (कलश स्थापना) करें और जवारे बोएं।\n3. माँ शैलपुत्री को सफेद वस्त्र, अक्षत, रोली और गाय के घी का भोग अर्पण करें।\n4. शैलपुत्री मंत्र का 108 बार जाप करें तथा आरती उतारें।';
    case 2:
      return '1. माँ ब्रह्मचारिणी के चित्र या मूर्ति के समक्ष दीप प्रज्वलित करें।\n2. शक्कर, पंचामृत और फलों का भोग लगाएं।\n3. रुद्राक्ष की माला से \'या देवी सर्वभूतेषु ब्रह्मचारिणी रूपेण संस्थिता\' मंत्र का जाप करें।\n4. संध्या आरती संपन्न करें।';
    case 3:
      return '1. माता चंद्रघंटा का ध्यान कर षोपचार पूजन करें।\n2. दूध या खीर का भोग अर्पित करें।\n3. लाल फूल और सिंदूर चढ़ाएं।\n4. घंटा नाद के साथ मंगल आरती करें।';
    case 4:
      return '1. माँ कूष्माण्डा का पूजन करें और मस्तक पर रोली लगाएं।\n2. मालपुए और मौसमी फलों का भोग लगाएं।\n3. दुर्गा सप्तशती का पाठ करें।\n4. आरती के उपरांत प्रसाद वितरित करें।';
    case 5:
      return '1. स्कंदमाता की पूजा में केले और पीले मिष्ठान्न का भोग लगाएं।\n2. लाल वस्त्र अर्पित करें।\n3. परिवार के कल्याण हेतु प्रार्थना करें।\n4. कन्या पूजन एवं विशेष हवन में भाग लें।';
    case 6:
      return '1. माँ कात्यायनी को शहद (मधु) और पान का भोग लगाएं।\n2. पीले या लाल वस्त्र पहनकर पूजा करें।\n3. माता के मंत्रों का जाप करें।\n4. सायं महाआरती में सम्मिलित हों।';
    case 7:
      return '1. कालरात्रि माता का रात्रि के समय विशेष अनुष्ठान करें।\n2. गुड़ और तिल्ली के व्यंजन का भोग लगाएं।\n3. नीले या लाल वस्त्र धारण करें।\n4. कवच एवं स्तोत्र का पाठ करें।';
    case 8:
      return '1. महागौरी के दिन महाष्टमी पूजन एवं हवन करें।\n2. हलवा, पूरी और काले चने का भोग लगाएं।\n3. कन्या भोज कराएं।\n4. सुहाग सामग्री अर्पण करें।';
    case 9:
      return '1. सिद्धिदात्री माता को नौ प्रकार के नैवेद्य अर्पित करें।\n2. पूर्णाहुति हवन संपन्न करें।\n3. कन्या पूजन एवं विदाई करें।\n4. सिंदूर खेला उत्सव मनाएं।';
    default:
      return '1. माता के चरणों में पुष्प अर्पित करें।\n2. धूप-दीप जलाकर आरती करें।\n3. क्षमा प्रार्थना करें।';
  }
}
