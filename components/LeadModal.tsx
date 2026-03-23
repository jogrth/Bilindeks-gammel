'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import type { CarModel } from '@/types';
import { PURCHASE_TIMELINES, FINANCING_OPTIONS } from '@/types';

interface LeadModalProps {
  model: CarModel;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadModal({ model, isOpen, onClose }: LeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<{ merke: string; modell: string; arsmodell: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    postcode: '',
    purchaseTimeline: PURCHASE_TIMELINES[0] as string,
    financing: FINANCING_OPTIONS[0] as string,
    tradeIn: false,
    tradeInReg: '',
    tradeInMileage: '',
    message: '',
  });

  const handleLicensePlateLookup = async () => {
    if (!formData.tradeInReg || formData.tradeInReg.length < 4) {
      return;
    }

    setLookupLoading(true);
    setVehicleInfo(null);
    setError('');

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/lookup-vehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          registreringsnummer: formData.tradeInReg,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke hente kjøretøydata');
      }

      const data = await response.json();
      setVehicleInfo({
        merke: data.merke || '',
        modell: data.modell || '',
        arsmodell: data.arsmodell || '',
      });
    } catch (err) {
      console.error('[LeadModal] License plate lookup error:', err);
      setError(err instanceof Error ? err.message : 'Kunne ikke hente kjøretøydata');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Konfigurasjonsfeil');
      }

      const payload = {
        model_id: model.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        postcode: formData.postcode || '0000',
        purchase_timeline: formData.purchaseTimeline,
        financing: formData.financing,
        trade_in: formData.tradeIn,
        trade_in_reg: formData.tradeIn ? formData.tradeInReg : undefined,
        trade_in_mileage: formData.tradeIn && formData.tradeInMileage ? formData.tradeInMileage : undefined,
        message: formData.message || undefined,
      };

      console.log('[LeadModal] Submitting lead with payload:', payload);

      const response = await fetch(`${supabaseUrl}/functions/v1/submit-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('[LeadModal] Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('[LeadModal] Error response:', errorData);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || 'Kunne ikke sende forespørsel');
      }

      const result = await response.json();
      console.log('[LeadModal] Success response:', result);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          postcode: '',
          purchaseTimeline: PURCHASE_TIMELINES[0],
          financing: FINANCING_OPTIONS[0],
          tradeIn: false,
          tradeInReg: '',
          tradeInMileage: '',
          message: '',
        });
      }, 2000);
    } catch (err) {
      console.error('[LeadModal] Error:', err);
      setError(err instanceof Error ? err.message : 'Noe gikk galt');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Takk!</h3>
          <p className="text-slate-600">
            Vi har mottatt din forespørsel og en forhandler vil kontakte deg snart.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Få tilbud på {model.brand_name} {model.name}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Navn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-post <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Postnummer
              </label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kjøpstidspunkt <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.purchaseTimeline}
                onChange={(e) => setFormData({ ...formData, purchaseTimeline: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                {PURCHASE_TIMELINES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Finansiering <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.financing}
                onChange={(e) => setFormData({ ...formData, financing: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                {FINANCING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.tradeIn}
                onChange={(e) => setFormData({ ...formData, tradeIn: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 mr-2"
              />
              <span className="text-sm font-medium text-slate-700">
                Jeg har innbytte
              </span>
            </label>
          </div>

          {formData.tradeIn && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Registreringsnummer
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.tradeInReg}
                      onChange={(e) => {
                        setFormData({ ...formData, tradeInReg: e.target.value });
                        setVehicleInfo(null);
                      }}
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2"
                      placeholder="AB12345"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleLicensePlateLookup}
                      disabled={lookupLoading || !formData.tradeInReg || formData.tradeInReg.length < 4}
                    >
                      {lookupLoading ? 'Søker...' : 'Søk'}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kilometerstand
                  </label>
                  <input
                    type="number"
                    value={formData.tradeInMileage}
                    onChange={(e) => setFormData({ ...formData, tradeInMileage: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    placeholder="50000"
                  />
                </div>
              </div>

              {vehicleInfo && (vehicleInfo.merke || vehicleInfo.modell || vehicleInfo.arsmodell) && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Kjøretøyinformasjon</h4>
                  <div className="text-sm text-slate-700 space-y-1">
                    {vehicleInfo.merke && <p><span className="font-medium">Merke:</span> {vehicleInfo.merke}</p>}
                    {vehicleInfo.modell && <p><span className="font-medium">Modell:</span> {vehicleInfo.modell}</p>}
                    {vehicleInfo.arsmodell && <p><span className="font-medium">Årsmodell:</span> {vehicleInfo.arsmodell}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Melding
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              placeholder="Er det noe spesielt du lurer på?"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Sender...' : 'Send forespørsel'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Avbryt
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
