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
      <div className="my-10 rounded-2xl bg-slate-900 text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-lg font-bold mb-1">
            Interessert i {model.brand_name} {model.name}?
          </div>
          <div className="text-slate-400 text-sm">
            Få et uforpliktende tilbud fra en autorisert forhandler i ditt område.
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
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
