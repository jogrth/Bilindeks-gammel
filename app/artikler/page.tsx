import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';

export const metadata = {
  title: 'Artikler - Bilindeks',
  description: 'Les våre artikler om elbiler, bilkjøp og alt du trenger å vite om elektriske biler',
};

export default async function ArtiklerPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, ingress, main_image_url, main_image_alt, topic, article_type, published_at, created_at')
    .eq('review_status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false });

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <Container>
          <h1 className="text-5xl font-bold mb-4">Artikler</h1>
          <p className="text-xl text-slate-300">
            Les våre artikler om elbiler, bilkjøp og alt du trenger å vite
          </p>
        </Container>
      </div>

      <Container className="py-16">
        {!articles || articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-slate-600">Ingen artikler publisert ennå.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/artikler/${article.slug}`}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition"
              >
                {article.main_image_url && (
                  <div className="relative w-full h-48 bg-slate-100">
                    <Image
                      src={article.main_image_url}
                      alt={article.main_image_alt || article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  {article.topic && (
                    <div className="text-sm text-blue-600 font-semibold mb-2">
                      {article.topic}
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition">
                    {article.title}
                  </h2>
                  {article.ingress && (
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {article.ingress}
                    </p>
                  )}
                  <div className="text-sm text-slate-500">
                    {new Date(article.published_at || article.created_at).toLocaleDateString('nb-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
