import type { ModelSEOSection, CarModel } from '@/types';
import { ModelLeadCTA } from './ModelLeadCTA';

interface ModelSEOContentProps {
  sections: ModelSEOSection[];
  model: CarModel;
}

export function ModelSEOContent({ sections, model }: ModelSEOContentProps) {
  if (sections.length === 0) return null;

  const midpoint = Math.max(1, Math.floor(sections.length / 2));

  return (
    <div className="mb-12 max-w-3xl">
      {sections.map((section, index) => (
        <div key={section.id}>
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {section.heading}
            </h2>
            <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">
              {section.content}
            </p>
          </div>

          {index === midpoint - 1 && (
            <ModelLeadCTA model={model} />
          )}
        </div>
      ))}
    </div>
  );
}
