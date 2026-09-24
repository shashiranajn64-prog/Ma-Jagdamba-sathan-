import React, { useState, useEffect } from 'react';
import { collection, query, where, addDoc, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Staff, Donation, GalleryItem } from '../types';
import { UserCheck, PlusCircle, Image as ImageIcon, FileText, LogOut, CheckCircle2, QrCode } from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';

interface StaffDashboardProps {
  staffData: Staff;
  onLogout: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ staffData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'donations' | 'gallery' | 'profile'>('donations');
  const [donations, setDonations] = useState<Donation[]>([]);
  
  const [donorName, setDonorName] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState<number>(501);
  const [purpose, setPurpose] = useState('General Donation');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<'Temple' | 'Navratri' | 'Durga Puja' | 'Events' | 'Bhajan/Kirtan' | 'Community Service' | 'Other'>('Temple');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [gallerySuccess, setGallerySuccess] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(staffData.photoUrl || '');

  const handleUpdatePhoto = async (newUrl: string) => {
    setCurrentPhotoUrl(newUrl);
    try {
      await updateDoc(doc(db, 'staff', staffData.id), { photoUrl: newUrl });
    } catch (err) {
      console.error('Error updating staff photo:', err);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'donations'), where('staffId', '==', staffData.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Donation[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Donation));
      setDonations(list);
    });
    return () => unsubscribe();
  }, [staffData.id]);

  const handleAddCashDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const donationData = {
        donorName: donorName.trim(),
        mobile: mobile.trim(),
        amount: Number(amount),
        donationType: 'Cash',
        paymentMethod: 'Cash',
        purpose,
        status: 'Approved',
        staffId: staffData.id,
        staffName: staffData.fullName,
        notes: notes.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'donations'), donationData);
      setSuccessMsg('नकद दान सफलतापूर्वक दर्ज हो गया!');
      setDonorName('');
      setMobile('');
      setAmount(501);
      setNotes('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Cash donation error:', err);
      alert('त्रुटि: ' + err.message);
    }
  };

  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImageUrl.trim()) {
      alert('कृपया तस्वीर का URL दर्ज करें।');
      return;
    }
    try {
      await addDoc(collection(db, 'gallery'), {
        title: galleryTitle.trim(),
        imageUrl: galleryImageUrl.trim(),
        category: galleryCategory,
        status: 'Pending',
        uploadedBy: staffData.id,
        uploadedByName: staffData.fullName,
        createdAt: serverTimestamp(),
      });
      setGallerySuccess('तस्वीर सफलतापूर्वक अपलोड हो गई है और एडमिन अनुमोदन (Approval) के लिए लंबित है।');
      setGalleryTitle('');
      setGalleryImageUrl('');
      setTimeout(() => setGallerySuccess(null), 5000);
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      alert('त्रुटि: ' + err.message);
    }
  };

  const totalCollected = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-50 rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-amber-500 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-amber-500 text-red-950 flex items-center justify-center font-bold text-2xl shadow border-2 border-amber-200">
            {staffData.photoUrl ? (
              <img src={staffData.photoUrl} alt={staffData.fullName} className="w-full h-full object-cover rounded-full" />
            ) : (
              staffData.fullName[0]
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-serif text-amber-200">{staffData.fullName}</h1>
            <p className="text-xs text-amber-300">पद: {staffData.designation} | स्टाफ आईडी: {staffData.staffIdCode}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="bg-red-900 hover:bg-red-800 text-amber-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 border border-amber-400 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>लॉग आउट (Sign Out)</span>
        </button>
      </div>

      <div className="flex border-b border-stone-200 space-x-4">
        <button
          onClick={() => setActiveTab('donations')}
          className={`pb-3 font-bold text-sm sm:text-base border-b-2 transition ${
            activeTab === 'donations' ? 'border-red-900 text-red-950' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          नकद दान प्रविष्टि एवं सूची (Cash Donations)
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`pb-3 font-bold text-sm sm:text-base border-b-2 transition ${
            activeTab === 'gallery' ? 'border-red-900 text-red-950' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          गैलरी फोटो अपलोड (Gallery Upload)
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 font-bold text-sm sm:text-base border-b-2 transition ${
            activeTab === 'profile' ? 'border-red-900 text-red-950' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          मेरा आईडी कार्ड (Staff ID Card)
        </button>
      </div>

      {activeTab === 'donations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-xl border border-amber-200 space-y-6">
            <h3 className="text-xl font-bold font-serif text-red-950 flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-amber-600" />
              <span>नकद दान दर्ज करें (Add Cash Donation)</span>
            </h3>

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl text-xs flex items-center space-x-2 border border-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddCashDonation} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">दाता का नाम (Donor Name) *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="उदा. श्री सुरेश कुमार"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">मोबाईल नंबर (Mobile Number) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10 अंकों का मोबाईल नंबर"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">दान राशि (Amount in ₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">उद्देश्य (Purpose)</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  <option value="General Donation">सामान्य मंदिर सहयोग</option>
                  <option value="Annadan Seva">दैनिक अन्नदान सेवा</option>
                  <option value="Navratri Puja">नवरात्रि विशेष पूजा</option>
                  <option value="Bhandara">भंडारा आयोजन</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">नोट्स (Notes - Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="अतिरिक्त विवरण..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-900 hover:bg-red-950 text-amber-200 font-bold py-2.5 rounded-xl shadow transition text-sm"
              >
                नकद दान सहेजें (Save Cash Donation)
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-xl border border-amber-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold font-serif text-red-950 text-lg">मेरे द्वारा एकत्रित दान (My Collections)</h3>
              <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                कुल योग: ₹{totalCollected.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-stone-700 uppercase text-xs">
                  <tr>
                    <th className="p-3">दाता का नाम</th>
                    <th className="p-3">मोबाईल</th>
                    <th className="p-3">राशि</th>
                    <th className="p-3">उद्देश्य</th>
                    <th className="p-3">दिनांक</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-stone-500">कोई दान प्रविष्टि नहीं मिली।</td>
                    </tr>
                  ) : (
                    donations.map((d) => (
                      <tr key={d.id} className="hover:bg-amber-50/50">
                        <td className="p-3 font-bold text-stone-800">{d.donorName}</td>
                        <td className="p-3 text-stone-600">{d.mobile}</td>
                        <td className="p-3 font-bold text-emerald-700">₹{d.amount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-stone-600">{d.purpose}</td>
                        <td className="p-3 text-xs text-stone-500">
                          {new Date(d.createdAt?.toDate?.() || Date.now()).toLocaleDateString('hi-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-amber-200 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-serif text-red-950">गैलरी फोटो अपलोड (Gallery Upload)</h3>
            <p className="text-xs text-stone-500">आपके द्वारा अपलोड की गई तस्वीर 'Pending Approval' स्थिति में रहेगी और एडमिन अनुमोदन के पश्चात ही सार्वजनिक होगी।</p>
          </div>

          {gallerySuccess && (
            <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl text-xs flex items-center space-x-2 border border-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{gallerySuccess}</span>
            </div>
          )}

          <form onSubmit={handleUploadGallery} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">फोटो शीर्षक (Photo Title) *</label>
              <input
                type="text"
                required
                value={galleryTitle}
                onChange={(e) => setGalleryTitle(e.target.value)}
                placeholder="उदा. नवरात्रि महाआरती"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">श्रेणी (Category)</label>
              <select
                value={galleryCategory}
                onChange={(e) => setGalleryCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="Temple">Temple (मंदिर)</option>
                <option value="Navratri">Navratri (नवरात्रि)</option>
                <option value="Durga Puja">Durga Puja (दुर्गा पूजा)</option>
                <option value="Events">Events (आयोजन)</option>
                <option value="Bhajan/Kirtan">Bhajan/Kirtan (भजन/कीर्तन)</option>
                <option value="Community Service">Community Service (समाज सेवा)</option>
                <option value="Other">Other (अन्य)</option>
              </select>
            </div>

            <div>
              <ImageUpload
                value={galleryImageUrl}
                onChange={setGalleryImageUrl}
                label="गैलरी तस्वीर अपलोड करें (Upload Gallery Photo)"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-900 hover:bg-red-950 text-amber-200 font-bold py-3 rounded-xl shadow transition text-sm"
            >
              अनुमोदन हेतु अपलोड करें (Upload for Approval)
            </button>
          </form>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border-4 border-amber-500 p-6 space-y-6 text-center">
          <div className="space-y-1 border-b pb-4">
            <h3 className="text-lg font-bold font-serif text-red-950">माँ जगदंबा स्थान</h3>
            <p className="text-xs text-stone-500">आधिकारिक कर्मचारी पहचान पत्र (Staff ID Card)</p>
          </div>

          <div className="w-32 h-32 rounded-2xl bg-amber-100 mx-auto overflow-hidden border-2 border-amber-400 shadow-md">
            {currentPhotoUrl ? (
              <img src={currentPhotoUrl} alt={staffData.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-amber-800">
                {staffData.fullName[0]}
              </div>
            )}
          </div>

          <div className="text-left">
            <ImageUpload
              value={currentPhotoUrl}
              onChange={handleUpdatePhoto}
              label="फोटो बदलें, क्रॉप एवं एडजस्ट करें (Change & Adjust Photo)"
              enableCropAndAdjust={true}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-red-900">{staffData.fullName}</h2>
            <p className="text-sm font-bold text-amber-800 bg-amber-50 py-1 px-3 rounded-full inline-block">
              {staffData.designation}
            </p>
            <div className="text-xs text-stone-600 space-y-1 pt-2">
              <p><span className="font-semibold">स्टाफ आईडी:</span> <span className="font-mono font-bold text-red-950">{staffData.staffIdCode}</span></p>
              <p><span className="font-semibold">मोबाईल:</span> {staffData.mobile}</p>
              <p><span className="font-semibold">जोइनिंग दिनांक:</span> {staffData.joiningDate}</p>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-center">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center space-x-3">
              <QrCode className="w-12 h-12 text-stone-800" />
              <div className="text-left text-[10px] text-stone-500">
                <p className="font-bold text-stone-800">Verified Staff</p>
                <p>ID: {staffData.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full bg-amber-600 hover:bg-amber-700 text-red-950 font-bold py-2.5 rounded-xl shadow text-sm transition"
          >
            आईडी कार्ड प्रिंट / डाउनलोड करें (Print ID Card)
          </button>
        </div>
      )}

    </div>
  );
};
