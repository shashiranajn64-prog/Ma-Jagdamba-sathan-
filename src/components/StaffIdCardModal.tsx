import React, { useState, useRef } from 'react';
import { Staff } from '../types';
import { X, Download, Printer, RotateCw, Shield, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StaffIdCardModalProps {
  staff: Staff;
  onClose: () => void;
}

export const StaffIdCardModal: React.FC<StaffIdCardModalProps> = ({ staff, onClose }) => {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [isExporting, setIsExporting] = useState(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const staffCode = staff.staffIdCode || 'MJS-STAFF-' + Math.floor(1000 + Math.random() * 9000);

  const handleDownloadJpg = async (targetSide: 'front' | 'back') => {
    setIsExporting(true);
    const element = targetSide === 'front' ? frontRef.current : backRef.current;
    if (!element) {
      setIsExporting(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 3, // 300 DPI high resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const image = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${staff.fullName.replace(/\s+/g, '_')}_ID_${targetSide.toUpperCase()}.jpg`;
      link.click();
    } catch (err) {
      console.error('Download JPG error:', err);
      alert('इमेज डाउनलोड करने में त्रुटि हुई।');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!frontRef.current || !backRef.current) return;
    setIsExporting(true);

    try {
      const canvasFront = await html2canvas(frontRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const canvasBack = await html2canvas(backRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });

      const imgFront = canvasFront.toDataURL('image/jpeg', 1.0);
      const imgBack = canvasBack.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add Front Card image
      pdf.addImage(imgFront, 'JPEG', 20, 20, 110, 68);
      // Add Back Card image
      pdf.addImage(imgBack, 'JPEG', 145, 20, 110, 68);

      pdf.save(`${staff.fullName.replace(/\s+/g, '_')}_ID_Cards.pdf`);
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
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border-4 border-amber-500">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-950 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-red-950 text-xl">स्टाफ पहचान पत्र (Staff ID Card)</h3>
              <p className="text-xs text-stone-500">{staff.fullName} — {staff.designation}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 font-bold transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle / Flip Buttons */}
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => setSide('front')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow ${
              side === 'front'
                ? 'bg-red-950 text-amber-300 border-2 border-amber-400'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>सामने का भाग (Front Side)</span>
          </button>
          <button
            onClick={() => setSide('back')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow ${
              side === 'back'
                ? 'bg-red-950 text-amber-300 border-2 border-amber-400'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>पीछे का भाग (Back Side)</span>
          </button>
          <button
            onClick={() => setSide(side === 'front' ? 'back' : 'front')}
            className="bg-amber-600 hover:bg-amber-700 text-red-950 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow"
            title="Flip Card"
          >
            <RotateCw className="w-4 h-4" />
            <span>पलटें (Flip)</span>
          </button>
        </div>

        {/* Card Display Area */}
        <div className="flex justify-center py-4">
          {/* FRONT SIDE */}
          <div
            ref={frontRef}
            className={`w-[400px] h-[250px] bg-white rounded-2xl shadow-2xl border-4 border-amber-500 overflow-hidden relative flex flex-col justify-between transition-all duration-300 ${
              side === 'front' ? 'block' : 'hidden'
            }`}
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Top Maroon Header */}
            <div className="bg-[#4a0000] text-amber-300 px-3 py-2 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-[#4a0000] flex items-center justify-center font-serif font-bold text-xs shadow">
                  ॐ
                </div>
                <div>
                  <h4 className="text-[10px] font-bold tracking-wider font-serif text-amber-200">माँ जगदंबा स्थान — मंदिर ट्रस्ट</h4>
                  <p className="text-[8px] text-amber-400 font-mono tracking-widest">MAA JAGDAMBA STHAN TRUST</p>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-amber-400 text-[#4a0000] px-2 py-0.5 rounded font-mono">
                STAFF ID
              </span>
            </div>

            {/* Middle Content */}
            <div className="p-3.5 flex gap-3.5 items-center flex-1">
              {/* Left Column: Photo & QR */}
              <div className="flex flex-col items-center space-y-2 shrink-0">
                <div className="w-20 h-24 rounded-xl bg-stone-200 overflow-hidden border-2 border-amber-500 shadow-md">
                  <img src={staff.photoUrl} alt={staff.fullName} className="w-full h-full object-cover" />
                </div>
                {/* Auto-generated QR representation */}
                <div className="w-12 h-12 bg-white p-1 rounded border border-stone-300 flex items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-[#4a0000] p-0.5 grid grid-cols-4 gap-0.5">
                    <div className="bg-amber-400"></div><div className="bg-white"></div><div className="bg-amber-400"></div><div className="bg-white"></div>
                    <div className="bg-white"></div><div className="bg-amber-400"></div><div className="bg-white"></div><div className="bg-amber-400"></div>
                    <div className="bg-amber-400"></div><div className="bg-white"></div><div className="bg-amber-400"></div><div className="bg-white"></div>
                    <div className="bg-white"></div><div className="bg-amber-400"></div><div className="bg-white"></div><div className="bg-amber-400"></div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="flex-1 space-y-1 text-xs">
                <div>
                  <p className="text-[9px] text-stone-500 uppercase font-bold tracking-wider">नाम (Name)</p>
                  <p className="font-bold text-red-950 text-sm font-serif line-clamp-1">{staff.fullName}</p>
                </div>
                <div>
                  <p className="text-[9px] text-stone-500 uppercase font-bold tracking-wider">पद (Designation)</p>
                  <p className="font-semibold text-amber-900 text-xs">{staff.designation}</p>
                </div>
                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <div>
                    <p className="text-[8px] text-stone-500 uppercase font-bold">आईडी नं (ID No)</p>
                    <p className="font-mono font-bold text-red-950 text-[11px]">{staffCode}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-stone-500 uppercase font-bold">मोबाईल (Mobile)</p>
                    <p className="font-mono text-stone-800 text-[11px]">{staff.mobile}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[8px] text-stone-500 uppercase font-bold">वैधता (Validity)</p>
                  <p className="font-mono text-emerald-700 font-bold text-[10px]">01-Jan-2025 से 31-Dec-2026</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="bg-[#4a0000] text-amber-300 py-1 px-3 text-center text-[8px] font-serif tracking-wider border-t border-amber-400">
              SERVING WITH DEVOTION — EST. TRUST REG. NO. MJSTT/2024/001
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            ref={backRef}
            className={`w-[400px] h-[250px] bg-white rounded-2xl shadow-2xl border-4 border-amber-500 overflow-hidden relative flex flex-col justify-between transition-all duration-300 ${
              side === 'back' ? 'block' : 'hidden'
            }`}
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Top Maroon Header */}
            <div className="bg-[#4a0000] text-amber-300 px-3 py-2 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-[#4a0000] flex items-center justify-center font-serif font-bold text-xs shadow">
                  ॐ
                </div>
                <div>
                  <h4 className="text-[10px] font-bold tracking-wider font-serif text-amber-200">माँ जगदंबा स्थान मंदिर ट्रस्ट</h4>
                  <p className="text-[8px] text-amber-400 font-mono tracking-widest">IMPORTANT INFORMATION</p>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-amber-400 text-[#4a0000] px-2 py-0.5 rounded font-mono">
                RULES & INFO
              </span>
            </div>

            {/* Middle Content */}
            <div className="p-3 space-y-2 text-[10px] text-stone-800 flex-1">
              <div>
                <p className="font-bold text-red-950 uppercase text-[9px] flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-amber-600 inline" />
                  <span>मंदिर का पता (Temple Address):</span>
                </p>
                <p className="text-stone-600 pl-4">जगदंबा चौक, डुमरांव, बक्सर, बिहार - 802101</p>
              </div>

              <div>
                <p className="font-bold text-red-950 uppercase text-[9px] flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-amber-600 inline" />
                  <span>आपातकालीन संपर्क (Emergency Contacts):</span>
                </p>
                <p className="text-stone-600 pl-4">कार्यालय: +91 98765 43210 | एम्बुलेंस: 108 | पुलिस: 100</p>
              </div>

              <div>
                <p className="font-bold text-red-950 uppercase text-[9px] flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-amber-600 inline" />
                  <span>नियम एवं शर्तें (Terms & Conditions):</span>
                </p>
                <ul className="list-disc pl-7 text-[9px] text-stone-600 space-y-0.5">
                  <li>यह कार्ड अहस्तांतरणीय है और ड्यूटी के दौरान साथ रखना अनिवार्य है।</li>
                  <li>दुरुपयोग की स्थिति में ट्रस्ट द्वारा तुरंत सेवा समाप्त की जा सकती है।</li>
                  <li>सेवा समाप्ति पर यह कार्ड मंदिर कार्यालय में वापस करना होगा।</li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer / Barcode & Signature */}
            <div className="bg-stone-100 px-3 py-2 border-t border-amber-300 flex justify-between items-center text-[8px]">
              <div className="space-y-0.5">
                <div className="font-mono font-bold tracking-widest text-stone-800 text-[10px]">
                  |||l|l|l|l| |||||l||l||| {staffCode}
                </div>
                <p className="text-[7px] text-stone-500">IF FOUND PLEASE RETURN TO ABOVE ADDRESS</p>
              </div>
              <div className="text-center space-y-1">
                <div className="font-serif italic font-bold text-red-950 text-[10px] border-b border-stone-400 px-3">
                  Authorized Signatory
                </div>
                <p className="text-[7px] text-stone-500 font-semibold">Managing Trustee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200">
          <button
            onClick={() => handleDownloadJpg('front')}
            disabled={isExporting}
            className="bg-red-900 hover:bg-red-950 text-amber-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>सामने की JPG</span>
          </button>
          <button
            onClick={() => handleDownloadJpg('back')}
            disabled={isExporting}
            className="bg-red-900 hover:bg-red-950 text-amber-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>पीछे की JPG</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="bg-amber-600 hover:bg-amber-700 text-red-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>PDF डाउनलोड</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={isExporting}
            className="bg-stone-800 hover:bg-stone-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट कार्ड</span>
          </button>
        </div>

      </div>
    </div>
  );
};
