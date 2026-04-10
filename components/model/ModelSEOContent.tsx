import type { ModelSEOSection, CarModel } from '@/types';
import { ModelLeadCTA } from './ModelLeadCTA';

interface ModelSEOContentProps {
  sections: ModelSEOSection[];
  model: CarModel;
}

const SECTION_ACCENTS: Record<string, string> = {
  om: 'border-l-sky-400',
  ytelse: 'border-l-emerald-400',
  lading: 'border-l-amber-400',
  design: 'border-l-rose-400',
  teknologi: 'border-l-blue-400',
  sikkerhet: 'border-l-green-400',
  plass: 'border-l-teal-400',
  komfort: 'border-l-orange-400',
};

function getBorderColor(heading: string): string {
  const lower = heading.toLowerCase();
  for (const [key, value] of Object.entries(SECTION_ACCENTS)) {
    if (lower.includes(key)) return value;
  }
  return 'border-l-slate-300';
}

export function ModelSEOContent({ sections, model }: ModelSEOContentProps) {
  if (sections.length === 0) return null;

  const midpoint = Math.max(1, Math.floor(sections.length / 2));

  return (
    <div className="mb-12">
      {sections.map((section, index) => {
        const borderColor = getBorderColor(section.heading);
        const isFirst = index === 0;

        return (
          <div key={section.id}>
            {isFirst ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {section.heading}
                </h2>
                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ) : (
              <div className={'border-l-4 ' + borderColor + ' pl-6 mb-8'}>
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  {section.heading}
                </h2>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            )}

            {index === midpoint - 1 && (
              <ModelLeadCTA model={model} />
            )}

            {index < sections.length - 1 && index !== midpoint - 1 && !isFirst && (
              <hr className="border-slate-100 mb-8" />
            )}
          </div>
        );
      })}
    </div>
  );
}
