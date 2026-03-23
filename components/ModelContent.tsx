import type { CarModel } from '@/types';

interface ModelContentProps {
  model: CarModel;
}

export function ModelContent({ model }: ModelContentProps) {
  return (
    <div className="prose prose-slate max-w-none">
      <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Om {model.brand_name} {model.name}
        </h2>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            {model.brand_name} {model.name} representerer det beste innen moderne elbilteknologi.
            Med imponerende rekkevidde, rask lading og fremtidsrettet design, er dette en bil
            som kombinerer praktiske egenskaper med miljøvennlig kjøreglede.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Ytelse og rekkevidde</h3>
          <p>
            Med en WLTP-rekkevidde på {model.range_wltp_km} km tilbyr {model.brand_name} {model.name}
            frihet til å kjøre langt uten bekymringer. Avansert batteriteknologi sikrer stabil
            ytelse i alle værforhold, mens regenerativ bremsing bidrar til å maksimere rekkevidden.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Lading og praktisk bruk</h3>
          <p>
            Hurtiglading gjør det enkelt å lade raskt når du er på farten.
            {model.charge_speed_kw ? ` Med ladehastighet på opptil ${model.charge_speed_kw} kW kan du lade batteriet betydelig på kort tid.` : ''}
            {' '}Hjemmelading gir deg full fleksibilitet til å starte hver dag med fullt batteri.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Plass og komfort</h3>
          <p>
            {model.brand_name} {model.name} {model.body_type && `som ${model.body_type.toLowerCase()} `}
            tilbyr god plass til {model.seats_min === model.seats_max ? model.seats_min : `${model.seats_min}-${model.seats_max}`} personer.
            {model.cargo_liters ? ` Med et bagasjerom på ${model.cargo_liters} liter har du rikelig med plass til bagasje og utstyr.` : ''}
            {model.towing_kg ? ` Tilhengerfeste gir mulighet for opptil ${model.towing_kg} kg tilhengervekt.` : ''}
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Teknologi og sikkerhet</h3>
          <p>
            Moderne sikkerhetssystemer og avansert teknologi gir deg trygghet på veien.
            Intuitiv infotainment, førerassistanse og kontinuerlige programvareoppdateringer
            sikrer at bilen holder seg oppdatert med de nyeste funksjonene.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Miljø og økonomi</h3>
          <p>
            Som elbil gir {model.brand_name} {model.name} deg betydelige besparelser på drivstoff
            sammenlignet med konvensjonelle biler. Lave driftskostnader, redusert vedlikehold
            og ulike støtteordninger gjør elbil til et smart valg både for miljøet og lommeboken.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Klar for å prøvekjøre?</h3>
            <p className="text-slate-700 mb-0">
              Kontakt en av våre forhandlere for å bestille prøvekjøring eller få et uforpliktende tilbud
              på {model.brand_name} {model.name}. Vi hjelper deg med finansiering, innbytte og levering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
