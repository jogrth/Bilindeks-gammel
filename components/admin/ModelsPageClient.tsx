'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import ModelsListClient from './ModelsListClient';
import AddModelsModal from './AddModelsModal';
import { useRouter } from 'next/navigation';

type Brand = {
  id: string;
  name: string;
  slug: string;
};

type Model = {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  body_type: string | null;
  drivetrain: string | null;
  drive_type: string | null;
  seats_max: number | null;
  range_wltp_km: number | null;
  charge_speed_kw: number | null;
  price_from_nok: number | null;
  image_url: string | null;
  image_storage_path: string | null;
  intro_text: string | null;
  status: string | null;
  published: boolean;
  data_quality_score: number | null;
  model_year_start: number | null;
  model_year_end: number | null;
  created_at: string;
  updated_at: string;
  brands: Brand | null;
};

interface Props {
  models: Model[];
  brands: Brand[];
  currentFilters: {
    published?: string;
    brand?: string;
    status?: string;
  };
  stats: {
    total: number;
    published: number;
    draft: number;
    needsReview: number;
  };
}

export default function ModelsPageClient({ models, brands, currentFilters, stats }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8">
        <Container>
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="text-sm text-sky-700 hover:text-sky-800 mb-2 inline-block"
              >
                ← Tilbake til dashboard
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">Modeller</h1>
              <p className="mt-2 text-slate-600">
                Administrer bilmodeller, AI-forslag og publisering
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Legg til bil
            </button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-600">Totalt</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-600">Publisert</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{stats.published}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-600">Utkast</div>
              <div className="mt-2 text-3xl font-bold text-slate-600">{stats.draft}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-600">Trenger gjennomgang</div>
              <div className="mt-2 text-3xl font-bold text-amber-600">{stats.needsReview}</div>
            </div>
          </div>

          {/* Models list */}
          <ModelsListClient
            models={models}
            brands={brands}
            currentFilters={currentFilters}
          />
        </div>
      </Container>

      <AddModelsModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
