import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CircleCheck as CheckCircle, Zap, DollarSign, Shield, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Hvordan velge riktig bil? - Komplett guide 2026 | Biljakt',
  description: 'Lær hvordan du velger riktig bil med vår omfattende guide. Vi dekker budsjett, behov, elbil vs bensin, praktiske tips og mye mer.',
};

export default function ArticlePage() {
  return (
    <>
      <div className="relative w-full h-[500px] bg-slate-900">
        <Image
          src="https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Moderne elbiler på rekke"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
        <Container>
          <div className="relative h-[500px] flex flex-col justify-center">
            <Link
              href="/"
              className="inline-flex items-center text-white hover:text-slate-200 font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til forsiden
            </Link>
            <div className="max-w-3xl">
              <div className="text-sm font-semibold text-blue-400 mb-4 tracking-wide uppercase">
                Publisert 19.03.2026
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Hvordan velge riktig bil?
              </h1>
              <p className="text-xl text-slate-200 leading-relaxed">
                Å velge riktig bil er en viktig beslutning som påvirker både økonomi, miljø og
                livskvalitet. Denne guiden hjelper deg gjennom hele prosessen.
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <article className="py-16 max-w-4xl mx-auto">
          <div className="space-y-16">
            <section className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-700" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Definer dine behov</h2>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Før du begynner å lete etter bil, er det viktig å kartlegge hva du faktisk trenger.
                Spør deg selv:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Hvor mange personer skal bilen ha plass til daglig?</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Hvor langt kjører du i snitt per dag?</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Trenger du hengerfeste eller takboks?</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Kjører du mest by, landevei eller motorvei?</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Har du parkeringsplass med lademulighet?</span>
                </li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-700" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Sett et realistisk budsjett</h2>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Budsjettet ditt bør inkludere mer enn bare kjøpesummen. Husk å regne med:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Kjøpspris</h3>
                  <p className="text-slate-600 text-sm">Kontantpris eller finansiering</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Forsikring</h3>
                  <p className="text-slate-600 text-sm">Varierer sterkt mellom bilmodeller</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Drivstoffkostnader</h3>
                  <p className="text-slate-600 text-sm">Strøm vs bensin/diesel</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Servicekostnader</h3>
                  <p className="text-slate-600 text-sm">Elbil har ofte lavere vedlikehold</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-blue-700 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Tips: Totaløkonomi over 5 år</h3>
                    <p className="text-slate-700 mb-0">
                      Regn ut totalkostnadene over 5 år, ikke bare kjøpesummen. En dyrere elbil
                      kan være billigere totalt sett på grunn av lavere drivstoff- og vedlikeholdskostnader.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-blue-200 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Zap className="w-6 h-6 text-blue-700" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Elbil eller bensin/diesel?</h2>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                Dette er en av de viktigste beslutningene du må ta. Her er faktorer å vurdere:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-green-700 mb-4">Velg elbil hvis:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Du kjører under 400 km per dag</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Du har tilgang til lademulighet hjemme eller på jobb</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Du vil ha lavest mulig driftskostnader</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Du ønsker stille og jevn kjøreopplevelse</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Miljø er viktig for deg</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-700 mb-4">Velg bensin/diesel hvis:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span>Du kjører svært lange distanser daglig</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span>Du ikke har tilgang til lading</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span>Du trenger ekstrem rekkevidde</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span>Du bor i områder med dårlig ladeinfrastruktur</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-3">Klar for å finne din perfekte elbil?</h3>
                <p className="text-green-50 mb-6 max-w-2xl mx-auto">
                  Sammenlign elbiler, få tilbud fra forhandlere og finn bilen som passer perfekt for dine behov.
                </p>
                <Link href="/cars">
                  <Button variant="secondary" className="bg-white text-green-700 hover:bg-slate-50">
                    Se alle biler
                  </Button>
                </Link>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-700" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Viktige spesifikasjoner</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">For elbiler:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Rekkevidde (WLTP):</strong> Minimum 300 km anbefales</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Ladehastighet:</strong> Minimum 50 kW DC-lading</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Batterikapasitet:</strong> Større batteri = lengre rekkevidde</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Forbruk:</strong> kWh per 100 km</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Praktiske egenskaper:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Bagasjerom:</strong> Minimum 400 liter for familier</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Tilhengervekt:</strong> Viktig hvis du trenger henger</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Sitteplass:</strong> Test at alle sitter komfortabelt</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Kjøreegenskaper:</strong> Prøvekjør i ulike situasjoner</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-orange-700" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Sjekkliste før kjøp</h2>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Før du signerer kontrakten, sørg for at du har:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Prøvekjørt bilen grundig</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sammenlignet priser hos flere forhandlere</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Fått skriftlig tilbud med alle kostnader</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sjekket forsikringspris</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Vurdert finansieringsalternativer</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Lest kundeomtaler av modellen</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sjekket garantivilkår</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Bekreftet leveringstid</span>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Klar til å finne din drømmebil?
            </h2>
            <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
              Sammenlign elbiler, få tilbud fra forhandlere og finn bilen som passer perfekt for deg.
              Start søket i dag!
            </p>
            <Link href="/cars">
              <Button variant="secondary" className="bg-white text-blue-700 hover:bg-slate-50 text-lg px-8 py-4">
                Se alle biler
              </Button>
            </Link>
          </div>
        </article>
      </Container>
    </>
  );
}
