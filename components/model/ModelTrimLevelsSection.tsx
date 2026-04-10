import { Check } from 'lucide-react';
import type { CarModel, ModelTrimLevel } from '@/types';

interface ModelTrimLevelsSectionProps {
  model: CarModel;
  trimLevels: ModelTrimLevel[];
}

export function ModelTrimLevelsSection({ model, trimLevels }: ModelTrimLevelsSectionProps) {
  if (trimLevels.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Utstyrsnivåer</h2>
      <p className="text-slate-600 mb-6">
        {model.brand_name} {model.name} leveres i følgende utstyrsnivåer:
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trimLevels.map((trim) => (
          <div
            key={trim.id}
            className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-primary-400 transition-all hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">{trim.name}</h3>

            <div className="space-y-3 mb-6">
              {trim.price_from_nok && (
                <div>
                  <div className="text-sm text-slate-600">Pris fra</div>
                  <div className="text-2xl font-bold text-primary-700">
                    {trim.price_from_nok.toLocaleString('nb-NO')} kr
                  </div>
                </div>
              )}

              {trim.range_wltp_km && (
                <div>
                  <div className="text-sm text-slate-600">Rekkevidde</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {trim.range_wltp_km} km
                  </div>
                </div>
              )}

              {trim.drivetrain && (
                <div>
                  <div className="text-sm text-slate-600">Drivlinje</div>
                  <div className="text-lg font-semibold text-slate-900">{trim.drivetrain}</div>
                </div>
              )}

              {trim.power_hp && (
                <div>
                  <div className="text-sm text-slate-600">Effekt</div>
                  <div className="text-lg font-semibold text-slate-900">{trim.power_hp} hk</div>
                </div>
              )}
            </div>

            {trim.features && trim.features.length > 0 && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-3">
                  Nøkkelfunksjoner:
                </div>
                <ul className="space-y-2">
                  {trim.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
