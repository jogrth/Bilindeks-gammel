'use client';

import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface Dealer {
  id: string;
  name: string;
  email: string;
  active: boolean;
  postcode_from: number | null;
  postcode_to: number | null;
}

interface ModelDealer {
  dealer_id: string;
  priority: number;
  dealers: Dealer;
}

interface Props {
  modelId: string;
  currentDealers: ModelDealer[];
  allDealers: Dealer[];
  onRefresh: () => void;
}

export default function ModelRoutingTab({ modelId, currentDealers, allDealers, onRefresh }: Props) {
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [newPriority, setNewPriority] = useState('1');

  const availableDealers = allDealers.filter(
    (d) => !currentDealers.some((cd) => cd.dealer_id === d.id)
  );

  const handleAddDealer = async () => {
    if (!selectedDealerId) return;

    setAdding(true);
    try {
      const response = await fetch(`/api/admin/models/${modelId}/dealers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealer_id: selectedDealerId,
          priority: parseInt(newPriority, 10),
        }),
      });

      if (!response.ok) throw new Error('Failed to add dealer');

      setSelectedDealerId('');
      setNewPriority('1');
      onRefresh();
    } catch (error) {
      console.error('Error adding dealer:', error);
      alert('Feil ved tillegg av forhandler');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveDealer = async (dealerId: string) => {
    if (!confirm('Er du sikker på at du vil fjerne denne forhandleren?')) return;

    try {
      const response = await fetch(`/api/admin/models/${modelId}/dealers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealer_id: dealerId }),
      });

      if (!response.ok) throw new Error('Failed to remove dealer');

      onRefresh();
    } catch (error) {
      console.error('Error removing dealer:', error);
      alert('Feil ved fjerning av forhandler');
    }
  };

  const handleUpdatePriority = async (dealerId: string, priority: number) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/models/${modelId}/dealers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealer_id: dealerId, priority }),
      });

      if (!response.ok) throw new Error('Failed to update priority');

      onRefresh();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Feil ved oppdatering av prioritet');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Lead routing</h3>
        <p className="text-sm text-slate-600">
          Konfigurer hvilke forhandlere som skal motta leads for denne modellen. Lavere
          prioritetstall = høyere prioritet.
        </p>
      </div>

      {currentDealers.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  Forhandler
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  E-post
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  Postnummer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  Prioritet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentDealers
                .sort((a, b) => a.priority - b.priority)
                .map((md) => (
                  <tr key={md.dealer_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {md.dealers.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{md.dealers.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {md.dealers.postcode_from && md.dealers.postcode_to
                        ? `${md.dealers.postcode_from}-${md.dealers.postcode_to}`
                        : 'Alle'}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={md.priority}
                        onChange={(e) =>
                          handleUpdatePriority(md.dealer_id, parseInt(e.target.value, 10))
                        }
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                        disabled={saving}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          md.dealers.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {md.dealers.active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemoveDealer(md.dealer_id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <p className="text-slate-600">Ingen forhandlere er koblet til denne modellen</p>
        </div>
      )}

      {availableDealers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-4">Legg til forhandler</h4>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Forhandler
              </label>
              <select
                value={selectedDealerId}
                onChange={(e) => setSelectedDealerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={adding}
              >
                <option value="">Velg forhandler</option>
                {availableDealers.map((dealer) => (
                  <option key={dealer.id} value={dealer.id}>
                    {dealer.name} {!dealer.active && '(Inaktiv)'}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Prioritet
              </label>
              <input
                type="number"
                min="1"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={adding}
              />
            </div>
            <button
              onClick={handleAddDealer}
              disabled={!selectedDealerId || adding}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Legg til
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-bold text-blue-900 mb-2">Hvordan fungerer routing?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Leads sendes til forhandlere basert på prioritet (lavest først)</li>
          <li>• Kun aktive forhandlere mottar leads</li>
          <li>• Postnummerfilter brukes hvis bruker oppgir postnummer</li>
          <li>• Alle forhandlere her vil motta e-post når noen sender inn interesse</li>
        </ul>
      </div>
    </div>
  );
}
