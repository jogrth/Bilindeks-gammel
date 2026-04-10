import type { ModelFAQ } from '@/types';

interface ModelFAQSectionProps {
  faqs: ModelFAQ[];
}

export function ModelFAQSection({ faqs }: ModelFAQSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Ofte stilte spørsmål
      </h2>
      <div className="space-y-6">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white border border-slate-200 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {faq.question}
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
