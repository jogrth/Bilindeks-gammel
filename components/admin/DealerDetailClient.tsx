'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { updateDealer, linkDealerToModel, unlinkDealerFromModel } from '@/lib/actions/dealers';

interface DealerDetailClientProps {
  params: Promise<{ id: string }>;
}

export default function DealerDetailClient({ params }: DealerDetailClientProps) {
  const { id } = use(params);
  const [dealer, setDealer] = useState<any>(null);
  const [linkedModels, setLinkedModels] = useState<any[]>([]);
  const [allModels, setAllModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dealerRes, modelsRes] = await Promise.all([
        fetch(`/api/admin/dealers/${id}`),
        fetch('/api/models'),
      ]);

      const dealerData = await dealerRes.json();
      const allModelsData = await modelsRes.json();

      setDealer(dealerData.dealer);
      setLinkedModels(dealerData.models || []);
      setAllModels(allModelsData.filter((m: any) => m.review_status === 'published' && !m.deleted_at));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDealer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await updateDealer(id, formData);
      setEditMode(false);
      fetchData();
    } catch (error) {
      console.error('Error updating dealer:', error);
      alert('Feil ved oppdatering av forhandler');
    }
  };

  const handleAddModel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const modelId = formData.get('model_id') as string;
    const priority = parseInt(formData.get('priority') as string) || 1;

    try {
      await linkDealerToModel(id, modelId, priority);
      setShowAddModelModal(false);
      fetchData();
    } catch (error) {
      console.error('Error linking model:', error);
      alert('Feil ved tilkobling av modell');
    }
  };

  const handleRemoveModel = async (modelId: string) => {
    if (!confirm('Er du sikker på at du vil fjerne denne modellen?')) return;

    try {
      await unlinkDealerFromModel(id, modelId);
      fetchData();
    } catch (error) {
      console.error('Error removing model:', error);
      alert('Feil ved fjerning av modell');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Forhandler ikke funnet</h1>
          <Link href="/admin/dealers" className="text-sky-700 hover:text-sky-800">
            ← Tilbake til forhandlere
          </Link>
        </div>
      </div>
    );
  }

  const availableModels = allModels.filter(
    (m) => !linkedModels.some((lm) => lm.id === m.id)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8">
        <Container>
          <Link href="/admin/dealers" className="text-sm text-sky-700 hover:text-sky-800 mb-2 inline-block">
            ← Tilbake til forhandlere
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">{dealer.name}</h1>
        </Container>
      </div>

      <Container>
        <div className="py-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Forhandlerdetaljer</h2>
              {!editMode && (
                <Button variant="secondary" onClick={() => setEditMode(true)}>
                  Rediger
                </Button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSaveDealer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Navn <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={dealer.name}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-post <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={dealer.email}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={dealer.phone || ''}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Merke
                  </label>
                  <input
                    type="text"
                    name="brand"
                    defaultValue={dealer.brand || ''}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Postnummer-område
                  </label>
                  <input
                    type="text"
                    name="postcode_area"
                    defaultValue={dealer.postcode_area || ''}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pris per lead (kr)
                  </label>
                  <input
                    type="number"
                    name="price_per_lead"
                    defaultValue={dealer.price_per_lead || ''}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    value="true"
                    defaultChecked={dealer.active}
                    className="rounded border-slate-300 text-sky-700 focus:ring-sky-700"
                  />
                  <label className="ml-2 text-sm text-slate-700">
                    Aktiv
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" variant="primary">
                    Lagre endringer
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Avbryt
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600">E-post</div>
                  <div className="text-base text-slate-900">{dealer.email}</div>
                </div>
                {dealer.phone && (
                  <div>
                    <div className="text-sm text-slate-600">Telefon</div>
                    <div className="text-base text-slate-900">{dealer.phone}</div>
                  </div>
                )}
                {dealer.brand && (
                  <div>
                    <div className="text-sm text-slate-600">Merke</div>
                    <div className="text-base text-slate-900">{dealer.brand}</div>
                  </div>
                )}
                {dealer.postcode_area && (
                  <div>
                    <div className="text-sm text-slate-600">Postnummer-område</div>
                    <div className="text-base text-slate-900">{dealer.postcode_area}</div>
                  </div>
                )}
                {dealer.price_per_lead && (
                  <div>
                    <div className="text-sm text-slate-600">Pris per lead</div>
                    <div className="text-base text-slate-900">{dealer.price_per_lead} kr</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-slate-600">Status</div>
                  <div className="text-base text-slate-900">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        dealer.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {dealer.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Tilknyttede modeller</h2>
              <Button variant="primary" onClick={() => setShowAddModelModal(true)}>
                Legg til modell
              </Button>
            </div>

            {linkedModels.length === 0 ? (
              <p className="text-slate-600 text-center py-8">Ingen modeller tilknyttet ennå</p>
            ) : (
              <div className="space-y-3">
                {linkedModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {model.brands?.name} {model.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        Prioritet: {model.model_dealers?.[0]?.priority || 1}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveModel(model.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Fjern
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>

      {showAddModelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Legg til modell</h2>
            </div>

            <form onSubmit={handleAddModel} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Velg modell <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="model_id"
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option value="">Velg en modell...</option>
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.brands?.name} {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prioritet
                  </label>
                  <input
                    type="number"
                    name="priority"
                    defaultValue="1"
                    min="1"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Lavere tall = høyere prioritet (får leads først)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" variant="primary">
                  Legg til
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModelModal(false)}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
