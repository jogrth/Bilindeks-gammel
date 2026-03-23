'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { CarCard } from '@/components/CarCard';
import { Button } from '@/components/ui/Button';
import { LeadModal } from '@/components/LeadModal';
import type { CarModel, CarFilters } from '@/types';
import { BODY_TYPES, DRIVETRAINS } from '@/types';

function CarsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [models, setModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);

  const [filters, setFilters] = useState<CarFilters>({
    bodyType: searchParams.get('bodyType') || undefined,
    drivetrain: searchParams.get('drivetrain') || undefined,
    minRange: searchParams.get('minRange') ? parseInt(searchParams.get('minRange')!) : undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    minCargo: searchParams.get('minCargo') ? parseInt(searchParams.get('minCargo')!) : undefined,
    minTowing: searchParams.get('minTowing') ? parseInt(searchParams.get('minTowing')!) : undefined,
    minSeats: searchParams.get('minSeats') ? parseInt(searchParams.get('minSeats')!) : undefined,
    maxSeats: searchParams.get('maxSeats') ? parseInt(searchParams.get('maxSeats')!) : undefined,
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.bodyType) params.set('bodyType', filters.bodyType);
      if (filters.drivetrain) params.set('drivetrain', filters.drivetrain);
      if (filters.minRange) params.set('minRange', filters.minRange.toString());
      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.minCargo) params.set('minCargo', filters.minCargo.toString());
      if (filters.minTowing) params.set('minTowing', filters.minTowing.toString());
      if (filters.minSeats) params.set('minSeats', filters.minSeats.toString());
      if (filters.maxSeats) params.set('maxSeats', filters.maxSeats.toString());

      const response = await fetch(`/api/models?${params.toString()}`);
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CarFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.bodyType) params.set('bodyType', filters.bodyType);
    if (filters.drivetrain) params.set('drivetrain', filters.drivetrain);
    if (filters.minRange) params.set('minRange', filters.minRange.toString());
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minCargo) params.set('minCargo', filters.minCargo.toString());
    if (filters.minTowing) params.set('minTowing', filters.minTowing.toString());
    if (filters.minSeats) params.set('minSeats', filters.minSeats.toString());
    if (filters.maxSeats) params.set('maxSeats', filters.maxSeats.toString());

    router.push(`/cars?${params.toString()}`);
    fetchModels();
  };

  const clearFilters = () => {
    setFilters({});
    router.push('/cars');
    setTimeout(() => fetchModels(), 100);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length;

  return (
    <>
      <div className="bg-slate-50 py-8 border-b border-slate-200">
        <Container>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Utforsk biler
          </h1>
          <p className="text-slate-600 mt-2">
            {loading ? 'Laster...' : `${models.length} biler funnet`}
          </p>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Skjul filtre' : 'Vis filtre'}
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </Button>
          </div>

          {showFilters && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Karosseri
                  </label>
                  <select
                    value={filters.bodyType || ''}
                    onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option value="">Alle</option>
                    {BODY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Drivlinje
                  </label>
                  <select
                    value={filters.drivetrain || ''}
                    onChange={(e) => handleFilterChange('drivetrain', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option value="">Alle</option>
                    {DRIVETRAINS.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min. rekkevidde (km)
                  </label>
                  <input
                    type="number"
                    value={filters.minRange || ''}
                    onChange={(e) => handleFilterChange('minRange', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    placeholder="f.eks. 300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min. pris (kr)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    placeholder="f.eks. 300000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Maks. pris (kr)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    placeholder="f.eks. 800000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min. bagasjerom (liter)
                  </label>
                  <input
                    type="number"
                    value={filters.minCargo || ''}
                    onChange={(e) => handleFilterChange('minCargo', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    placeholder="f.eks. 400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min. hengerfeste (kg)
                  </label>
                  <input
                    type="number"
                    value={filters.minTowing || ''}
                    onChange={(e) => handleFilterChange('minTowing', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    placeholder="f.eks. 1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min. seter
                  </label>
                  <input
                    type="number"
                    value={filters.minSeats || ''}
                    onChange={(e) => handleFilterChange('minSeats', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    placeholder="f.eks. 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Maks. seter
                  </label>
                  <input
                    type="number"
                    value={filters.maxSeats || ''}
                    onChange={(e) => handleFilterChange('maxSeats', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    placeholder="f.eks. 7"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="primary" onClick={applyFilters}>
                  Søk
                </Button>
                <Button variant="secondary" onClick={clearFilters}>
                  Nullstill
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model) => (
                <CarCard
                  key={model.id}
                  model={model}
                  onGetOffer={(model) => setSelectedModel(model)}
                />
              ))}
              {models.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-600">
                  Ingen biler funnet. Prøv å justere filtrene.
                </div>
              )}
            </div>
          )}
        </div>
      </Container>

      {selectedModel && (
        <LeadModal
          model={selectedModel}
          isOpen={true}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="bg-slate-50 py-8 border-b border-slate-200">
          <Container>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Utforsk biler
            </h1>
            <p className="text-slate-600 mt-2">Laster...</p>
          </Container>
        </div>
        <Container>
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
          </div>
        </Container>
      </div>
    }>
      <CarsPageContent />
    </Suspense>
  );
}
