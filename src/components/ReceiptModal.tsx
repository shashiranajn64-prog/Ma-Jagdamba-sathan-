import React from 'react';
import { Donation, SiteSettings } from '../types';
import { amountToHindiWords } from '../utils/numberToWords';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  donation: Donation;
  settings: SiteSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ donation, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `🙏 *${settings.templeName}* - दान रसीद (Donation Receipt)\n\n` +
      `रसीद संख्या: ${donation.receiptNumber || 'REC-' + donation.id.slice(0, 6).toUpperCase()}\n` +
      `दान आईडी: ${donation.id}\n` +
      `दाता का नाम: ${donation.donorName}\n` +
      `राशि: ₹${donation.amount.toLocaleString('en-IN')}\n` +
      `(${amountToHindiWords(donation.amount)})\n` +
      `उद्देश्य: ${donation.purpose}\n` +
      `भुगतान माध्यम: ${donation.paymentMethod}\n` +
      `दिनांक: ${new Date(donation.createdAt?.toDate?.() || Date.now()).toLocaleDateString('hi-IN')}\n\n` +
      `माँ जगदंबा आपकी सभी मनोकामनाएं पूर्ण करें। जय माता दी! 🌺`;

    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${donation.mobile || ''}&text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border-4 border-amber-500 relative my-8">
        
        <div className="print:hidden bg-red-900 text-amber-100 px-6 py-4 flex items-center justify-between border-b border-amber-500">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-lg">दान रसीद (Donation Receipt)</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-amber-600 hover:bg-amber-700 text-amber-950 font-semibold px-3 py-1.5 rounded flex items-center space-x-1 text-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट (Print)</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded flex items-center space-x-1 text-sm transition"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="text-amber-200 hover:text-white p-1 rounded-full hover:bg-red-950 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 bg-amber-50/40 text-stone-800 space-y-6">
          <div className="text-center border-b-2 border-amber-400 pb-4 space-y-1">
            <div className="inline-block p-2 bg-amber-100 rounded-full mb-1">
              <span className="text-2xl font-serif font-bold text-red-950">ॐ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-red-900">{settings.templeName}</h1>
            <p className="text-xs sm:text-sm text-stone-600">{settings.address}</p>
            <p className="text-xs sm:text-sm font-semibold text-amber-800">मोबाईल: {settings.contactNumber} | ईमेल: {settings.email}</p>
            <div className="inline-block bg-red-900 text-amber-200 px-4 py-1 rounded-full text-sm font-bold mt-2 shadow-sm">
              दान रसीद (DONATION RECEIPT)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
            <div>
              <p><span className="font-semibold text-stone-600">रसीद संख्या (Receipt No):</span> <span className="font-bold text-red-900">{donation.receiptNumber || 'REC-' + donation.id.slice(0, 6).toUpperCase()}</span></p>
              <p className="mt-1"><span className="font-semibold text-stone-600">दान आईडी (Donation ID):</span> <span className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">{donation.id}</span></p>
            </div>
            <div className="text-right">
              <p><span className="font-semibold text-stone-600">दिनांक (Date):</span> {new Date(donation.createdAt?.toDate?.() || Date.now()).toLocaleDateString('hi-IN')}</p>
              <p className="mt-1"><span className="font-semibold text-stone-600">भुगतान माध्यम (Payment Type):</span> <span className="text-emerald-700 font-bold">{donation.paymentMethod}</span></p>
            </div>
          </div>

          <div className="space-y-3 bg-white p-5 rounded-lg border border-amber-200 shadow-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-stone-600 font-medium">दाता का नाम (Donor Name):</span>
              <span className="font-bold text-lg text-red-950">{donation.donorName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-stone-600 font-medium">मोबाईल नंबर (Mobile):</span>
              <span className="font-semibold">{donation.mobile}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-stone-600 font-medium">दान का उद्देश्य (Purpose):</span>
              <span className="font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">{donation.purpose}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-stone-600 font-medium">स्वीकृत राशि (Amount):</span>
              <span className="font-bold text-xl text-emerald-700">₹{donation.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex flex-col space-y-1 pt-1">
              <span className="text-stone-600 font-medium text-sm">शब्दों में (Amount in Words):</span>
              <span className="font-serif italic font-bold text-stone-800 bg-stone-50 p-2 rounded border border-stone-200">
                "{amountToHindiWords(donation.amount)}"
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-6 mt-6 border-t-2 border-dashed border-amber-300">
            <div className="text-xs text-stone-600 space-y-1">
              <p className="font-bold text-red-900">जय माँ जगदंबा!</p>
              <p>आपके द्वारा दिए गए सहयोग से मंदिर के कार्यों एवं अन्नदान में सहायता मिलती है।</p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-12 border-b border-stone-400 w-44 mx-auto"></div>
              <p className="text-xs font-bold text-red-950">प्राधिकृत हस्ताक्षर / न्यास मुहर</p>
              <p className="text-[10px] text-stone-500">({settings.templeName})</p>
            </div>
          </div>
        </div>

        <div className="print:hidden bg-stone-100 px-6 py-3 flex justify-end border-t border-stone-200">
          <button
            onClick={onClose}
            className="bg-stone-700 hover:bg-stone-800 text-white font-medium px-4 py-2 rounded text-sm transition"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
