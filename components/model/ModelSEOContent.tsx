import type { ModelSEOSection } from '@/types';

interface ModelSEOContentProps {
  sections: ModelSEOSection[];
}

export function ModelSEOContent({ sections }: ModelSEOContentProps) {
  if (sections.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="prose prose-slate max-w-none">
        {sections.map((section) => (
          <div key={section.id} className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {section.heading}
            </h2>
            <div className="text-slate-700 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
