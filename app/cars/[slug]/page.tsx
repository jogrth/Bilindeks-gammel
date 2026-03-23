import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Battery, Anchor, Users, Zap, Package } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { CarDetailClient } from '@/components/CarDetailClient';
import { SimilarModelsSection } from '@/components/SimilarModelsSection';
import { ModelContent } from '@/components/ModelContent';
import { getModelBySlug, getSimilarModels } from '@/lib/db/models';
import {
  formatPrice,
  formatRange,
  formatTowing,
  formatSeats,
  formatChargeSpeed,
  formatCargo,
} from '@/lib/formatting';

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

  try {
    model = await getModelBySlug(resolvedParams.slug);
    if (model) {
      similarModels = await getSimilarModels(model.id);
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
    <>
      <div className="bg-slate-50 py-6 border-b border-slate-200">
        <Container>
          <Link
            href="/cars"
            className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake til oversikt
          </Link>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div>
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-4 relative">
                {model.image_url ? (
                  <Image
                    src={model.image_url}
                    alt={`${model.brand_name} ${model.name}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <span className="text-8xl">🚗</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  {model.brand_name} {model.name}
                </h1>
                <div className="flex gap-2 flex-wrap mb-4">
                  {model.drivetrain && (
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700">
                      {model.drivetrain}
                    </span>
                  )}
                  {model.body_type && (
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-slate-100 text-slate-700">
                      {model.body_type}
                    </span>
                  )}
                  {model.drive_type && (
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-slate-100 text-slate-700">
                      {model.drive_type}
                    </span>
                  )}
                </div>
              </div>

              {model.intro_text && (
                <p className="text-lg text-slate-600 mb-6">{model.intro_text}</p>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="text-sm text-blue-900 mb-1">Pris fra</div>
                <div className="text-3xl font-bold text-primary-700 mb-4">
                  {formatPrice(model.price_from_nok)}
                </div>
                <CarDetailClient model={model} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Battery className="w-6 h-6 text-primary-700 mr-3" />
                <h3 className="font-semibold text-slate-900">Rekkevidde</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatRange(model.range_wltp_km)}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Anchor className="w-6 h-6 text-primary-700 mr-3" />
                <h3 className="font-semibold text-slate-900">Hengerfeste</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatTowing(model.towing_kg)}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Users className="w-6 h-6 text-primary-700 mr-3" />
                <h3 className="font-semibold text-slate-900">Seter</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatSeats(model.seats_min, model.seats_max)}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Package className="w-6 h-6 text-primary-700 mr-3" />
                <h3 className="font-semibold text-slate-900">Bagasjerom</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCargo(model.cargo_liters)}
              </p>
            </div>

            {model.charge_speed_kw && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Zap className="w-6 h-6 text-primary-700 mr-3" />
                  <h3 className="font-semibold text-slate-900">Ladehastighet</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatChargeSpeed(model.charge_speed_kw)}
                </p>
              </div>
            )}
          </div>

          <ModelContent model={model} />

          <SimilarModelsSection models={similarModels} />
        </div>
      </Container>
    </>
  );
}
