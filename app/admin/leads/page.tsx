import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { requireAdmin } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Admin - Leads',
};

export default async function AdminLeadsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: leads } = await supabase
    .from('leads')
    .select(`
      *,
      models (
        name,
        brands (
          name
        )
      ),
      lead_deliveries (
        id,
        status,
        delivered_at,
        error_message,
        dealers (
          name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8">
        <Container>
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-primary-700 hover:text-primary-800 mb-2 inline-block">
                ← Tilbake til dashboard
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {!leads || leads.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-600">Ingen leads mottatt ennå</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Dato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Kunde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Bil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Tidslinje
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Innbytte
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Leveranser
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {new Date(lead.created_at).toLocaleDateString('nb-NO')}
                          </div>
                          <div className="text-sm text-slate-500">
                            {new Date(lead.created_at).toLocaleTimeString('nb-NO', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{lead.name}</div>
                          <div className="text-sm text-slate-500">{lead.email}</div>
                          <div className="text-sm text-slate-500">{lead.phone}</div>
                          {lead.postcode && (
                            <div className="text-sm text-slate-500">Postnr: {lead.postcode}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {lead.models?.brands?.name} {lead.models?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{lead.purchase_timeline}</div>
                          <div className="text-sm text-slate-500">{lead.financing}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lead.trade_in ? (
                            <div>
                              <div className="text-sm text-slate-900">Ja</div>
                              {lead.trade_in_reg && (
                                <div className="text-sm text-slate-500">{lead.trade_in_reg}</div>
                              )}
                              {lead.trade_in_mileage && (
                                <div className="text-sm text-slate-500">
                                  {lead.trade_in_mileage.toLocaleString()} km
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">Nei</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {lead.lead_deliveries && lead.lead_deliveries.length > 0 ? (
                            <div className="space-y-2">
                              {lead.lead_deliveries.map((delivery: any) => (
                                <div key={delivery.id} className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{delivery.dealers?.name}</span>
                                    <span
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        delivery.status === 'sent'
                                          ? 'bg-green-100 text-green-800'
                                          : delivery.status === 'failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}
                                    >
                                      {delivery.status}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {delivery.dealers?.email}
                                  </div>
                                  {delivery.delivered_at && (
                                    <div className="text-xs text-slate-500">
                                      {new Date(delivery.delivered_at).toLocaleString('nb-NO')}
                                    </div>
                                  )}
                                  {delivery.error_message && (
                                    <div className="text-xs text-red-600">
                                      {delivery.error_message}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">Ingen leveranser</span>
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
    </div>
  );
}
