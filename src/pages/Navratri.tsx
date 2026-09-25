import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { NavratriDay } from '../types';
import { defaultNavratriDays } from '../utils/seedData';
import { Sparkles, Clock, Gift, Award, BookOpen, Volume2, VolumeX, Scroll, Flame, CheckCircle, Info } from 'lucide-react';

export const Navratri: React.FC = () => {
  const [days, setDays] = useState<NavratriDay[]>(defaultNavratriDays);
  const [loading, setLoading] = useState(false);
  const [speakingDay, setSpeakingDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | number>('all');

  useEffect(() => {
    const q = query(collection(db, 'navratri'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: NavratriDay[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as NavratriDay;
        // Enrich with default katha, mantra, and pujan vidhi if missing
        if (!data.katha) {
          data.katha = getDefaultKatha(data.dayNumber, data.deviName);
        }
        if (!data.mantra) {
          data.mantra = getDefaultMantra(data.dayNumber, data.deviName);
        }
        if (!data.pujanVidhi) {
          data.pujanVidhi = getDefaultPujanVidhi(data.dayNumber, data.deviName);
        }
        list.push(data);
      });
      list.sort((a, b) => a.dayNumber - b.dayNumber);
      if (list.length > 0) {
        setDays(list);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Navratri snapshot error, using default days:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Header */}
      <div className="text-center space-y-3 bg-gradient-to-r from-[#4a0000] via-red-900 to-[#4a0000] text-amber-50 p-8 rounded-3xl shadow-2xl border-2 border-[#ff7a00]">
        <div className="inline-flex items-center space-x-2 bg-[#ff7a00] text-red-950 px-4 py-1.5 rounded-full text-sm font-bold shadow">
          <Sparkles className="w-4 h-4 fill-red-950" />
          <span>पवित्र चैत्र एवं शारदीय नवरात्रि</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-amber-200">नवरात्रि – 9 दिन विशेष कथा, मंत्र एवं पूजा विधान</h1>
        <p className="max-w-3xl mx-auto text-amber-100/90 text-sm sm:text-base">
          माता दुर्गा के नौ स्वरूपों की पौराणिक कथाएँ, पावन मंत्र, स्टेप-बाय-स्टेप पूजा विधि और AI वॉइस (ऑडियो) श्रवण की सुविधा।
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow ${
            activeTab === 'all'
              ? 'bg-[#4a0000] text-amber-200 border-2 border-[#ff7a00]'
              : 'bg-white text-stone-700 hover:bg-amber-50 border'
          }`}
        >
          सभी 9 रूप (All Days)
        </button>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => setActiveTab(num)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow ${
              activeTab === num
                ? 'bg-[#ff7a00] text-red-950 border-2 border-[#4a0000]'
                : 'bg-white text-stone-700 hover:bg-amber-50 border'
            }`}
          >
            दिन {num}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-500 font-medium text-lg">नवरात्रि विवरण लोड हो रहा है...</div>
      ) : (
        <div className="space-y-12">
          {days
            .filter((d) => activeTab === 'all' || d.dayNumber === activeTab)
            .map((day) => (
              <div
                key={day.dayNumber}
                className="bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
              >
                {/* Left Image & Quick Info */}
                <div className="lg:col-span-4 relative min-h-[300px] lg:min-h-full">
                  <img
                    src={day.imageUrl}
                    alt={day.deviName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-6 text-white">
                    <div className="flex justify-between items-start">
                      <span className="bg-[#4a0000] text-amber-300 font-bold px-4 py-1.5 rounded-full text-sm shadow-md border border-[#ff7a00]">
                        दिन {day.dayNumber} — {day.date}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSpeak(day)}
                        className={`p-3 rounded-full shadow-lg transition flex items-center space-x-1.5 text-xs font-bold ${
                          speakingDay === day.dayNumber
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : 'bg-[#ff7a00] text-red-950 hover:bg-amber-500'
                        }`}
                        title="AI Voice (ऑडियो सुनें)"
                      >
                        {speakingDay === day.dayNumber ? (
                          <>
                            <VolumeX className="w-5 h-5" />
                            <span>रोकें</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-5 h-5" />
                            <span>कथा सुनें</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <h2 className="text-3xl font-bold font-serif text-amber-200">{day.deviName}</h2>
                      <p className="text-xs text-amber-100/80">माँ जगदम्बा स्थान, मथुरापुर, मुजफ्फरपुर, 843119</p>
                    </div>
                  </div>
                </div>

                {/* Right Content: Description, Katha, Mantra, Puja Vidhi */}
                <div className="lg:col-span-8 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-stone-700 leading-relaxed text-base font-medium">{day.description}</p>

                    {/* Mantra Box */}
                    {day.mantra && (
                      <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-400/70 space-y-1 shadow-inner">
                        <div className="flex items-center space-x-2 text-red-950 font-bold text-sm">
                          <Flame className="w-4 h-4 text-[#ff7a00]" />
                          <span>सिद्ध मंत्र (Mantra)</span>
                        </div>
                        <p className="font-serif italic text-red-900 text-base sm:text-lg font-bold">
                          "{day.mantra}"
                        </p>
                      </div>
                    )}

                    {/* Pauranik Katha */}
                    {day.katha && (
                      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex items-center space-x-2 text-[#4a0000] font-bold text-base">
                          <Scroll className="w-5 h-5 text-[#ff7a00]" />
                          <span>पौराणिक कथा (Mythological Katha)</span>
                        </div>
                        <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
                          {day.katha}
                        </p>
                      </div>
                    )}

                    {/* Pujan Vidhi */}
                    {day.pujanVidhi && (
                      <div className="bg-red-950 text-amber-50 p-5 rounded-2xl space-y-2 shadow">
                        <div className="flex items-center space-x-2 text-amber-300 font-bold text-base">
                          <BookOpen className="w-5 h-5 text-[#ff7a00]" />
                          <span>विशेष पूजन विधि (Step-by-Step Puja Vidhi)</span>
                        </div>
                        <p className="text-amber-100/90 text-sm leading-relaxed whitespace-pre-line">
                          {day.pujanVidhi}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Grid for Timing, Bhog, Special Program */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-100">
                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 space-y-1">
                      <div className="flex items-center space-x-2 text-red-900 font-bold text-xs">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>पूजा समय (Timing)</span>
                      </div>
                      <p className="text-xs text-stone-700">{day.timing}</p>
                    </div>

                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 space-y-1">
                      <div className="flex items-center space-x-2 text-red-900 font-bold text-xs">
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span>भोग प्रसाद (Bhog)</span>
                      </div>
                      <p className="text-xs text-stone-700">{day.bhogPrasad}</p>
                    </div>

                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 space-y-1">
                      <div className="flex items-center space-x-2 text-red-900 font-bold text-xs">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>विशेष कार्यक्रम</span>
                      </div>
                      <p className="text-xs text-stone-700">{day.specialProgram}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
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
      return 'ॐ देवी ब्रह्मचारিণ्ये नमः';
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
