# Statens Vegvesen API - Oppsett

## Om API-et

Statens vegvesen tilbyr et API for oppslag av kjøretøydata basert på registreringsnummer (skiltnummer). Dette brukes i lead-skjemaet for å automatisk hente informasjon om innbyttebilen.

## Hvordan legge til API-nøkkel

Du har allerede API-nøkkelen fra Statens vegvesen. Følg disse stegene for å legge den til i systemet:

### Steg 1: Gå til Supabase Dashboard

1. Logg inn på https://supabase.com/dashboard
2. Velg ditt prosjekt
3. Gå til "Project Settings" (tannhjul-ikonet nederst i venstremenyen)
4. Velg "Edge Functions" → "Secrets"

### Steg 2: Legg til secret

1. Klikk "Add secret" eller "New secret"
2. Fyll inn:
   - **Name:** `VEGVESEN_API_KEY`
   - **Value:** Din API-nøkkel fra Statens vegvesen
3. Klikk "Save" eller "Add secret"

### Steg 3: Verifiser

Edge function `lookup-vehicle` vil nå ha tilgang til API-nøkkelen og kan hente kjøretøydata.

## Hvordan det fungerer

1. **Bruker fyller inn skiltnummer** i lead-skjemaet under "Innbytte"
2. **Bruker klikker "Søk"**-knappen
3. **Frontend sender request** til Edge Function `/functions/v1/lookup-vehicle`
4. **Edge Function kaller Statens vegvesen API** med:
   - Endepunkt: `https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata`
   - Header: `SVV-Authorization: Apikey [DIN-NØKKEL]`
   - Query parameter: `kjennemerke=[SKILTNUMMER]`
5. **API returnerer data** om kjøretøyet
6. **Edge Function parser data** og returnerer:
   - Merke (f.eks. "TESLA")
   - Modell (f.eks. "Model 3")
   - Årsmodell (f.eks. "2023")
7. **Frontend viser informasjonen** til brukeren

## API-spesifikasjon

### Request format
```
GET https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata?kjennemerke=AB12345
Headers:
  SVV-Authorization: Apikey [DIN-NØKKEL]
  Accept: application/json
```

### Response format
Edge function returnerer forenklet format:
```json
{
  "registreringsnummer": "AB12345",
  "merke": "TESLA",
  "modell": "Model 3",
  "arsmodell": "2023"
}
```

### Feilhåndtering

Funksjonen håndterer følgende feil:
- **404**: Kjøretøy ikke funnet
- **401/403**: Ugyldig API-nøkkel
- **500**: Generell serverfeil

## Testing

For å teste at oppsettet fungerer:

1. Gå til lead-skjemaet på nettsiden
2. Kryss av "Jeg har innbytte"
3. Skriv inn et gyldig norsk registreringsnummer (f.eks. "AB12345")
4. Klikk "Søk"
5. Kjøretøyinformasjon skal vises under feltet

## Debugging

Hvis det ikke fungerer, sjekk:

1. **I Supabase Dashboard → Edge Functions → Logs:**
   - Se etter feilmeldinger fra `lookup-vehicle`
   - Sjekk om API-nøkkelen er tilgjengelig
   - Se om requests når frem til Vegvesen

2. **I browser console:**
   - Åpne Developer Tools (F12)
   - Gå til "Network" tab
   - Klikk "Søk" og se request/response
   - Sjekk for feilmeldinger

3. **Vanlige problemer:**
   - API-nøkkel ikke lagt til: "API-nøkkel ikke konfigurert"
   - Ugyldig skiltnummer: "Fant ikke kjøretøy med dette registreringsnummeret"
   - Rate limiting: "Kunne ikke hente kjøretøydata fra Statens vegvesen"

## Kostnader

Sjekk med Statens vegvesen angående:
- Kostnad per oppslag
- Rate limits
- Månedlige kontingenter

## Sikkerhet

- API-nøkkelen lagres som secret i Supabase
- Nøkkelen eksponeres ALDRI til frontend
- All kommunikasjon går via Edge Function
- CORS er konfigurert for sikker tilgang

## Support

Kontakt Statens vegvesen for:
- API-dokumentasjon
- Support på API-et
- Endringer i nøkkel
- Problemer med tilgang
