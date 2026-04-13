'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ArticleFAQItem } from '@/types';

interface ArticleFAQAccordionProps {
  faqs: ArticleFAQItem[];
}

export function ArticleFAQAccordion({ faqs }: ArticleFAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-slate-200 border-t border-slate-200">
      {faqs.map((faq, index) => (
        <div key={index}>
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
            <div
              className="pb-4 text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
