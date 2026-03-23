'use client';

import { X } from 'lucide-react';
import type { CarModel } from '@/types';
import { formatPrice } from '@/lib/formatting';
import { Button } from './ui/Button';

interface ComparisonModalProps {
  models: CarModel[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveModel: (modelId: string) => void;
}

export function ComparisonModal({ models, isOpen, onClose, onRemoveModel }: ComparisonModalProps) {
  if (!isOpen || models.length === 0) return null;

  const getBestValue = (field: keyof CarModel, higher: boolean = true) => {
    const values = models
      .map(m => m[field])
      .filter(v => typeof v === 'number') as number[];

    if (values.length === 0) return null;
    return higher ? Math.max(...values) : Math.min(...values);
  };

  const isBestValue = (value: any, field: keyof CarModel, higher: boolean = true) => {
    if (typeof value !== 'number') return false;
    const best = getBestValue(field, higher);
    return best !== null && value === best;
  };

  const getFieldValue = (model: CarModel, field: keyof CarModel) => {
    const value = model[field];
    if (value === null || value === undefined) return '-';

    if (field === 'price_from_nok' && typeof value === 'number') {
      return formatPrice(value);
    }

    if (typeof value === 'number') {
      return value.toLocaleString('no-NO');
    }

    return String(value);
  };

  const rows = [
    { label: 'Modell', field: 'name' as keyof CarModel, isBest: false },
    { label: 'Merke', field: 'brand_name' as keyof CarModel, isBest: false },
    { label: 'Pris', field: 'price_from_nok' as keyof CarModel, isBest: true, lower: true },
    { label: 'Biltype', field: 'body_type' as keyof CarModel, isBest: false },
    { label: 'Drivlinje', field: 'drivetrain' as keyof CarModel, isBest: false },
    { label: 'Hjuldrift', field: 'drive_type' as keyof CarModel, isBest: false },
    { label: 'Rekkevidde (km)', field: 'range_wltp_km' as keyof CarModel, isBest: true, lower: false },
    { label: 'Bagasjerom (L)', field: 'cargo_liters' as keyof CarModel, isBest: true, lower: false },
    { label: 'Antall seter', field: 'seats_max' as keyof CarModel, isBest: true, lower: false },
    { label: 'Hengervekt (kg)', field: 'towing_kg' as keyof CarModel, isBest: true, lower: false },
    { label: 'Lading (kW)', field: 'charge_speed_kw' as keyof CarModel, isBest: true, lower: false },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Sammenlign biler</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="sticky left-0 bg-white px-6 py-4 text-left font-medium text-slate-700 border-r border-slate-200 min-w-[180px]">
                    Spesifikasjon
                  </th>
                  {models.map((model) => (
                    <th key={model.id} className="px-6 py-4 text-left min-w-[200px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900">{model.brand_name}</div>
                          <div className="text-sm text-slate-600">{model.name}</div>
                        </div>
                        <button
                          onClick={() => onRemoveModel(model.id)}
                          className="p-1 hover:bg-slate-100 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.field} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="sticky left-0 px-6 py-3 font-medium text-slate-700 border-r border-slate-200 bg-inherit">
                      {row.label}
                    </td>
                    {models.map((model) => {
                      const value = model[row.field];
                      const displayValue = getFieldValue(model, row.field);
                      const shouldHighlight = row.isBest && isBestValue(value, row.field, !row.lower);

                      return (
                        <td
                          key={model.id}
                          className={`px-6 py-3 ${
                            shouldHighlight ? 'text-green-700 font-semibold' : 'text-slate-900'
                          }`}
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
            <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
              Lukk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
