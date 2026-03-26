'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/formatting';
import { ChevronDown, ChevronUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle, ExternalLink, Eye, Trash2 } from 'lucide-react';

type Brand = {
  id: string;
  name: string;
  slug: string;
};

type Model = {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  body_type: string | null;
  drivetrain: string | null;
  drive_type: string | null;
  seats_max: number | null;
  range_wltp_km: number | null;
  charge_speed_kw: number | null;
  price_from_nok: number | null;
  image_url: string | null;
  image_storage_path: string | null;
  intro_text: string | null;
  status: string | null;
  review_status: string;
  quality_score: number | null;
  enrichment_source: string | null;
  enrichment_confidence: number | null;
  enrichment_notes: string | null;
  model_year_start: number | null;
  model_year_end: number | null;
  created_at: string;
  updated_at: string;
  brands: Brand | null;
};

type Props = {
  models: Model[];
  brands: Brand[];
  currentFilters: {
    published?: string;
    brand?: string;
    status?: string;
  };
};

export default function ModelsListClient({ models, brands, currentFilters }: Props) {
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams();

    Object.entries(currentFilters).forEach(([key, val]) => {
      if (val && key !== filterType) {
        params.set(key, val);
      }
    });

    if (value && value !== 'all') {
      params.set(filterType, value);
    }

    router.push(`/admin/models?${params.toString()}`);
  };

  const toggleRow = (modelId: string) => {
    setExpandedRow(expandedRow === modelId ? null : modelId);
  };

  const getDataQualityColor = (score: number | null) => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getDataQualityLabel = (score: number | null) => {
    if (!score) return 'Ingen data';
    if (score >= 80) return 'God';
    if (score >= 60) return 'Middels';
    return 'Mangler data';
  };

  const getEnrichmentSourceLabel = (source: string | null) => {
    if (!source || source === 'manual') return null;
    const labels: Record<string, string> = {
      known_dataset: 'Database',
      openai_generated: 'OpenAI',
      generic_fallback: 'Fallback',
      ai_generated: 'AI',
      external_api: 'API',
      partial: 'Delvis',
    };
    return labels[source] || source;
  };

  const getEnrichmentSourceColor = (source: string | null) => {
    const colors: Record<string, string> = {
      known_dataset: 'bg-blue-100 text-blue-700',
      openai_generated: 'bg-purple-100 text-purple-700',
      generic_fallback: 'bg-amber-100 text-amber-700',
      ai_generated: 'bg-purple-100 text-purple-700',
      external_api: 'bg-green-100 text-green-700',
      partial: 'bg-amber-100 text-amber-700',
    };
    return colors[source || ''] || 'bg-slate-100 text-slate-700';
  };

  const handleDelete = async (modelId: string, modelName: string) => {
    if (!confirm(`Er du sikker på at du vil slette "${modelName}"? Denne handlingen kan ikke angres.`)) {
      return;
    }

    setDeleting(modelId);
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete model');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Feil ved sletting av modell');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Filters */}
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Publiseringsstatus
            </label>
            <select
              value={currentFilters.published || 'all'}
              onChange={(e) => handleFilterChange('published', e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
            >
              <option value="all">Alle</option>
              <option value="true">Publisert</option>
              <option value="false">Upublisert</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Merke</label>
            <select
              value={currentFilters.brand || 'all'}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
            >
              <option value="all">Alle merker</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select
              value={currentFilters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
            >
              <option value="all">Alle statuser</option>
              <option value="draft">Draft</option>
              <option value="needs_review">Needs Review</option>
              <option value="published">Published</option>
              <option value="ingesting">Ingesting</option>
              <option value="error">Error</option>
            </select>
          </div>

          {(currentFilters.published || currentFilters.brand || currentFilters.status) && (
            <div className="flex items-end">
              <button
                onClick={() => router.push('/admin/models')}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Nullstill filtre
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-8 px-3 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Bil
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                År
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Kilde
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Datakvalitet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Publisert
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Sist oppdatert
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {models.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  Ingen modeller funnet
                </td>
              </tr>
            ) : (
              models.map((model) => (
                <>
                  <tr
                    key={model.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => toggleRow(model.id)}
                  >
                    <td className="px-3 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(model.id);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {expandedRow === model.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {(model.image_url || model.image_storage_path) && (
                          <div className="h-12 w-20 flex-shrink-0 relative mr-3 rounded overflow-hidden bg-slate-100">
                            <Image
                              src={model.image_url || '/placeholder-car.jpg'}
                              alt={model.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {model.brands?.name} {model.name}
                          </div>
                          <div className="text-xs text-slate-500">{model.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {model.model_year_start
                        ? model.model_year_end
                          ? `${model.model_year_start}-${model.model_year_end}`
                          : `${model.model_year_start}-`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          model.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : model.status === 'needs_review'
                            ? 'bg-amber-100 text-amber-800'
                            : model.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {model.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEnrichmentSourceLabel(model.enrichment_source) && (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEnrichmentSourceColor(
                            model.enrichment_source
                          )}`}
                          title={model.enrichment_notes || ''}
                        >
                          {getEnrichmentSourceLabel(model.enrichment_source)}
                          {model.enrichment_confidence && (model.enrichment_source === 'ai_generated' || model.enrichment_source === 'openai_generated' || model.enrichment_source === 'generic_fallback') && (
                            <span className="ml-1 opacity-75">
                              {Math.round(model.enrichment_confidence * 100)}%
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-medium ${getDataQualityColor(
                            model.quality_score
                          )}`}
                        >
                          {model.quality_score || 0}%
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          {getDataQualityLabel(model.quality_score)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {model.review_status === 'published' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(model.updated_at).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/cars/${model.brands?.slug}-${model.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                          title="Se modellside"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/models/${model.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
                        >
                          Rediger
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(model.id, `${model.brands?.name} ${model.name}`);
                          }}
                          disabled={deleting === model.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Slett modell"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === model.id && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 bg-slate-50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs font-medium text-slate-500">Karosseri</div>
                            <div className="mt-1 text-sm text-slate-900">
                              {model.body_type || '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-500">Drivlinje</div>
                            <div className="mt-1 text-sm text-slate-900">
                              {model.drivetrain || '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-500">Rekkevidde</div>
                            <div className="mt-1 text-sm text-slate-900">
                              {model.range_wltp_km ? `${model.range_wltp_km} km` : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-500">Pris fra</div>
                            <div className="mt-1 text-sm text-slate-900">
                              {formatPrice(model.price_from_nok)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-500">Ladehastighet</div>
                            <div className="mt-1 text-sm text-slate-900">
                              {model.charge_speed_kw ? `${model.charge_speed_kw} kW` : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-500">Seter</div>
                            <div className="mt-1 text-sm text-slate-900">
                              {model.seats_max || '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-500">Hjuldrift</div>
                            <div className="mt-1 text-sm text-slate-900">
                              {model.drive_type || '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-500">Opprettet</div>
                            <div className="mt-1 text-sm text-slate-900">
                              {new Date(model.created_at).toLocaleDateString('nb-NO')}
                            </div>
                          </div>
                        </div>
                        {model.intro_text && (
                          <div className="mt-4">
                            <div className="text-xs font-medium text-slate-500">Intro-tekst</div>
                            <div className="mt-1 text-sm text-slate-700 line-clamp-2">
                              {model.intro_text}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
