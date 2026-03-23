'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { createDealer, updateDealer, toggleDealerActive } from '@/lib/actions/dealers';

interface Dealer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  brand: string | null;
  postcode_area: string | null;
  price_per_lead: number | null;
  active: boolean;
}

export default function AdminDealersClient() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dealers');
      const data = await res.json();
      setDealers(data);
    } catch (error) {
      console.error('Error fetching dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      if (editingDealer) {
        await updateDealer(editingDealer.id, formData);
      } else {
        await createDealer(formData);
      }
      setShowModal(false);
      setEditingDealer(null);
      fetchDealers();
    } catch (error) {
      console.error('Error saving dealer:', error);
      alert('Feil ved lagring av forhandler');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await toggleDealerActive(id, !active);
      fetchDealers();
    } catch (error) {
      console.error('Error toggling dealer:', error);
      alert('Feil ved endring av status');
    }
  };

  const openCreateModal = () => {
    setEditingDealer(null);
    setShowModal(true);
  };

  const openEditModal = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setShowModal(true);
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
              <h1 className="text-3xl font-bold text-slate-900">Forhandlere</h1>
            </div>
            <Button variant="primary" onClick={openCreateModal}>
              Legg til forhandler
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {dealers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-600 mb-4">Ingen forhandlere lagt til ennå</p>
              <Button variant="primary" onClick={openCreateModal}>
                Legg til din første forhandler
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Navn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Kontakt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Merke
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Postnummer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Pris per lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {dealers.map((dealer) => (
                      <tr key={dealer.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{dealer.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{dealer.email}</div>
                          {dealer.phone && (
                            <div className="text-sm text-slate-500">{dealer.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{dealer.brand || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{dealer.postcode_area || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {dealer.price_per_lead ? `${dealer.price_per_lead} kr` : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              dealer.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {dealer.active ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/dealers/${dealer.id}`}
                            className="text-sky-700 hover:text-sky-800 mr-4"
                          >
                            Rediger
                          </Link>
                          <button
                            onClick={() => handleToggleActive(dealer.id, dealer.active)}
                            className="text-slate-700 hover:text-slate-800"
                          >
                            {dealer.active ? 'Deaktiver' : 'Aktiver'}
                          </button>
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingDealer ? 'Rediger forhandler' : 'Ny forhandler'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Navn <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingDealer?.name}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-post <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingDealer?.email}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingDealer?.phone || ''}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Merke
                  </label>
                  <input
                    type="text"
                    name="brand"
                    defaultValue={editingDealer?.brand || ''}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Postnummer-område
                  </label>
                  <input
                    type="text"
                    name="postcode_area"
                    defaultValue={editingDealer?.postcode_area || ''}
                    placeholder="f.eks. 0xxx"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pris per lead (kr)
                  </label>
                  <input
                    type="number"
                    name="price_per_lead"
                    defaultValue={editingDealer?.price_per_lead || ''}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    value="true"
                    defaultChecked={editingDealer?.active !== false}
                    className="rounded border-slate-300 text-sky-700 focus:ring-sky-700"
                  />
                  <label className="ml-2 text-sm text-slate-700">
                    Aktiv
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" variant="primary">
                  {editingDealer ? 'Oppdater' : 'Opprett'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDealer(null);
                  }}
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
