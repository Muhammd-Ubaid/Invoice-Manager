import React from 'react';
import { Ruler } from 'lucide-react';
import { TailorMeasurement, SuitsMeasurement, ShalwarPantMeasurement } from '../../types';

interface TailorMeasurementEditorProps {
  value: TailorMeasurement;
  onChange: (updated: TailorMeasurement) => void;
}

export const defaultSuitsMeasurement: SuitsMeasurement = {
  shoulder: '',
  sleeves: '',
  length: '',
  chest: '',
  chest2: '',
  waist: '',
  waist2: '',
  hips: '',
  hips2: '',
  collar: '',
  waistCoat: '',
  crossBack: '',
  bicep: '',
  bicep2: ''
};

export const defaultShalwarPantMeasurement: ShalwarPantMeasurement = {
  length: '',
  waist: '',
  hips: '',
  insideLength: '',
  tight: '',
  bottom: '',
  frontFly: '',
  backFly: '',
  knee: ''
};

export const defaultTailorMeasurement: TailorMeasurement = {
  unit: 'inch',
  suits: defaultSuitsMeasurement,
  shalwarPant: defaultShalwarPantMeasurement,
  specialInstructions: ''
};

export const TailorMeasurementEditor: React.FC<TailorMeasurementEditorProps> = ({ value, onChange }) => {
  const currentSuits = value.suits || {
    shoulder: value.qameez?.shoulder || '',
    sleeves: value.qameez?.sleeveLength || '',
    length: value.qameez?.qameezLength || '',
    chest: value.qameez?.chest || '',
    chest2: '',
    waist: value.qameez?.waist || '',
    waist2: '',
    hips: value.qameez?.hip || '',
    hips2: '',
    collar: value.qameez?.neck || '',
    waistCoat: '',
    crossBack: '',
    bicep: '',
    bicep2: ''
  };

  const currentShalwarPant = value.shalwarPant || {
    length: value.shalwar?.shalwarLength || '',
    waist: value.shalwar?.waist || '',
    waist2: '',
    hips: value.shalwar?.hip || '',
    hips2: '',
    insideLength: '',
    tight: '',
    bottom: value.shalwar?.bottomPaicha || '',
    frontFly: '',
    backFly: '',
    knee: ''
  };

  const handleUnitChange = (unit: 'inch' | 'cm') => {
    onChange({ ...value, unit });
  };

  const handleSuitsChange = (field: keyof SuitsMeasurement, val: string) => {
    onChange({
      ...value,
      suits: {
        ...currentSuits,
        [field]: val
      }
    });
  };

  const handleShalwarPantChange = (field: keyof ShalwarPantMeasurement, val: string) => {
    onChange({
      ...value,
      shalwarPant: {
        ...currentShalwarPant,
        [field]: val
      }
    });
  };

  const handleNotesChange = (val: string) => {
    onChange({ ...value, specialInstructions: val });
  };

  const unitLabel = value.unit === 'inch' ? 'in' : 'cm';

  return (
    <div className="space-y-6 bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
      {/* Title & Unit Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Tailoring Fittings & Specifications
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Exact fitting dimensions for Suits, Sherwani, Shirts, Shalwar & Pants</p>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            type="button"
            onClick={() => handleUnitChange('inch')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              value.unit === 'inch'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Inches (in)
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange('cm')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              value.unit === 'cm'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Centimeters (cm)
          </button>
        </div>
      </div>

      {/* SECTION 1: Suits / Sherwani / Shirts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 text-xs font-black tracking-wide border border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
            <span className="uppercase">Suits / Sherwani / Shirts</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* 1. SHOULDER */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              SHOULDER
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentSuits.shoulder || ''}
                onChange={(e) => handleSuitsChange('shoulder', e.target.value)}
                placeholder="e.g. 18"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 2. SLEEVES */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              SLEEVES
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentSuits.sleeves || ''}
                onChange={(e) => handleSuitsChange('sleeves', e.target.value)}
                placeholder="e.g. 24"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 3. LENGTH */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              LENGTH
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentSuits.length || ''}
                onChange={(e) => handleSuitsChange('length', e.target.value)}
                placeholder="e.g. 40"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 4. CHEST */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              CHEST
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={currentSuits.chest || ''}
                  onChange={(e) => handleSuitsChange('chest', e.target.value)}
                  placeholder="e.g. 34"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={currentSuits.chest2 || ''}
                  onChange={(e) => handleSuitsChange('chest2', e.target.value)}
                  placeholder="e.g. 43"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
            </div>
          </div>

          {/* 5. WAIST */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              WAIST
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={currentSuits.waist || ''}
                  onChange={(e) => handleSuitsChange('waist', e.target.value)}
                  placeholder="e.g. 34"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={currentSuits.waist2 || ''}
                  onChange={(e) => handleSuitsChange('waist2', e.target.value)}
                  placeholder="e.g. 36"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
            </div>
          </div>

          {/* 6. HIPS */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              HIPS
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={currentSuits.hips || ''}
                  onChange={(e) => handleSuitsChange('hips', e.target.value)}
                  placeholder="e.g. 40"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={currentSuits.hips2 || ''}
                  onChange={(e) => handleSuitsChange('hips2', e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
            </div>
          </div>

          {/* 7. COLLAR */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              COLLAR
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentSuits.collar || ''}
                onChange={(e) => handleSuitsChange('collar', e.target.value)}
                placeholder="e.g. 15.5"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 8. W/C (Waist Coat) */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              W/C (Waist Coat)
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentSuits.waistCoat || ''}
                onChange={(e) => handleSuitsChange('waistCoat', e.target.value)}
                placeholder="e.g. 26"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 9. CB (Cross Back) */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              CB (Cross Back)
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentSuits.crossBack || ''}
                onChange={(e) => handleSuitsChange('crossBack', e.target.value)}
                placeholder="e.g. 17.5"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 10. BI-CEP */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              BI-CEP
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={currentSuits.bicep || ''}
                  onChange={(e) => handleSuitsChange('bicep', e.target.value)}
                  placeholder="e.g. 14"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={currentSuits.bicep2 || ''}
                  onChange={(e) => handleSuitsChange('bicep2', e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Shalwar / Pant */}
      <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 text-xs font-black tracking-wide border border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
            <span className="uppercase">Shalwar / Pant</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* 1. LENGTH */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              LENGTH
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentShalwarPant.length || ''}
                onChange={(e) => handleShalwarPantChange('length', e.target.value)}
                placeholder="e.g. 38"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 2. WAIST */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              WAIST
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={currentShalwarPant.waist || ''}
                  onChange={(e) => handleShalwarPantChange('waist', e.target.value)}
                  placeholder="e.g. 34"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={currentShalwarPant.waist2 || ''}
                  onChange={(e) => handleShalwarPantChange('waist2', e.target.value)}
                  placeholder="e.g. 36"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
            </div>
          </div>

          {/* 3. HIPS */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              HIPS
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={currentShalwarPant.hips || ''}
                  onChange={(e) => handleShalwarPantChange('hips', e.target.value)}
                  placeholder="e.g. 40"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={currentShalwarPant.hips2 || ''}
                  onChange={(e) => handleShalwarPantChange('hips2', e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
              </div>
            </div>
          </div>

          {/* 4. INSIDE LENGTH */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              INSIDE LENGTH
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentShalwarPant.insideLength || ''}
                onChange={(e) => handleShalwarPantChange('insideLength', e.target.value)}
                placeholder="e.g. 29"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 5. TIGHT (Thigh) */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              TIGHT (Thigh)
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentShalwarPant.tight || ''}
                onChange={(e) => handleShalwarPantChange('tight', e.target.value)}
                placeholder="e.g. 26"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 6. BOTTOM (Paicha) */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              BOTTOM
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentShalwarPant.bottom || ''}
                onChange={(e) => handleShalwarPantChange('bottom', e.target.value)}
                placeholder="e.g. 8.5"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 7. F. FLY (Front Fly) */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              F. FLY (Front)
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentShalwarPant.frontFly || ''}
                onChange={(e) => handleShalwarPantChange('frontFly', e.target.value)}
                placeholder="e.g. 11"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 8. B. FLY (Back Fly) */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              B. FLY (Back)
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentShalwarPant.backFly || ''}
                onChange={(e) => handleShalwarPantChange('backFly', e.target.value)}
                placeholder="e.g. 14"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>

          {/* 9. KNEE */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              KNEE
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentShalwarPant.knee || ''}
                onChange={(e) => handleShalwarPantChange('knee', e.target.value)}
                placeholder="e.g. 18"
                className="w-full pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{unitLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Tailoring Instructions */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Special Fitting & Stitching Instructions
        </label>
        <textarea
          rows={2}
          value={value.specialInstructions || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="e.g. Double side pockets, Sherwani collar, Slim fit requested..."
          className="w-full p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
        />
      </div>
    </div>
  );
};
