'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { FileText, CircleCheck as CheckCircle, Circle as XCircle, Plus, Eye, Trash2 } from 'lucide-react';
import type { Article } from '@/types';

type Props = {
  articles: Article[];
  currentFilters: {
    status?: string;
    topic?: string;
  };
  stats: {
    total: number;
    published: number;
    draft: number;
    needsReview: number;
  };
};

export default function ArticlesListClient({ articles, currentFilters, stats }: Props) {
  const router = useRouter();
  const [showNewArticleModal, setShowNewArticleModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams();

    Object.entries(currentFilters).forEach(([key, val]) => {
      if (val && key !== filterType) {
        params.set(key, val);
      }
    });

    if (value && value !== 'all') {
      params.set(filterType, value);
    }

    router.push(`/admin/articles?${params.toString()}`);
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

  const getStatusLabel = (status: string) => {
    const labels = {
      published: 'Publisert',
      draft: 'Utkast',
      needs_review: 'Trenger gjennomgang',
      unpublished: 'Avpublisert',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleDelete = async (articleId: string, articleTitle: string) => {
    if (!confirm(`Er du sikker på at du vil slette "${articleTitle}"? Denne handlingen kan ikke angres.`)) {
      return;
    }

    setDeleting(articleId);
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Feil ved sletting av artikkel');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Container className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Artikler</h1>
          <p className="text-slate-600 mt-2">
            Administrer redaksjonelt innhold og artikler
          </p>
        </div>
        <Button onClick={() => setShowNewArticleModal(true)} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Ny artikkel
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-600">Totalt</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-600">Publisert</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.published}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-600">Utkast</div>
          <div className="text-3xl font-bold text-slate-600 mt-2">{stats.draft}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-600">Trenger gjennomgang</div>
          <div className="text-3xl font-bold text-amber-600 mt-2">{stats.needsReview}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 mb-6 p-4">
        <div className="flex gap-4">
          <select
            value={currentFilters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="all">Alle statuser</option>
            <option value="draft">Utkast</option>
            <option value="needs_review">Trenger gjennomgang</option>
            <option value="published">Publisert</option>
            <option value="unpublished">Avpublisert</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Tittel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Emne
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Opprettet
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="flex items-center gap-3 text-slate-900 hover:text-blue-600"
                  >
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium">{article.title}</div>
                      {article.ingress && (
                        <div className="text-sm text-slate-500 mt-1 line-clamp-1">
                          {article.ingress}
                        </div>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {article.article_type || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {article.topic || '-'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                      article.review_status
                    )}`}
                  >
                    {getStatusLabel(article.review_status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(article.created_at).toLocaleDateString('nb-NO')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/artikler/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                      title="Se artikkel"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      disabled={deleting === article.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Slett artikkel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <div className="text-lg font-medium mb-2">Ingen artikler ennå</div>
                  <div className="text-sm">Klikk på «Ny artikkel» for å komme i gang</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNewArticleModal && (
        <NewArticleModal onClose={() => setShowNewArticleModal(false)} />
      )}
    </Container>
  );
}

function NewArticleModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [prompts, setPrompts] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const response = await fetch('/api/admin/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts: prompts.split('\n').filter(p => p.trim()) }),
      });

      if (!response.ok) throw new Error('Failed to generate articles');

      alert('Artikler genereres...');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error generating articles:', error);
      alert('Feil ved generering av artikler');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Ny artikkel</h2>
          <p className="text-slate-600 mt-2">
            Skriv inn ett eller flere artikkelforslag, ett per linje
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Artikkelforslag
            </label>
            <textarea
              value={prompts}
              onChange={(e) => setPrompts(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={8}
              placeholder="Lag en SEO-artikkel med fokus på «Familiebiler»&#10;Lag en samleside om våre 5 mest populære SUVer&#10;Beste elbiler for barnefamilier&#10;Elbil med firehjulsdrift under 600 000 kroner"
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Eksempler: SEO-artikler, samlesider, guider, sammenligninger
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" onClick={onClose} variant="secondary" disabled={generating}>
              Avbryt
            </Button>
            <Button type="submit" variant="primary" disabled={generating}>
              {generating ? 'Genererer...' : 'Generer artikler'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
