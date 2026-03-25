import { Battery, Zap, Users, Package, Anchor, Gauge } from 'lucide-react';
import type { CarModel } from '@/types';
import {
  formatPrice,
  formatRange,
  formatTowing,
  formatSeats,
  formatChargeSpeed,
  formatCargo,
} from '@/lib/formatting';

interface ModelSpecsGridProps {
  model: CarModel;
}

export function ModelSpecsGrid({ model }: ModelSpecsGridProps) {
  const specs = [
    {
      icon: Battery,
      label: 'Rekkevidde (WLTP)',
      value: model.range_wltp_km ? formatRange(model.range_wltp_km) : null,
      confidence: model.spec_confidence?.range_wltp_km,
    },
    {
      icon: Zap,
      label: 'Ladehastighet',
      value: model.charge_speed_kw ? formatChargeSpeed(model.charge_speed_kw) : null,
      confidence: model.spec_confidence?.charge_speed_kw,
    },
    {
      icon: Users,
      label: 'Sitteplasser',
      value: model.seats_max ? formatSeats(model.seats_min, model.seats_max) : null,
      confidence: model.spec_confidence?.seats_max,
    },
    {
      icon: Package,
      label: 'Bagasjerom',
      value: model.cargo_liters ? formatCargo(model.cargo_liters) : null,
      confidence: model.spec_confidence?.cargo_liters,
    },
    {
      icon: Anchor,
      label: 'Hengervekt',
      value: model.towing_kg ? formatTowing(model.towing_kg) : null,
      confidence: model.spec_confidence?.towing_kg,
    },
    {
      icon: Gauge,
      label: '0-100 km/t',
      value: model.acceleration_0_100 ? `${model.acceleration_0_100} sek` : null,
      confidence: model.spec_confidence?.acceleration_0_100,
    },
  ].filter(spec => spec.value);

  if (specs.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Spesifikasjoner</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {specs.map((spec, index) => {
          const Icon = spec.icon;
          const isLowConfidence = spec.confidence && spec.confidence < 0.7;

          return (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Icon className="w-6 h-6 text-primary-700" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-600 mb-1">{spec.label}</div>
                  <div className="text-xl font-bold text-slate-900">{spec.value}</div>
                  {isLowConfidence && (
                    <div className="text-xs text-amber-600 mt-1">Estimat</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
