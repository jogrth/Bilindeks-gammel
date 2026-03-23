'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { LeadModal } from './LeadModal';
import type { CarModel } from '@/types';

interface CarDetailClientProps {
  model: CarModel;
}

export function CarDetailClient({ model }: CarDetailClientProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="accent"
        size="lg"
        fullWidth
        onClick={() => setShowModal(true)}
      >
        Få tilbud
      </Button>

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
