import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, ZoomIn, Move, Check, RefreshCw } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (base64OrUrl: string) => void;
  label?: string;
  enableCropAndAdjust?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'तस्वीर अपलोड करें (Upload Photo)',
  enableCropAndAdjust = false
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [posX, setPosX] = useState<number>(0);
  const [posY, setPosY] = useState<number>(0);
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('कृपया 2MB से छोटी साइज की तस्वीर चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
        setZoom(1);
        setPosX(0);
        setPosY(0);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-stone-700 uppercase">{label}</label>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
        <div className="w-24 h-24 rounded-xl bg-stone-200 overflow-hidden relative border-2 border-amber-400 shrink-0 flex items-center justify-center shadow-inner">
          {value ? (
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
              <img
                src={value}
                alt="Preview"
                style={{
                  transform: `scale(${zoom}) translate(${posX}px, ${posY}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <ImageIcon className="w-8 h-8 text-stone-400" />
          )}
        </div>

        <div className="flex-1 space-y-2 w-full">
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer bg-red-900 hover:bg-red-950 text-amber-200 text-xs font-bold px-4 py-2.5 rounded-xl shadow inline-flex items-center space-x-2 transition">
              <Upload className="w-4 h-4" />
              <span>डिवाइस से चुनें (Choose File)</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            {value && enableCropAndAdjust && (
              <button
                type="button"
                onClick={() => setIsAdjusting(!isAdjusting)}
                className="bg-amber-600 hover:bg-amber-700 text-red-950 text-xs font-bold px-3 py-2.5 rounded-xl shadow inline-flex items-center space-x-1.5 transition"
              >
                <Move className="w-4 h-4" />
                <span>{isAdjusting ? 'समायोजन बंद करें' : 'क्रॉप एवं एडजस्ट करें'}</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-stone-500">
            JPG, PNG या WEBP (अधिकतम 2MB). तस्वीर स्वतः अपलोड हो जाएगी।
          </p>
        </div>
      </div>

      {enableCropAndAdjust && isAdjusting && value && (
        <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-lg space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-red-950">
            <span>मैनुअल क्रॉप एवं एडजस्टमेंट (Manual Crop & Adjust)</span>
            <button
              type="button"
              onClick={() => { setZoom(1); setPosX(0); setPosY(0); }}
              className="text-amber-700 hover:text-amber-900 flex items-center space-x-1 text-[11px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>रीसेट</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-stone-600 font-semibold">ज़ूम (Zoom): {zoom.toFixed(1)}x</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-red-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-600 font-semibold">क्षैतिज स्थिति (Move X): {posX}px</label>
              <input
                type="range"
                min="-50"
                max="50"
                value={posX}
                onChange={(e) => setPosX(parseInt(e.target.value))}
                className="w-full accent-red-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-600 font-semibold">लंबवत स्थिति (Move Y): {posY}px</label>
              <input
                type="range"
                min="-50"
                max="50"
                value={posY}
                onChange={(e) => setPosY(parseInt(e.target.value))}
                className="w-full accent-red-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
