import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { NavratriDay } from '../types';
import { ImageUpload } from './ImageUpload';
import { navratriDeviImagePresets } from '../utils/seedData';
import { X, Save, Sparkles, Image as ImageIcon, Flame, BookOpen, Scroll, Clock, Gift, Award, CheckCircle } from 'lucide-react';

interface NavratriEditModalProps {
  day: NavratriDay;
  onClose: () => void;
  onSaveSuccess?: (updatedDay: NavratriDay) => void;
}

export const NavratriEditModal: React.FC<NavratriEditModalProps> = ({ day, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState<NavratriDay>({ ...day });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const presets = navratriDeviImagePresets[day.dayNumber] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docId = `day_${day.dayNumber}`;
      await setDoc(doc(db, 'navratri', docId), formData, { merge: true });
      setSuccess(true);
      if (onSaveSuccess) {
        onSaveSuccess(formData);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Error saving Navratri day:', err);
      alert('बदलाव सहेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border-4 border-amber-500 my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-100 px-6 py-4 flex items-center justify-between border-b border-amber-500 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-red-950 flex items-center justify-center font-bold text-sm shadow">
              {day.dayNumber}
            </div>
            <div>
              <h3 className="font-bold font-serif text-lg text-amber-200">
                दिन {day.dayNumber} संपादित करें: {day.deviName}
              </h3>
              <p className="text-xs text-amber-300/80">फोटो, कथा, मंत्र और पूजा विधि अपडेट करें</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {success && (
            <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>सफलतापूर्वक सहेजा गया! लाइव अपडेट लागू हो चुका है।</span>
            </div>
          )}

          {/* Basic Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                देवी का पावन नाम (Devi Name) *
              </label>
              <input
                type="text"
                required
                value={formData.deviName}
                onChange={(e) => setFormData({ ...formData, deviName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-red-950 focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                तिथि / दिन (Tithi / Date) *
              </label>
              <input
                type="text"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Image Upload & Presets */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center space-x-2 text-red-950 font-bold text-xs uppercase">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>माता की तस्वीर (Devi Photo)</span>
            </div>

            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              label="गैलरी / डिवाइस से नई फोटो अपलोड करें"
            />

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                या छवि URL पेस्ट करें:
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border text-xs font-mono text-stone-700"
              />
            </div>

            {presets.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-bold text-amber-900 mb-2">सुझाए गए पावन स्वरूप (Suggested Presets - क्लिक करें):</p>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                      className={`flex items-center space-x-2 p-2 rounded-xl border text-left text-xs transition ${
                        formData.imageUrl === preset.url
                          ? 'border-amber-600 bg-amber-100 font-bold text-red-950'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <span className="truncate text-[11px]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              संक्षिप्त परिचय (Description)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Mantra */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>सिद्ध मंत्र (Mantra)</span>
            </label>
            <input
              type="text"
              value={formData.mantra || ''}
              onChange={(e) => setFormData({ ...formData, mantra: e.target.value })}
              placeholder="ॐ देवी ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-serif font-bold text-red-900 bg-amber-50/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Katha */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1.5">
              <Scroll className="w-3.5 h-3.5 text-amber-600" />
              <span>पौराणिक कथा (Mythological Katha)</span>
            </label>
            <textarea
              rows={4}
              value={formData.katha || ''}
              onChange={(e) => setFormData({ ...formData, katha: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 leading-relaxed focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Pujan Vidhi */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>विशेष पूजन विधि (Step-by-Step Puja Vidhi)</span>
            </label>
            <textarea
              rows={4}
              value={formData.pujanVidhi || ''}
              onChange={(e) => setFormData({ ...formData, pujanVidhi: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 leading-relaxed focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Timing, Bhog, Special Program */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>पूजा समय (Timing)</span>
              </label>
              <input
                type="text"
                value={formData.timing}
                onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
                <Gift className="w-3 h-3 text-amber-600" />
                <span>भोग प्रसाद (Bhog)</span>
              </label>
              <input
                type="text"
                value={formData.bhogPrasad}
                onChange={(e) => setFormData({ ...formData, bhogPrasad: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
                <Award className="w-3 h-3 text-amber-600" />
                <span>विशेष कार्यक्रम</span>
              </label>
              <input
                type="text"
                value={formData.specialProgram}
                onChange={(e) => setFormData({ ...formData, specialProgram: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-semibold transition"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-900 to-amber-700 hover:from-red-950 hover:to-amber-800 text-amber-100 font-bold text-sm shadow-lg flex items-center space-x-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'सहेज रहे हैं...' : 'बदलाव सहेजें (Save Changes)'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
