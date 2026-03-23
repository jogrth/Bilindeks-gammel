'use client';

import { useState } from 'react';
import { CarCard } from './CarCard';
import { LeadModal } from './LeadModal';
import type { CarModel } from '@/types';

interface SimilarModelsSectionProps {
  models: CarModel[];
}

export function SimilarModelsSection({ models }: SimilarModelsSectionProps) {
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);

  if (models.length === 0) {
    return null;
  }

  return (
    <>
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Lignende biler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((model) => (
            <CarCard
              key={model.id}
              model={model}
              onGetOffer={(model) => setSelectedModel(model)}
            />
          ))}
        </div>
      </section>

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
