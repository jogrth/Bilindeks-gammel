'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { LeadModal } from '@/components/LeadModal';
import type { CarModel } from '@/types';

interface ModelLeadCTAProps {
  model: CarModel;
}

export function ModelLeadCTA({ model }: ModelLeadCTAProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="my-8 p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-slate-900 mb-1">
            Interessert i {model.brand_name} {model.name}?
          </div>
          <div className="text-slate-600 text-sm">
            Få et uforpliktende tilbud fra en autorisert forhandler.
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Be om tilbud
        </button>
      </div>

      {showModal && (
        <LeadModal
          model={model}
          isOpen={true}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
