'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { createIngestionJob } from '@/lib/actions/admin';

export default function AdminJobsClient() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const result = await createIngestionJob(sourceUrl || undefined);
      if (result.success) {
        setShowModal(false);
        setSourceUrl('');
        fetchJobs();
      } else {
        alert(result.error || 'Feil ved oppretting av jobb');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Feil ved oppretting av jobb');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8">
        <Container>
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-sky-700 hover:text-sky-800 mb-2 inline-block">
                ← Tilbake til dashboard
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">Ingestion Jobs</h1>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Opprett ny jobb
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-600 mb-4">Ingen ingestion jobs kjørt ennå</p>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Opprett din første jobb
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Input
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Opprettet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Startet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Ferdig
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Feilmelding
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 max-w-xs truncate">
                            {job.input_name || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              job.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : job.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : job.status === 'running'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {new Date(job.created_at).toLocaleDateString('nb-NO')}
                          </div>
                          <div className="text-sm text-slate-500">
                            {new Date(job.created_at).toLocaleTimeString('nb-NO', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.started_at ? (
                            <>
                              <div className="text-sm text-slate-900">
                                {new Date(job.started_at).toLocaleDateString('nb-NO')}
                              </div>
                              <div className="text-sm text-slate-500">
                                {new Date(job.started_at).toLocaleTimeString('nb-NO', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.finished_at ? (
                            <>
                              <div className="text-sm text-slate-900">
                                {new Date(job.finished_at).toLocaleDateString('nb-NO')}
                              </div>
                              <div className="text-sm text-slate-500">
                                {new Date(job.finished_at).toLocaleTimeString('nb-NO', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {job.error_message ? (
                            <div className="text-sm text-red-600 max-w-xs truncate" title={job.error_message}>
                              {job.error_message}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Container>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Opprett ingestion jobb</h2>
            </div>

            <form onSubmit={handleCreateJob} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Input navn (valgfritt)
                  </label>
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    placeholder="z.b. Tesla Model 3"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    AI ingestion pipeline vil bli implementert i en fremtidig fase
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? 'Oppretter...' : 'Opprett jobb'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setSourceUrl('');
                  }}
                  disabled={creating}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
