'use client';

import { useState } from 'react';
import { RefreshCw, Pin, X } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/formatting';

interface Model {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  price_from_nok: number | null;
  range_wltp_km: number | null;
  body_type: string | null;
  brands: {
    name: string;
  };
}

interface SimilarModel {
  similar_model_id: string;
  similarity_score: number;
  is_pinned: boolean;
  models: Model;
}

interface Props {
  modelId: string;
  similarModels: SimilarModel[];
  onRefresh: () => void;
}

export default function ModelSimilarTab({ modelId, similarModels, onRefresh }: Props) {
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!confirm('Dette vil regenerere alle lignende biler basert på algoritmen. Fortsette?'))
      return;

    setRegenerating(true);
    try {
      const response = await fetch(`/api/admin/models/${modelId}/similar`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to regenerate');

      onRefresh();
      alert('Lignende biler regenerert');
    } catch (error) {
      console.error('Error regenerating:', error);
      alert('Feil ved regenerering');
    } finally {
      setRegenerating(false);
    }
  };

  const handleTogglePin = async (similarModelId: string, currentlyPinned: boolean) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}/similar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          similar_model_id: similarModelId,
          is_pinned: !currentlyPinned,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle pin');

      onRefresh();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Feil ved oppdatering');
    }
  };

  const handleRemove = async (similarModelId: string) => {
    if (!confirm('Er du sikker på at du vil fjerne denne koblingen?')) return;

    try {
      const response = await fetch(`/api/admin/models/${modelId}/similar`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ similar_model_id: similarModelId }),
      });

      if (!response.ok) throw new Error('Failed to remove');

      onRefresh();
    } catch (error) {
      console.error('Error removing:', error);
      alert('Feil ved fjerning');
    }
  };

  const sortedModels = [...similarModels].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return b.similarity_score - a.similarity_score;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Lignende biler</h3>
          <p className="text-sm text-slate-600">
            Automatisk genererte forslag basert på spesifikasjoner og prisklasse
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerer
        </button>
      </div>

      {similarModels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedModels.map((sm) => (
            <div
              key={sm.similar_model_id}
              className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden hover:border-blue-300 transition"
            >
              <div className="flex gap-4 p-4">
                <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {sm.models.image_url && (
                    <Image
                      src={sm.models.image_url}
                      alt={sm.models.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {sm.models.brands.name} {sm.models.name}
                      </h4>
                      <p className="text-xs text-slate-500">{sm.models.body_type}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleTogglePin(sm.similar_model_id, sm.is_pinned)}
                        className={`p-1 rounded transition ${
                          sm.is_pinned
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title={sm.is_pinned ? 'Fjern pin' : 'Pin til toppen'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(sm.similar_model_id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Fjern"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    {sm.models.price_from_nok && (
                      <p className="text-slate-600">
                        Fra {formatPrice(sm.models.price_from_nok)}
                      </p>
                    )}
                    {sm.models.range_wltp_km && (
                      <p className="text-slate-600">Rekkevidde: {sm.models.range_wltp_km} km</p>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${sm.similarity_score}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      {Math.round(sm.similarity_score)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
          <p className="text-slate-600 mb-4">Ingen lignende biler funnet</p>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            Generer forslag
          </button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-bold text-blue-900 mb-2">Om algoritmen</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sammenligner karosseritype, pris, rekkevidde og drivlinje</li>
          <li>• Scorer fra 0-100% basert på likhet</li>
          <li>• Kun biler med score ≥30% vises</li>
          <li>• Pinnede biler vises alltid øverst</li>
        </ul>
      </div>
    </div>
  );
}
