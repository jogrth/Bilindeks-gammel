import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { requireAdmin } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboard() {
  await requireAdmin();

  const supabase = await createClient();

  const [modelsResult, leadsResult, dealersResult, jobsResult] = await Promise.all([
    supabase.from('models').select('id, status, review_status').order('created_at', { ascending: false }),
    supabase.from('leads').select('id, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('dealers').select('id, active'),
    supabase.from('ingestion_jobs').select('*').order('created_at', { ascending: false }).limit(10),
  ]);

  const models = modelsResult.data || [];
  const leads = leadsResult.data || [];
  const dealers = dealersResult.data || [];
  const jobs = jobsResult.data || [];

  const totalPublished = models.filter(m => m.review_status === 'published').length;
  const needsReview = models.filter(m => m.status === 'needs_review').length;
  const recentLeads = leads.filter(l => {
    const diff = Date.now() - new Date(l.created_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8">
        <Container>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-600 mb-1">Totalt biler</div>
              <div className="text-3xl font-bold text-slate-900">{models.length}</div>
              <div className="text-xs text-slate-500 mt-1">{totalPublished} publisert</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-600 mb-1">Forhandlere</div>
              <div className="text-3xl font-bold text-slate-900">{dealers.length}</div>
              <div className="text-xs text-slate-500 mt-1">{dealers.filter(d => d.active).length} aktive</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-600 mb-1">Totalt leads</div>
              <div className="text-3xl font-bold text-green-600">{leads.length}</div>
              <div className="text-xs text-slate-500 mt-1">{recentLeads} siste uke</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-600 mb-1">Trenger gjennomgang</div>
              <div className="text-3xl font-bold text-amber-600">{needsReview}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hurtiglenker</h2>
              <div className="space-y-3">
                <Link
                  href="/admin/models"
                  className="block px-4 py-3 rounded-lg bg-primary-50 text-primary-700 font-medium hover:bg-primary-100 transition"
                >
                  Se alle modeller
                </Link>
                <Link
                  href="/admin/dealers"
                  className="block px-4 py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
                >
                  Administrer forhandlere
                </Link>
                <Link
                  href="/admin/leads"
                  className="block px-4 py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
                >
                  Se leads
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Siste leads</h2>
              {leads.length > 0 ? (
                <div className="space-y-2">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="text-sm text-slate-600 border-b border-slate-100 pb-2">
                      {new Date(lead.created_at).toLocaleDateString('nb-NO')}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Ingen leads ennå</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Siste jobber</h2>
              {jobs.length > 0 ? (
                <div className="space-y-2">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                      <span className="text-slate-700">{job.input_name}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          job.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : job.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Ingen jobber ennå</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
