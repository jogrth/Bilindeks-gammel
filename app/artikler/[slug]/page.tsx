import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { formatPrice } from '@/lib/formatting';
import { ArticleFAQAccordion } from '@/components/ArticleFAQAccordion';
import type { Article, ArticleBodySection, ArticleFAQItem } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('articles')
    .select('title, meta_title, meta_description, ingress')
    .eq('slug', slug)
    .eq('review_status', 'published')
    .is('deleted_at', null)
    .maybeSingle();

  if (!article) {
    return {
      title: 'Artikkel ikke funnet',
    };
  }

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.ingress,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('review_status', 'published')
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !article) {
    notFound();
  }

  const { data: relatedModels } = await supabase
    .from('article_related_models')
    .select(`
      *,
      models!inner (
        id,
        name,
        slug,
        brand_id,
        price_from_nok,
        range_wltp_km,
        image_url,
        image_primary_url,
        intro_text,
        review_status,
        deleted_at,
        brands (
          name,
          slug
        )
      )
    `)
    .eq('article_id', article.id)
    .eq('models.review_status', 'published')
    .is('models.deleted_at', null)
    .order('display_order');

  const bodyContent = article.body_content as ArticleBodySection[] | null;
  const faqContent = article.faq_content as ArticleFAQItem[] | null;

  const firstRelatedModel = relatedModels?.[0]?.models;

  return (
    <div className="min-h-screen bg-white">
      {article.main_image_url && (
        <div className="relative w-full h-80 bg-slate-100">
          <Image
            src={article.main_image_url}
            alt={article.main_image_alt || article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              {article.title}
            </h1>
            {article.ingress && (
              <p className="text-xl text-slate-600 leading-relaxed">{article.ingress}</p>
            )}
          </div>

          {bodyContent && bodyContent.length > 0 && (
            <div className="mb-16">
              {bodyContent.map((section, idx) => (
                <div key={idx} className="mb-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    {section.heading}
                  </h2>
                  <div
                    className="text-slate-700 leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>
          )}

          {firstRelatedModel && (
            <div className="mb-12 p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-900 mb-1">
                  {firstRelatedModel.brands?.name} {firstRelatedModel.name}
                </div>
                <div className="text-slate-600 text-sm">
                  {firstRelatedModel.intro_text
                    ? firstRelatedModel.intro_text.slice(0, 100) + '…'
                    : 'Les mer om denne modellen'}
                </div>
              </div>
              <Link
                href={`/cars/${firstRelatedModel.slug}`}
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                Se modell
              </Link>
            </div>
          )}

          {relatedModels && relatedModels.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">
                Aktuelle bilmodeller
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedModels.map((rel: any) => {
                  const model = rel.models;
                  if (!model) return null;

                  const imageUrl = model.image_primary_url || model.image_url;

                  return (
                    <Link
                      key={model.id}
                      href={`/cars/${model.slug}`}
                      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition"
                    >
                      {imageUrl && (
                        <div className="relative w-full h-48 bg-slate-100">
                          <Image
                            src={imageUrl}
                            alt={model.name}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="text-sm text-slate-600 mb-1">
                          {model.brands?.name}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                          {model.name}
                        </h3>
                        {rel.description && (
                          <p className="text-slate-600 mb-4">{rel.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          {model.price_from_nok && (
                            <div className="text-lg font-semibold text-slate-900">
                              Fra {formatPrice(model.price_from_nok)}
                            </div>
                          )}
                          {model.range_wltp_km && (
                            <div className="text-sm text-slate-600">
                              {model.range_wltp_km} km rekkevidde
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {faqContent && faqContent.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Ofte stilte spørsmål
              </h2>
              <ArticleFAQAccordion faqs={faqContent} />
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              Publisert {new Date(article.created_at).toLocaleDateString('nb-NO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
