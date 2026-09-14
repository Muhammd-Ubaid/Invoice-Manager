import React from 'react';
import { Ruler } from 'lucide-react';
import { TailorMeasurement } from '../../types';

interface TailorMeasurementViewProps {
  measurements?: TailorMeasurement;
}

export const TailorMeasurementView: React.FC<TailorMeasurementViewProps> = ({ measurements }) => {
  if (!measurements) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        No tailoring measurements recorded.
      </div>
    );
  }

  const unit = measurements.unit || 'inch';
  const unitLabel = unit === 'inch' ? 'in' : 'cm';

  const currentSuits = measurements.suits || {
    shoulder: measurements.qameez?.shoulder || '',
    sleeves: measurements.qameez?.sleeveLength || '',
    length: measurements.qameez?.qameezLength || '',
    chest: measurements.qameez?.chest || '',
    chest2: '',
    waist: measurements.qameez?.waist || '',
    waist2: '',
    hips: measurements.qameez?.hip || '',
    hips2: '',
    collar: measurements.qameez?.neck || '',
    waistCoat: '',
    crossBack: '',
    bicep: '',
    bicep2: ''
  };

  const currentShalwarPant = measurements.shalwarPant || {
    length: measurements.shalwar?.shalwarLength || '',
    waist: measurements.shalwar?.waist || '',
    waist2: '',
    hips: measurements.shalwar?.hip || '',
    hips2: '',
    insideLength: '',
    tight: '',
    bottom: measurements.shalwar?.bottomPaicha || '',
    frontFly: '',
    backFly: '',
    knee: ''
  };

  const formatDualValue = (val1?: string, val2?: string) => {
    if (val1 && val2) return `${val1} / ${val2} ${unitLabel}`;
    if (val1) return `${val1} ${unitLabel}`;
    if (val2) return `${val2} ${unitLabel}`;
    return '-';
  };

  const suitsFields = [
    { label: 'SHOULDER', display: currentSuits.shoulder ? `${currentSuits.shoulder} ${unitLabel}` : '-' },
    { label: 'SLEEVES', display: currentSuits.sleeves ? `${currentSuits.sleeves} ${unitLabel}` : '-' },
    { label: 'LENGTH', display: currentSuits.length ? `${currentSuits.length} ${unitLabel}` : '-' },
    { label: 'CHEST', display: formatDualValue(currentSuits.chest, currentSuits.chest2) },
    { label: 'WAIST', display: formatDualValue(currentSuits.waist, currentSuits.waist2) },
    { label: 'HIPS', display: formatDualValue(currentSuits.hips, currentSuits.hips2) },
    { label: 'COLLAR', display: currentSuits.collar ? `${currentSuits.collar} ${unitLabel}` : '-' },
    { label: 'W/C', display: currentSuits.waistCoat ? `${currentSuits.waistCoat} ${unitLabel}` : '-' },
    { label: 'CB', display: currentSuits.crossBack ? `${currentSuits.crossBack} ${unitLabel}` : '-' },
    { label: 'BI-CEP', display: formatDualValue(currentSuits.bicep, currentSuits.bicep2) },
  ];

  const shalwarPantFields = [
    { label: 'LENGTH', display: currentShalwarPant.length ? `${currentShalwarPant.length} ${unitLabel}` : '-' },
    { label: 'WAIST', display: formatDualValue(currentShalwarPant.waist, currentShalwarPant.waist2) },
    { label: 'HIPS', display: formatDualValue(currentShalwarPant.hips, currentShalwarPant.hips2) },
    { label: 'INSIDE LENGTH', display: currentShalwarPant.insideLength ? `${currentShalwarPant.insideLength} ${unitLabel}` : '-' },
    { label: 'TIGHT', display: currentShalwarPant.tight ? `${currentShalwarPant.tight} ${unitLabel}` : '-' },
    { label: 'BOTTOM', display: currentShalwarPant.bottom ? `${currentShalwarPant.bottom} ${unitLabel}` : '-' },
    { label: 'F. FLY', display: currentShalwarPant.frontFly ? `${currentShalwarPant.frontFly} ${unitLabel}` : '-' },
    { label: 'B. FLY', display: currentShalwarPant.backFly ? `${currentShalwarPant.backFly} ${unitLabel}` : '-' },
    { label: 'KNEE', display: currentShalwarPant.knee ? `${currentShalwarPant.knee} ${unitLabel}` : '-' },
  ];

  return (
    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Tailoring Measurements Profile</h4>
            <p className="text-[10px] text-slate-400">Unit: {unit === 'inch' ? 'Inches (in)' : 'Centimeters (cm)'}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-900 text-amber-200 uppercase tracking-wide">
          Measurements
        </span>
      </div>

      {/* Suits / Sherwani / Shirts Specs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
            Suits / Sherwani / Shirts
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {suitsFields.map((f) => (
            <div key={f.label} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400">
                  <span>{f.label}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {f.display}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shalwar / Pant Specs */}
      <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
            Shalwar / Pant
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {shalwarPantFields.map((f) => (
            <div key={f.label} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400">
                  <span>{f.label}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {f.display}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {measurements.specialInstructions && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block">Stitching Notes:</span>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{measurements.specialInstructions}</p>
        </div>
      )}
    </div>
  );
};
