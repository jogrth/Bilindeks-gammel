import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import type { CarModel, ModelImage } from '@/types';
import { getPlaceholderImage } from '@/lib/services/image-management';

interface ModelHeroSectionProps {
  model: CarModel;
  primaryImage?: ModelImage;
}

export function ModelHeroSection({ model, primaryImage }: ModelHeroSectionProps) {
  const imageUrl = primaryImage?.url || model.image_primary_url || model.image_url || getPlaceholderImage(model.brand_name || '', model.name);
  const altText = primaryImage?.alt_text || `${model.brand_name} ${model.name}`;

  return (
    <div className="bg-white">
      <Container>
        <div className="py-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                {model.brand_name} {model.name}
              </h1>
              {model.intro_text && (
                <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                  {model.intro_text}
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                {model.price_from_nok && (
                  <div className="bg-primary-50 px-4 py-2 rounded-lg">
                    <span className="text-sm text-primary-700 font-medium">Fra</span>
                    <div className="text-2xl font-bold text-primary-900">
                      {model.price_from_nok.toLocaleString('nb-NO')} kr
                    </div>
                  </div>
                )}
                {model.range_wltp_km && (
                  <div className="bg-emerald-50 px-4 py-2 rounded-lg">
                    <span className="text-sm text-emerald-700 font-medium">Rekkevidde</span>
                    <div className="text-2xl font-bold text-emerald-900">
                      {model.range_wltp_km} km
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
              <Image
                src={imageUrl}
                alt={altText}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
