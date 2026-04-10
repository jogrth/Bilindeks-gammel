import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { CarDetailClient } from '@/components/CarDetailClient';
import { SimilarModelsSection } from '@/components/SimilarModelsSection';
import type { CarModel, ModelImage, ModelTrimLevel, ModelFAQ, ModelSEOSection } from '@/types';
import { ModelHeroSection } from './ModelHeroSection';
import { ModelSpecsGrid } from './ModelSpecsGrid';
import { ModelTrimLevelsSection } from './ModelTrimLevelsSection';
import { ModelSEOContent } from './ModelSEOContent';
import { ModelFAQSection } from './ModelFAQSection';

interface EnrichedModelPageProps {
  model: CarModel;
  images: ModelImage[];
  trimLevels: ModelTrimLevel[];
  faqs: ModelFAQ[];
  seoSections: ModelSEOSection[];
  similarModels: CarModel[];
}

export function EnrichedModelPage({
  model,
  images,
  trimLevels,
  faqs,
  seoSections,
  similarModels,
}: EnrichedModelPageProps) {
  const primaryImage = images.find(img => img.is_primary) || images[0];
  const galleryImages = images.filter(img => !img.is_primary);

  return (
    <>
      <div className="bg-slate-50 py-6 border-b border-slate-200">
        <Container>
          <Link
            href="/cars"
            className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake til biler
          </Link>
        </Container>
      </div>

      <ModelHeroSection
        model={model}
        primaryImage={primaryImage}
      />

      <Container>
        <div className="py-12">
          <ModelSpecsGrid model={model} />

          {trimLevels.length > 0 && (
            <ModelTrimLevelsSection
              model={model}
              trimLevels={trimLevels}
            />
          )}

          <CarDetailClient model={model} />

          {seoSections.length > 0 && (
            <ModelSEOContent sections={seoSections} model={model} />
          )}

          {faqs.length > 0 && (
            <ModelFAQSection faqs={faqs} />
          )}

          {similarModels.length > 0 && (
            <SimilarModelsSection models={similarModels} />
          )}
        </div>
      </Container>
    </>
  );
}
