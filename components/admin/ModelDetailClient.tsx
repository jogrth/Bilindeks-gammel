'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Sparkles, CircleCheck as CheckCircle, Circle as XCircle, Upload, Image as ImageIcon, Save, Eye, EyeOff } from 'lucide-react';
import { formatPrice } from '@/lib/formatting';
import ModelRoutingTab from './ModelRoutingTab';
import ModelSimilarTab from './ModelSimilarTab';

type Model = any;
type Dealer = any;
type SimilarModel = any;

type Tab = 'basic' | 'specs' | 'ai-content' | 'images' | 'publish' | 'routing' | 'similar';

type Props = {
  model: Model;
  dealers: Dealer[];
  allDealers: Dealer[];
  similarModels: SimilarModel[];
  allModels: Model[];
};

export default function ModelDetailClient({
  model: initialModel,
  dealers: initialDealers,
  allDealers,
  similarModels: initialSimilarModels,
  allModels,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [model, setModel] = useState(initialModel);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: model.name || '',
    intro_text: model.intro_text || '',
    ai_intro_text: model.ai_intro_text || '',
    body_type: model.body_type || '',
    drivetrain: model.drivetrain || '',
    drive_type: model.drive_type || '',
    seats_min: model.seats_min || '',
    seats_max: model.seats_max || '',
    cargo_liters: model.cargo_liters || '',
    towing_kg: model.towing_kg || '',
    range_wltp_km: model.range_wltp_km || '',
    charge_speed_kw: model.charge_speed_kw || '',
    price_from_nok: model.price_from_nok || '',
    model_year_start: model.model_year_start || '',
    model_year_end: model.model_year_end || '',
    review_notes: model.review_notes || '',
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'basic', label: 'Grunnleggende' },
    { id: 'specs', label: 'Spesifikasjoner' },
    { id: 'ai-content', label: 'AI-innhold' },
    { id: 'images', label: 'Bilder' },
    { id: 'publish', label: 'Publisering' },
    { id: 'routing', label: 'Lead routing' },
    { id: 'similar', label: 'Lignende biler' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/models/${model.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save');

      alert('Endringer lagret');
      router.refresh();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Feil ved lagring');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Er du sikker på at du vil publisere denne modellen?')) return;

    try {
      const response = await fetch(`/api/admin/models/${model.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: true, status: 'published' }),
      });

      if (!response.ok) throw new Error('Failed to publish');

      alert('Modellen er publisert');
      router.refresh();
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Feil ved publisering');
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Er du sikker på at du vil avpublisere denne modellen?')) return;

    try {
      const response = await fetch(`/api/admin/models/${model.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: false, status: 'draft' }),
      });

      if (!response.ok) throw new Error('Failed to unpublish');

      alert('Modellen er avpublisert');
      router.refresh();
    } catch (error) {
      console.error('Error unpublishing:', error);
      alert('Feil ved avpublisering');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Filen er for stor. Maks 10MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('modelId', model.id);

      const response = await fetch('/api/admin/models/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setImagePreview(data.url);
      alert('Bilde lastet opp');
      router.refresh();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Feil ved opplasting av bilde');
    } finally {
      setUploading(false);
    }
  };

  const acceptAISuggestion = (field: string, value: any) => {
    handleInputChange(field, value);
  };

  const dataQualityColor =
    (model.data_quality_score || 0) >= 80
      ? 'text-green-600'
      : (model.data_quality_score || 0) >= 60
      ? 'text-amber-600'
      : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm font-medium text-slate-600">Status</div>
            <div className="mt-1">
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  model.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : model.status === 'needs_review'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {model.status}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600">Publisert</div>
            <div className="mt-2">
              {model.published ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-slate-400" />
              )}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600">Datakvalitet</div>
            <div className={`mt-1 text-2xl font-bold ${dataQualityColor}`}>
              {model.data_quality_score || 0}%
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600">Sist oppdatert</div>
            <div className="mt-1 text-sm text-slate-900">
              {new Date(model.updated_at).toLocaleDateString('nb-NO')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-700 text-sky-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Modellnavn
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modellår fra
                  </label>
                  <input
                    type="number"
                    value={formData.model_year_start}
                    onChange={(e) => handleInputChange('model_year_start', e.target.value)}
                    placeholder="2023"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modellår til
                  </label>
                  <input
                    type="number"
                    value={formData.model_year_end}
                    onChange={(e) => handleInputChange('model_year_end', e.target.value)}
                    placeholder="La stå tom for pågående"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gjennomgangsnotater
                </label>
                <textarea
                  value={formData.review_notes}
                  onChange={(e) => handleInputChange('review_notes', e.target.value)}
                  rows={4}
                  placeholder="Interne notater for gjennomgang..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} variant="primary" disabled={saving}>
                  {saving ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
              </div>
            </div>
          )}

          {/* Specs Tab */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Karosseri
                  </label>
                  <input
                    type="text"
                    value={formData.body_type}
                    onChange={(e) => handleInputChange('body_type', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Drivlinje
                  </label>
                  <input
                    type="text"
                    value={formData.drivetrain}
                    onChange={(e) => handleInputChange('drivetrain', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hjuldrift
                  </label>
                  <input
                    type="text"
                    value={formData.drive_type}
                    onChange={(e) => handleInputChange('drive_type', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pris fra (NOK)
                  </label>
                  <input
                    type="number"
                    value={formData.price_from_nok}
                    onChange={(e) => handleInputChange('price_from_nok', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rekkevidde WLTP (km)
                  </label>
                  <input
                    type="number"
                    value={formData.range_wltp_km}
                    onChange={(e) => handleInputChange('range_wltp_km', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ladehastighet (kW)
                  </label>
                  <input
                    type="number"
                    value={formData.charge_speed_kw}
                    onChange={(e) => handleInputChange('charge_speed_kw', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Seter (min)
                  </label>
                  <input
                    type="number"
                    value={formData.seats_min}
                    onChange={(e) => handleInputChange('seats_min', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Seter (maks)
                  </label>
                  <input
                    type="number"
                    value={formData.seats_max}
                    onChange={(e) => handleInputChange('seats_max', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bagasjerom (liter)
                  </label>
                  <input
                    type="number"
                    value={formData.cargo_liters}
                    onChange={(e) => handleInputChange('cargo_liters', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hengerfeste (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.towing_kg}
                    onChange={(e) => handleInputChange('towing_kg', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} variant="primary" disabled={saving}>
                  {saving ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
              </div>
            </div>
          )}

          {/* AI Content Tab */}
          {activeTab === 'ai-content' && (
            <div className="space-y-6">
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-sky-700 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sky-900">AI-assistert innhold</h3>
                    <p className="text-sm text-sky-700 mt-1">
                      Se AI-genererte forslag og godkjenn eller overstyr manuelt.
                    </p>
                  </div>
                </div>
              </div>

              {/* Intro Text */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Intro-tekst
                </label>
                <textarea
                  value={formData.intro_text}
                  onChange={(e) => handleInputChange('intro_text', e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  placeholder="Skriv eller bruk AI-forslag..."
                />
                {model.ai_intro_text && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-700" />
                        <span className="text-sm font-medium text-amber-900">AI-forslag</span>
                      </div>
                      <button
                        onClick={() => acceptAISuggestion('intro_text', model.ai_intro_text)}
                        className="text-xs text-sky-700 hover:text-sky-800 font-medium"
                      >
                        Bruk dette
                      </button>
                    </div>
                    <p className="text-sm text-amber-800">{model.ai_intro_text}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} variant="primary" disabled={saving}>
                  {saving ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">Hovedbilde</h3>
                {(model.image_url || imagePreview) && (
                  <div className="mb-4 relative w-full max-w-2xl h-64 rounded-lg overflow-hidden bg-slate-100">
                    <Image
                      src={imagePreview || model.image_url}
                      alt={model.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-sky-500 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {uploading ? (
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-700"></div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-slate-400 mb-3" />
                        <span className="text-sm font-medium text-slate-900">
                          Last opp nytt bilde
                        </span>
                        <span className="text-xs text-slate-500 mt-1">
                          PNG, JPG, WebP opptil 10MB
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Publish Tab */}
          {activeTab === 'publish' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Publiseringsstatus</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Publisert</div>
                      <div className="text-sm text-slate-600">
                        {model.published
                          ? 'Modellen er synlig for brukere'
                          : 'Modellen er skjult for brukere'}
                      </div>
                    </div>
                    <div>
                      {model.published ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Datakvalitet</div>
                      <div className="text-sm text-slate-600">
                        {model.data_quality_score >= 80
                          ? 'God datakvalitet'
                          : model.data_quality_score >= 60
                          ? 'Middels datakvalitet - vurder å fylle ut flere felt'
                          : 'Lav datakvalitet - fyll ut flere felt før publisering'}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${dataQualityColor}`}>
                      {model.data_quality_score}%
                    </div>
                  </div>

                  {(model as any).enrichment_source && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">Data-kilde</div>
                        <div className="text-sm text-slate-600">
                          {(model as any).enrichment_source === 'known_dataset' && 'Kuratert database'}
                          {(model as any).enrichment_source === 'openai_generated' && 'OpenAI-generert'}
                          {(model as any).enrichment_source === 'generic_fallback' && 'Generisk fallback'}
                          {(model as any).enrichment_source === 'ai_generated' && 'AI-generert'}
                          {(model as any).enrichment_source === 'external_api' && 'Ekstern API'}
                          {(model as any).enrichment_source === 'partial' && 'Delvis automatisk'}
                          {(model as any).enrichment_notes && (
                            <div className="mt-1 text-xs text-slate-500">
                              {(model as any).enrichment_notes}
                            </div>
                          )}
                        </div>
                      </div>
                      {(model as any).enrichment_confidence && (
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round((model as any).enrichment_confidence * 100)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-4">
                  {model.published ? (
                    <Button onClick={handleUnpublish} variant="secondary">
                      <EyeOff className="w-4 h-4 mr-2" />
                      Avpubliser
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePublish}
                      variant="primary"
                      disabled={model.data_quality_score < 60}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Publiser modell
                    </Button>
                  )}
                </div>

                {model.data_quality_score < 60 && !model.published && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      Datakvaliteten er for lav til å publisere. Fyll ut flere felt for å øke
                      kvaliteten.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'routing' && (
            <ModelRoutingTab
              modelId={model.id}
              currentDealers={initialDealers}
              allDealers={allDealers}
              onRefresh={() => router.refresh()}
            />
          )}

          {activeTab === 'similar' && (
            <ModelSimilarTab
              modelId={model.id}
              similarModels={initialSimilarModels}
              onRefresh={() => router.refresh()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
