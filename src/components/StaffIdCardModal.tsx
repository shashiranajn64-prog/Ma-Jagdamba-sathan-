import React, { useState, useRef } from 'react';
import { Staff } from '../types';
import { X, Download, Printer, Shield, Phone, MapPin } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface StaffIdCardModalProps {
  staff: Staff;
  onClose: () => void;
}

export const StaffIdCardModal: React.FC<StaffIdCardModalProps> = ({ staff, onClose }) => {
  const [side, setSide] = useState<'front' | 'back' | 'both'>('both');
  const [isExporting, setIsExporting] = useState(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const staffCode = staff.staffIdCode || 'MJS-01';

  // Determine role category automatically from designation
  const designationLower = (staff.designation || '').toLowerCase();
  const isPujari = designationLower.includes('pujari') || designationLower.includes('पुजारी') || designationLower.includes('purohit') || designationLower.includes('pandit');
  const isVolunteer = designationLower.includes('volunteer') || designationLower.includes('वालंटियर') || designationLower.includes('सेवा दल') || designationLower.includes('sevadar');

  const cardRoleTitle = isPujari ? 'पुजारी (PUJARI)' : isVolunteer ? 'सेवा दल (VOLUNTEER)' : 'मंदिर स्टाफ (STAFF)';
  const englishRole = isPujari ? 'PUJARI' : isVolunteer ? 'VOLUNTEER' : 'STAFF';
  const badgeTitle = isPujari ? 'पुजारी परिचय पत्र' : isVolunteer ? 'सेवा दल परिचय पत्र' : 'स्टाफ परिचय पत्र';
  const backTitle = isPujari ? 'पुजारी विवरण' : isVolunteer ? 'सेवा दल विवरण' : 'स्टाफ विवरण';

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Verified ${englishRole} ID: ${staffCode} | Name: ${staff.fullName} | Role: ${staff.designation || 'Sevadar'} | Maa Jagdamba Sthan Trust`)}`;

  const handleDownloadJpg = async (targetSide: 'front' | 'back') => {
    setIsExporting(true);
    const element = targetSide === 'front' ? frontRef.current : backRef.current;
    if (!element) {
      setIsExporting(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#4a050d'
      });
      const image = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${staff.fullName.replace(/\s+/g, '_')}_${englishRole}_ID_${targetSide.toUpperCase()}.jpg`;
      link.click();
    } catch (err) {
      console.error('Download JPG error:', err);
      alert('इमेज डाउनलोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!frontRef.current || !backRef.current) return;
    setIsExporting(true);

    try {
      const canvasFront = await html2canvas(frontRef.current, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#4a050d' });
      const canvasBack = await html2canvas(backRef.current, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#4a050d' });

      const imgFront = canvasFront.toDataURL('image/jpeg', 1.0);
      const imgBack = canvasBack.toDataURL('image/jpeg', 1.0);

      // A4 portrait PDF for vertical CR80 54mm x 86mm ID cards
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      pdf.addImage(imgFront, 'JPEG', 42, 35, 54, 86);
      pdf.addImage(imgBack, 'JPEG', 114, 35, 54, 86);

      pdf.save(`${staff.fullName.replace(/\s+/g, '_')}_${englishRole}_Vertical_ID_Cards.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF डाउनलोड करने में त्रुटि हुई।');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-stone-900 rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 border-4 border-amber-500">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-red-950 flex items-center justify-center font-bold shadow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-amber-300 text-xl">
                परिचय पत्र ({badgeTitle}) - 54x86mm
              </h3>
              <p className="text-xs text-stone-400">{staff.fullName} — {staff.designation || 'Sevadar'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-amber-300 font-bold transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <button
            onClick={() => setSide('both')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
              side === 'both'
                ? 'bg-amber-500 text-red-950 border-2 border-amber-300'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            दोनों साइड (Side by Side)
          </button>
          <button
            onClick={() => setSide('front')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
              side === 'front'
                ? 'bg-amber-500 text-red-950 border-2 border-amber-300'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            सामने का भाग (Front Side)
          </button>
          <button
            onClick={() => setSide('back')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
              side === 'back'
                ? 'bg-amber-500 text-red-950 border-2 border-amber-300'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            पीछे का भाग (Back Side)
          </button>
        </div>

        {/* Card Display Container */}
        <div className="bg-stone-950 p-6 rounded-2xl border-2 border-amber-600/50 flex flex-wrap justify-center items-center gap-8 overflow-x-auto shadow-inner">
          
          {/* ================= FRONT SIDE ================= */}
          <div
            ref={frontRef}
            className={`w-[240px] h-[380px] bg-[#4a050d] rounded-2xl shadow-2xl border-4 border-amber-600 overflow-hidden relative flex flex-col justify-between shrink-0 ${
              side === 'back' ? 'hidden' : 'flex'
            }`}
          >
            {/* Top Temple Header */}
            <div className="bg-[#4a050d] text-amber-300 px-2 py-2 flex flex-col items-center justify-center border-b-2 border-amber-600 text-center relative">
              <h4 className="text-[11px] font-bold tracking-tight font-serif text-amber-200 uppercase drop-shadow">
                माँ जगदम्बा स्थान मंदिर
              </h4>
              <p className="text-[7.5px] tracking-widest text-amber-400 font-semibold uppercase">
                MAA JAGDAMBA STHAN TEMPLE
              </p>
            </div>

            {/* Middle Container with Cream Background */}
            <div className="mx-2 my-2 bg-[#fcf6ed] rounded-xl p-2.5 flex flex-col items-center shadow-inner border border-amber-400/60 flex-1 justify-between">
              
              {/* Dynamic Role Title Banner */}
              <div className="text-center w-full border-b border-amber-800/20 pb-1">
                <h3 className="font-serif font-black tracking-widest text-[#4a050d] text-xs uppercase">
                  {cardRoleTitle}
                </h3>
              </div>

              {/* Photo & QR Code */}
              <div className="flex items-center gap-2.5 w-full justify-center my-1">
                <div className="w-[84px] h-[104px] rounded-lg bg-stone-200 overflow-hidden border-2 border-[#4a050d] shadow shrink-0">
                  <img src={staff.photoUrl} alt={staff.fullName} className="w-full h-full object-cover" crossOrigin="anonymous" />
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="w-12 h-12 bg-white p-0.5 rounded border border-orange-500 flex items-center justify-center shadow">
                    <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain" crossOrigin="anonymous" />
                  </div>
                  <span className="text-[6px] text-stone-600 font-bold tracking-tighter">सत्यापन हेतु स्कैन करें</span>
                </div>
              </div>

              {/* Details Fields */}
              <div className="w-full space-y-1 text-left bg-white p-2 rounded-lg border border-amber-200 shadow-sm text-[8px]">
                <div>
                  <p className="text-[6.5px] text-stone-500 uppercase font-bold tracking-wider">नाम (NAME):</p>
                  <p className="font-bold text-[#4a050d] text-[10.5px] font-serif leading-tight line-clamp-1">{staff.fullName}</p>
                </div>
                <div>
                  <p className="text-[6.5px] text-stone-500 uppercase font-bold tracking-wider">आईडी नंबर (ID NO):</p>
                  <p className="font-mono font-bold text-amber-900 text-[9.5px]">{staffCode}</p>
                </div>
                <div>
                  <p className="text-[6.5px] text-stone-500 uppercase font-bold tracking-wider">पद (DESIGNATION):</p>
                  <p className="font-semibold text-stone-800 text-[8.5px] line-clamp-1">{staff.designation || 'सेवादल'}</p>
                </div>
              </div>
            </div>

            {/* Bottom padding spacer instead of footer */}
            <div className="bg-[#4a050d] py-1 text-center text-[7px] text-amber-300 font-serif">
              * अधिकृत मंदिर पहचान पत्र *
            </div>
          </div>


          {/* ================= BACK SIDE ================= */}
          <div
            ref={backRef}
            className={`w-[240px] h-[380px] bg-[#4a050d] rounded-2xl shadow-2xl border-4 border-amber-600 overflow-hidden relative flex flex-col justify-between shrink-0 ${
              side === 'front' ? 'hidden' : 'flex'
            }`}
          >
            {/* Top Header */}
            <div className="bg-[#4a050d] text-amber-200 px-2 py-2 flex flex-col items-center justify-center border-b-2 border-amber-600 text-center">
              <h4 className="text-[10px] font-bold tracking-wider font-serif text-amber-200 uppercase drop-shadow">
                {backTitle} (महत्वपूर्ण सूचना)
              </h4>
            </div>

            {/* Middle Container - All in Hindi */}
            <div className="mx-2 my-2 bg-[#fcf6ed] rounded-xl p-2 space-y-1.5 text-[8px] text-stone-900 shadow-inner border border-amber-400/60 flex-1">
              
              {/* Section 1: Temple Details (Website Home Page Address) */}
              <div className="bg-amber-500/20 rounded p-1.5 border border-amber-500/30">
                <div className="bg-[#d97706] text-white text-[7.5px] font-bold px-2 py-0.5 rounded text-center uppercase mb-1">
                  मंदिर विवरण (पता)
                </div>
                <div className="space-y-0.5 text-stone-800 font-medium text-[7.5px]">
                  <p className="flex items-start space-x-1">
                    <MapPin className="w-2.5 h-2.5 text-amber-800 shrink-0 mt-0.5" />
                    <span>सिद्धपीठ माँ जगदम्बा स्थान, मथुरापुर, मुजफ्फरपुर, बिहार - 843119</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <Phone className="w-2.5 h-2.5 text-amber-800 shrink-0" />
                    <span>मोबाईल: +91-97091-68876 • info@maajagdambasthan.org</span>
                  </p>
                </div>
              </div>

              {/* Section 2: Emergency Contact */}
              <div className="bg-amber-500/20 rounded p-1.5 border border-amber-500/30">
                <div className="bg-[#d97706] text-white text-[7.5px] font-bold px-2 py-0.5 rounded text-center uppercase mb-1">
                  आपातकालीन संपर्क
                </div>
                <div className="space-y-0.5 text-stone-800 text-[7.5px]">
                  <p><span className="font-bold">कार्यालय:</span> मंदिर न्यास समिति</p>
                  <p><span className="font-bold">हेल्पलाइन:</span> +91-97091-68876</p>
                  <p><span className="font-bold">भूमिका:</span> {staff.designation || 'सेवादल'}</p>
                </div>
              </div>

              {/* Section 3: Instructions */}
              <div className="bg-amber-500/20 rounded p-1.5 border border-amber-500/30">
                <div className="bg-[#d97706] text-white text-[7.5px] font-bold px-2 py-0.5 rounded text-center uppercase mb-1">
                  नियम एवं निर्देश:
                </div>
                <ul className="list-disc pl-3 text-[7px] text-stone-800 space-y-0.5 leading-tight">
                  <li>यह परिचय पत्र केवल मंदिर सेवा कार्यों हेतु मान्य है।</li>
                  <li>ड्यूटी के दौरान कार्ड को हमेशा गले में दृश्यमान रखें।</li>
                  <li>पाए जाने पर कृपया मंदिर कार्यालय में वापस जमा कराएं।</li>
                </ul>
              </div>

            </div>

            {/* Bottom Signatures Only (No footer bar) */}
            <div className="bg-[#fcf6ed] px-2 py-2 border-t border-amber-600 flex justify-between items-end text-[7px]">
              <div className="text-center">
                <div className="border-b border-stone-400 w-24 h-4 mb-0.5"></div>
                <p className="text-[6px] font-bold">धारक के हस्ताक्षर</p>
              </div>
              <div className="text-center">
                <div className="border-b border-stone-400 w-24 h-4 mb-0.5"></div>
                <p className="text-[6px] font-bold">प्रबंध ट्रस्टी</p>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-800">
          <button
            onClick={() => handleDownloadJpg('front')}
            disabled={isExporting}
            className="bg-amber-600 hover:bg-amber-700 text-red-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>सामने की JPG</span>
          </button>
          <button
            onClick={() => handleDownloadJpg('back')}
            disabled={isExporting}
            className="bg-amber-600 hover:bg-amber-700 text-red-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>पीछे की JPG</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="bg-red-800 hover:bg-red-900 text-amber-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>PDF डाउनलोड</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={isExporting}
            className="bg-stone-200 hover:bg-stone-300 text-stone-900 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट कार्ड</span>
          </button>
        </div>

      </div>
    </div>
  );
};
