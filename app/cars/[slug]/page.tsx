import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { EnrichedModelPage } from '@/components/model/EnrichedModelPage';
import {
  getModelBySlug,
  getSimilarModels,
  getModelImages,
  getModelTrimLevels,
  getModelFAQs,
  getModelSEOSections
} from '@/lib/db/models';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const model = await getModelBySlug(resolvedParams.slug);

    if (!model) {
      return {
        title: 'Bil ikke funnet',
      };
    }

    return {
      title: `${model.brand_name} ${model.name}`,
      description: model.intro_text || `Les mer om ${model.brand_name} ${model.name}`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Bilindeks',
    };
  }
}

export default async function CarDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  let model = null;
  let similarModels: any[] = [];
  let images: any[] = [];
  let trimLevels: any[] = [];
  let faqs: any[] = [];
  let seoSections: any[] = [];

  try {
    model = await getModelBySlug(resolvedParams.slug);
    if (model) {
      [similarModels, images, trimLevels, faqs, seoSections] = await Promise.all([
        getSimilarModels(model.id),
        getModelImages(model.id),
        getModelTrimLevels(model.id),
        getModelFAQs(model.id),
        getModelSEOSections(model.id),
      ]);
    }
  } catch (error) {
    console.error('Error loading model:', error);
  }

  if (!model) {
    return (
      <>
        <div className="bg-slate-50 py-6 border-b border-slate-200">
          <Container>
            <Link
              href="/"
              className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til oversikt
            </Link>
          </Container>
        </div>
        <Container>
          <div className="py-12 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Bil ikke funnet</h1>
            <p className="text-slate-600 mb-8">Bilen du leter etter finnes ikke eller er ikke tilgjengelig.</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
            >
              Gå til forsiden
            </Link>
          </div>
        </Container>
      </>
    );
  }

  return (
    <EnrichedModelPage
      model={model}
      images={images}
      trimLevels={trimLevels}
      faqs={faqs}
      seoSections={seoSections}
      similarModels={similarModels}
    />
  );
}
