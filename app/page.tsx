'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { CarCard } from '@/components/CarCard';
import { LeadModal } from '@/components/LeadModal';
import { HomeFilter } from '@/components/HomeFilter';
import { ComparisonModal } from '@/components/ComparisonModal';
import type { CarModel, CarFilters } from '@/types';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function HomePage() {
  const [popularModels, setPopularModels] = useState<CarModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<CarModel[]>([]);
  const [allModels, setAllModels] = useState<CarModel[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [filters, setFilters] = useState<CarFilters>({});
  const [loading, setLoading] = useState(false);
  const [compareModels, setCompareModels] = useState<CarModel[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/models').then(res => res.json()),
      fetch('/api/brands').then(res => res.json())
    ])
      .then(([modelsData, brandsData]) => {
        setPopularModels(modelsData.slice(0, 6));
        setFilteredModels(modelsData);
        setAllModels(modelsData);
        setBrands(brandsData || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const hasFilters = Object.values(filters).some(v => v !== undefined);
    if (!hasFilters) {
      fetch('/api/models')
        .then(res => res.json())
        .then(data => setFilteredModels(data))
        .catch(console.error);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (filters.brandId) params.set('brandId', filters.brandId);
    if (filters.modelId) params.set('modelId', filters.modelId);
    if (filters.bodyType) params.set('bodyType', filters.bodyType);
    if (filters.drivetrain) params.set('drivetrain', filters.drivetrain);
    if (filters.driveType) params.set('driveType', filters.driveType);
    if (filters.minRange) params.set('minRange', filters.minRange.toString());
    if (filters.maxRange) params.set('maxRange', filters.maxRange.toString());
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minCargo) params.set('minCargo', filters.minCargo.toString());
    if (filters.maxCargo) params.set('maxCargo', filters.maxCargo.toString());
    if (filters.minTowing) params.set('minTowing', filters.minTowing.toString());
    if (filters.maxTowing) params.set('maxTowing', filters.maxTowing.toString());
    if (filters.minSeats) params.set('minSeats', filters.minSeats.toString());
    if (filters.maxSeats) params.set('maxSeats', filters.maxSeats.toString());
    if (filters.only4x4) params.set('only4x4', 'true');

    fetch(`/api/models?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setFilteredModels(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [filters]);

  const handleToggleCompare = (model: CarModel) => {
    setCompareModels(prev => {
      const exists = prev.find(m => m.id === model.id);
      if (exists) {
        return prev.filter(m => m.id !== model.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, model];
    });
  };

  const handleRemoveFromCompare = (modelId: string) => {
    setCompareModels(prev => prev.filter(m => m.id !== modelId));
  };

  return (
    <>
      <div className="bg-gradient-to-b from-blue-50 to-white py-12 md:py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Finn din neste bil
            </h1>
            <p className="text-lg md:text-xl text-slate-600">
              Sammenlign biler basert på rekkevidde, bagasjerom, hengerfeste, seter og pris.
              Få tilbud fra forhandlere i ditt område.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          <HomeFilter
            filters={filters}
            onFilterChange={setFilters}
            brands={brands}
            models={allModels}
          />
        </div>

        <section className="pb-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {Object.values(filters).some(v => v !== undefined) ? 'Søkeresultater' : 'Alle biler'}
              </h2>
              <p className="text-slate-600 mt-1">
                {loading ? 'Laster...' : `${filteredModels.length} biler funnet`}
              </p>
            </div>
            {compareModels.length > 0 && (
              <Button
                variant="primary"
                onClick={() => setShowComparison(true)}
                disabled={compareModels.length < 2}
              >
                Sammenlign ({compareModels.length})
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModels.map((model) => (
                <CarCard
                  key={model.id}
                  model={model}
                  onGetOffer={(model) => setSelectedModel(model)}
                  showCompareCheckbox
                  isSelected={compareModels.some(m => m.id === model.id)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
              {filteredModels.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-600">
                  Ingen biler funnet. Prøv å justere filtrene.
                </div>
              )}
            </div>
          )}
        </section>

        <section className="py-12 border-t border-slate-200">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Våre mest populære biler
            </h2>
            <p className="text-slate-600">
              Biler som er mest etterspurt av våre brukere
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularModels.map((model) => (
              <CarCard
                key={model.id}
                model={model}
                onGetOffer={(model) => setSelectedModel(model)}
              />
            ))}
          </div>
        </section>
      </Container>

      {selectedModel && (
        <LeadModal
          model={selectedModel}
          isOpen={true}
          onClose={() => setSelectedModel(null)}
        />
      )}

      <ComparisonModal
        models={compareModels}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onRemoveModel={handleRemoveFromCompare}
      />
    </>
  );
}
