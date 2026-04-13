'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ModelFAQ } from '@/types';

interface ModelFAQSectionProps {
  faqs: ModelFAQ[];
}

export function ModelFAQSection({ faqs }: ModelFAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Ofte stilte spørsmål
      </h2>
      <div className="divide-y divide-slate-200 border-t border-slate-200">
        {faqs.map((faq, index) => (
          <div key={faq.id}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="pb-4 text-slate-700 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
