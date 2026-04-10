'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Save, Eye, EyeOff, Trash2, FileText } from 'lucide-react';
import type { Article, ArticleImage, ArticleRelatedModel } from '@/types';

type Props = {
  article: Article;
  relatedModels: ArticleRelatedModel[];
  images: ArticleImage[];
};

export default function ArticleDetailClient({
  article: initialArticle,
  relatedModels,
  images,
}: Props) {
  const router = useRouter();
  const [article, setArticle] = useState(initialArticle);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: article.title || '',
    ingress: article.ingress || '',
    topic: article.topic || '',
    meta_title: article.meta_title || '',
    meta_description: article.meta_description || '',
    review_notes: article.review_notes || '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save');

      alert('Endringer lagret');
      router.refresh();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Feil ved lagring');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Er du sikker på at du vil publisere denne artikkelen?')) return;

    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_status: 'published' }),
      });

      if (!response.ok) throw new Error('Failed to publish');

      alert('Artikkelen er publisert');
      router.refresh();
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Feil ved publisering');
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Er du sikker på at du vil avpublisere denne artikkelen?')) return;

    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_status: 'unpublished' }),
      });

      if (!response.ok) throw new Error('Failed to unpublish');

      alert('Artikkelen er avpublisert');
      router.refresh();
    } catch (error) {
      console.error('Error unpublishing:', error);
      alert('Feil ved avpublisering');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Er du sikker på at du vil slette denne artikkelen?')) return;

    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert('Artikkelen er slettet');
      router.push('/admin/articles');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Feil ved sletting');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-slate-100 text-slate-800',
      needs_review: 'bg-amber-100 text-amber-800',
      unpublished: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-800';
  };

  return (
    <Container className="py-8 max-w-5xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbake til artikler
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{article.title}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                  article.review_status
                )}`}
              >
                {article.review_status}
              </span>
              {article.article_type && (
                <span className="text-sm text-slate-600">{article.article_type}</span>
              )}
              {article.topic && (
                <span className="text-sm text-slate-600">Emne: {article.topic}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="primary" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Lagrer...' : 'Lagre'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Artikkelinnhold</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tittel
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ingress
                </label>
                <textarea
                  value={formData.ingress}
                  onChange={(e) => handleInputChange('ingress', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Emne
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {article.main_image_url && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Hovedbilde</h2>
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={article.main_image_url}
                  alt={article.main_image_alt || article.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {article.body_content && Array.isArray(article.body_content) && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Innhold</h2>
              <div className="space-y-4">
                {article.body_content.map((section: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-slate-900">{section.heading}</h3>
                    <div
                      className="text-slate-600 mt-2"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {article.faq_content && Array.isArray(article.faq_content) && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">FAQ</h2>
              <div className="space-y-4">
                {article.faq_content.map((faq: any, idx: number) => (
                  <div key={idx} className="border-b border-slate-200 pb-4 last:border-0">
                    <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                    <div
                      className="text-slate-600 mt-2"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Meta-tittel
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Meta-beskrivelse
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Publisering</h2>
            <div className="space-y-4">
              {article.review_status === 'published' ? (
                <Button onClick={handleUnpublish} variant="secondary" className="w-full">
                  <EyeOff className="w-4 h-4 mr-2" />
                  Avpubliser
                </Button>
              ) : (
                <Button onClick={handlePublish} variant="primary" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Publiser
                </Button>
              )}

              {!article.deleted_at && (
                <Button onClick={handleDelete} variant="secondary" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Slett artikkel
                </Button>
              )}
            </div>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Tagger</h2>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
