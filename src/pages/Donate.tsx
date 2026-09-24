import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { SiteSettings } from '../types';
import { Heart, Upload, CheckCircle2, AlertCircle, Copy, ArrowRight, Smartphone, QrCode } from 'lucide-react';

interface DonateProps {
  settings: SiteSettings;
}

export const Donate: React.FC<DonateProps> = ({ settings }) => {
  const [donorName, setDonorName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState<number>(501);
  const [purpose, setPurpose] = useState('स्वच्छ मंदिर सहयोग');
  const [paymentMethod, setPaymentMethod] = useState('UPI QR Code');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [successDonationId, setSuccessDonationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const presetAmounts = [101, 251, 501, 1001, 2100, 5100, 11000];
  const upiId = settings.upiId || 'maajagdamba@okhdfcbank';
  const upiName = settings.upiName || 'Maa Jagdamba Sthan Trust';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('फ़ाइल का आकार 5MB से छोटा होना चाहिए।');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openUpiApp = (appName: string) => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR`;
    window.location.href = upiUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget as HTMLFormElement;

    if (!donorName.trim()) {
      setError('कृपया दान कर्ता का पूरा नाम दर्ज करें।');
      return;
    }
    if (!mobile.trim() || mobile.length < 10) {
      setError('कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!amount || amount <= 0) {
      setError('कृपया वैध दान राशि दर्ज करें।');
      return;
    }
    if (!proofPreview) {
      setError('कृपया भुगतान स्क्रीनशॉट / रसीद अपलोड करें।');
      return;
    }

    try {
      setSubmitting(true);
      let proofUrl = '';

      if (proofFile) {
        try {
          const storageRef = ref(storage, `payment_proofs/${Date.now()}_${proofFile.name}`);
          const snapshot = await uploadBytes(storageRef, proofFile);
          proofUrl = await getDownloadURL(snapshot.ref);
        } catch (storageErr) {
          console.warn('Storage upload note, using base64 preview:', storageErr);
          proofUrl = proofPreview;
        }
      } else {
        proofUrl = proofPreview;
      }

      const donationData = {
        donorName: donorName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        amount: Number(amount),
        donationType: 'Online',
        paymentMethod,
        purpose,
        paymentProofUrl: proofUrl,
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef1 = await addDoc(collection(db, 'onlineDonations'), donationData).catch(() => null);
      const docRef2 = await addDoc(collection(db, 'donations'), donationData);

      // 1. Show success toast "सफलतापूर्वक सेव हो गया"
      alert('सफलतापूर्वक सेव हो गया');

      // 2. Immediately auto-clear all fields: Full Name = "", Mobile = "", Email = "", Password = "", Photo = null, Crop preview = null
      setDonorName('');
      setMobile('');
      setEmail('');
      setAmount(501);
      setProofFile(null);
      setProofPreview(null);
      if (form && typeof form.reset === 'function') {
        form.reset();
      }

      setSuccessDonationId(docRef2.id || docRef1?.id || 'DON-' + Math.floor(100000 + Math.random() * 900000));
      setSubmitting(false);
    } catch (err: any) {
      console.error('Donation submission error:', err);
      setError('दान जमा करने में त्रुटि हुई। कृपया पुनः प्रयास करें। (' + err.message + ')');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Top Section - Title & Subtitle */}
      <div className="text-center space-y-3 bg-gradient-to-r from-[#4a0000] via-red-900 to-[#4a0000] text-amber-50 p-8 rounded-3xl shadow-2xl border-2 border-[#ff7a00]">
        <div className="inline-flex items-center space-x-2 bg-[#ff7a00] text-red-950 px-4 py-1.5 rounded-full text-sm font-bold shadow">
          <Heart className="w-4 h-4 fill-red-950" />
          <span>पवित्र दान एवं सहयोग पोर्टल</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-amber-200">माँ जगदंबा स्थान ऑनलाइन दान पोर्टल</h1>
        <p className="max-w-2xl mx-auto text-amber-100/90 text-sm sm:text-base">
          {settings.donationInstructions || 'माँ जगदंबा के दरबार में आपका दान जीर्णोद्धार, अन्नदान और सेवा कार्यों में उपयोग होता है।'}
        </p>
      </div>

      {successDonationId ? (
        <div className="bg-white rounded-3xl shadow-2xl border-4 border-emerald-500 p-8 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold font-serif text-emerald-900">धन्यवाद!</h2>
            <p className="text-lg font-bold text-red-900">Admin approval ke baad WhatsApp par receipt aayegi</p>
            <p className="text-stone-600 text-sm">
              आपका दान संदर्भ संख्या (Donation ID): <span className="font-mono font-bold text-red-900 bg-red-50 px-2 py-0.5 rounded">{successDonationId}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setSuccessDonationId(null);
              setDonorName('');
              setMobile('');
              setEmail('');
              setAmount(501);
              setProofFile(null);
              setProofPreview(null);
            }}
            className="bg-[#ff7a00] hover:bg-amber-600 text-red-950 font-bold px-8 py-3 rounded-xl shadow transition"
          >
            एक और दान करें (Make Another Donation)
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {error && (
              <div className="bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-xl text-sm flex items-center space-x-3 shadow-sm">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 4: Form Fields in exact order */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-serif text-[#4a0000] border-b pb-2 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-[#ff7a00]" />
                <span>1. दान विवरण दर्ज करें</span>
              </h2>

              {/* Field 1: Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-stone-800">दान कर्ता का पूरा नाम *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="उदा. श्री राम कुमार"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#ff7a00] focus:outline-none text-stone-800 text-sm shadow-sm"
                />
              </div>

              {/* Field 2: Mobile / WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-stone-800">मोबाइल नंबर / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#ff7a00] focus:outline-none text-stone-800 text-sm shadow-sm"
                />
              </div>

              {/* Field 3: Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-stone-800">ईमेल (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#ff7a00] focus:outline-none text-stone-800 text-sm shadow-sm"
                />
              </div>

              {/* Field 4: Purpose Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-stone-800">दान का उद्देश्य</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#ff7a00] focus:outline-none text-stone-800 text-sm bg-white shadow-sm font-medium"
                >
                  <option value="स्वच्छ मंदिर सहयोग">स्वच्छ मंदिर सहयोग</option>
                  <option value="नवरात्रि पूजा">नवरात्रि पूजा</option>
                  <option value="भंडारा">भंडारा</option>
                  <option value="निर्माण कार्य">निर्माण कार्य</option>
                  <option value="अन्य">अन्य</option>
                </select>
              </div>

              {/* Field 5: Amount Chips & Custom Input */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-800">दान राशि (₹) *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border ${
                        amount === amt
                          ? 'bg-[#ff7a00] text-red-950 border-[#ff7a00] shadow-md scale-105'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-amber-50'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="अपनी राशि दर्ज करें"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#ff7a00] focus:outline-none text-stone-800 font-bold text-lg shadow-sm"
                />
              </div>
            </div>

            {/* Step 2 & 3: QR Code and Direct Payment App Buttons placed BELOW the form */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xl font-bold font-serif text-[#4a0000] flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-[#ff7a00]" />
                <span>2. स्कैन करके या सीधे ऐप से भुगतान करें (₹{amount})</span>
              </h2>

              <div className="bg-amber-50/70 rounded-2xl border-2 border-[#ff7a00]/50 p-6 text-center space-y-6 max-w-lg mx-auto shadow-md">
                <div className="inline-block bg-[#4a0000] text-amber-200 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  स्कैन करके भुगतान करें
                </div>

                <div className="bg-white p-4 rounded-2xl border-2 border-[#ff7a00] inline-block shadow">
                  <img
                    src={settings.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR`}
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain mx-auto"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold font-serif text-[#4a0000]">{upiName}</h3>
                  <div className="flex items-center justify-center space-x-2 bg-white py-2 px-4 rounded-xl max-w-xs mx-auto border shadow-sm">
                    <span className="font-mono font-bold text-stone-800 text-xs sm:text-sm">{upiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="bg-[#ff7a00] hover:bg-amber-600 text-red-950 p-1.5 rounded transition shadow text-xs font-bold flex items-center space-x-1"
                      title="Copy UPI ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'कॉपी हो गया!' : 'कॉपी'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct App Payment Buttons */}
                <div className="space-y-2 pt-2 border-t border-amber-200">
                  <p className="text-xs font-bold text-stone-700 uppercase">या सीधे UPI ऐप से भुगतान करें:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => openUpiApp('PhonePe')}
                      className="bg-purple-900 hover:bg-purple-950 text-white font-bold py-2.5 px-2 rounded-xl text-xs shadow flex items-center justify-center space-x-1 transition"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>PhonePe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openUpiApp('GooglePay')}
                      className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-2 rounded-xl text-xs shadow flex items-center justify-center space-x-1 transition"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Google Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openUpiApp('Paytm')}
                      className="bg-cyan-800 hover:bg-cyan-900 text-white font-bold py-2.5 px-2 rounded-xl text-xs shadow flex items-center justify-center space-x-1 transition"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Paytm</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6: Screenshot Upload */}
            <div className="space-y-2 pt-4 border-t">
              <h2 className="text-xl font-bold font-serif text-[#4a0000] flex items-center space-x-2">
                <Upload className="w-5 h-5 text-[#ff7a00]" />
                <span>3. भुगतान स्क्रीनशॉट / रसीद अपलोड करें *</span>
              </h2>
              <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-[#ff7a00] transition bg-stone-50">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="hidden"
                  id="proof-upload"
                />
                <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                  <Upload className="w-10 h-10 text-[#ff7a00]" />
                  <span className="text-sm font-bold text-stone-700">क्लिक करके स्क्रीनशॉट अपलोड करें</span>
                  <span className="text-xs text-stone-400">PNG, JPG, MAX 5MB</span>
                </label>
                {proofPreview && (
                  <div className="mt-4 relative w-36 h-36 mx-auto rounded-xl overflow-hidden border-2 border-[#ff7a00] shadow-md">
                    <img src={proofPreview} alt="Proof preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Step 7: Final Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#4a0000] via-red-900 to-[#4a0000] hover:from-red-950 hover:to-red-900 text-amber-100 font-bold py-4 rounded-2xl shadow-2xl flex items-center justify-center space-x-2 transition text-lg disabled:opacity-50 border border-[#ff7a00]"
            >
              {submitting ? (
                <span>सबमिट हो रहा है...</span>
              ) : (
                <>
                  <span>दान निवेदन सबमिट करें (Submit Donation)</span>
                  <ArrowRight className="w-5 h-5 text-[#ff7a00]" />
                </>
              )}
            </button>

          </form>
        </div>
      )}

    </div>
  );
};
