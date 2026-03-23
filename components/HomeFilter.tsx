'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CarFilters } from '@/types';
import { BODY_TYPES, DRIVETRAINS, DRIVE_TYPES } from '@/types';
import { DualRangeSlider } from './ui/DualRangeSlider';
import { SingleRangeSlider } from './ui/SingleRangeSlider';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
}

interface HomeFilterProps {
  filters: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
  brands?: Brand[];
  models?: Model[];
}

export function HomeFilter({ filters, onFilterChange, brands = [], models = [] }: HomeFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableModels, setAvailableModels] = useState<Model[]>(models);

  // Filter models when brand changes
  useEffect(() => {
    if (filters.brandId && models.length > 0) {
      setAvailableModels(models.filter(m => m.brand_id === filters.brandId));
    } else {
      setAvailableModels(models);
    }
  }, [filters.brandId, models]);

  const handleChange = (key: keyof CarFilters, value: any) => {
    // If brand changes, clear model filter
    if (key === 'brandId' && value !== filters.brandId) {
      onFilterChange({ ...filters, brandId: value || undefined, modelId: undefined });
    } else {
      onFilterChange({ ...filters, [key]: value || undefined });
    }
  };

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({
      ...filters,
      minPrice: min > 0 ? min : undefined,
      maxPrice: max < 2000000 ? max : undefined,
    });
  };

  const handlePriceReset = () => {
    onFilterChange({
      ...filters,
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const handleRangeChange = (min: number, max: number) => {
    onFilterChange({
      ...filters,
      minRange: min > 0 ? min : undefined,
      maxRange: max < 700 ? max : undefined,
    });
  };

  const handleRangeReset = () => {
    onFilterChange({
      ...filters,
      minRange: undefined,
      maxRange: undefined,
    });
  };

  const handleCargoChange = (value: number) => {
    onFilterChange({
      ...filters,
      minCargo: value > 100 ? value : undefined,
    });
  };

  const handleCargoReset = () => {
    onFilterChange({
      ...filters,
      minCargo: undefined,
    });
  };

  const handleSeatsChange = (min: number, max: number) => {
    onFilterChange({
      ...filters,
      minSeats: min > 2 ? min : undefined,
      maxSeats: max < 9 ? max : undefined,
    });
  };

  const handleSeatsReset = () => {
    onFilterChange({
      ...filters,
      minSeats: undefined,
      maxSeats: undefined,
    });
  };

  const handleTowingChange = (value: number) => {
    onFilterChange({
      ...filters,
      minTowing: value > 0 ? value : undefined,
    });
  };

  const handleTowingReset = () => {
    onFilterChange({
      ...filters,
      minTowing: undefined,
    });
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-100 mb-2.5">
            Biltype
          </label>
          <select
            value={filters.bodyType || ''}
            onChange={(e) => handleChange('bodyType', e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          >
            <option value="">Alle</option>
            {BODY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <DualRangeSlider
            min={0}
            max={2000000}
            step={50000}
            valueMin={filters.minPrice || 0}
            valueMax={filters.maxPrice || 2000000}
            onChange={handlePriceChange}
            onReset={handlePriceReset}
            formatLabel={(val) => val.toLocaleString('nb-NO')}
            label="Pris"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-100 mb-2.5">
            Hjuldrift
          </label>
          <select
            value={filters.driveType || ''}
            onChange={(e) => handleChange('driveType', e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          >
            <option value="">Alle</option>
            {DRIVE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <DualRangeSlider
            min={0}
            max={700}
            step={25}
            valueMin={filters.minRange || 0}
            valueMax={filters.maxRange || 700}
            onChange={handleRangeChange}
            onReset={handleRangeReset}
            formatLabel={(val) => `${val}`}
            label="Rekkevidde (km WLTP)"
          />
        </div>
      </div>

      <div className="mb-3 pt-2">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          {showAdvanced ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Skjul flere filtre
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Flere filtre
            </>
          )}
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-5 border-t border-slate-700">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2.5">
              Merke
            </label>
            <select
              value={filters.brandId || ''}
              onChange={(e) => handleChange('brandId', e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="">Alle merker</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2.5">
              Modell
            </label>
            <select
              value={filters.modelId || ''}
              onChange={(e) => handleChange('modelId', e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              disabled={!!filters.brandId && availableModels.length === 0}
            >
              <option value="">Alle modeller</option>
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>

          <div>
            <SingleRangeSlider
              min={100}
              max={1500}
              step={50}
              value={filters.minCargo || 100}
              onChange={handleCargoChange}
              onReset={handleCargoReset}
              formatLabel={(val) => `${val}`}
              label="Bagasjerom (min liter)"
            />
          </div>

          <div>
            <DualRangeSlider
              min={2}
              max={9}
              step={1}
              valueMin={filters.minSeats || 2}
              valueMax={filters.maxSeats || 9}
              onChange={handleSeatsChange}
              onReset={handleSeatsReset}
              formatLabel={(val) => `${val}`}
              label="Antall seter"
            />
          </div>

          <div>
            <SingleRangeSlider
              min={0}
              max={3500}
              step={100}
              value={filters.minTowing || 0}
              onChange={handleTowingChange}
              onReset={handleTowingReset}
              formatLabel={(val) => `${val}`}
              label="Tilhengerfeste (min kg)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2.5">
              Drivlinje
            </label>
            <select
              value={filters.drivetrain || ''}
              onChange={(e) => handleChange('drivetrain', e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="">Alle</option>
              {DRIVETRAINS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
