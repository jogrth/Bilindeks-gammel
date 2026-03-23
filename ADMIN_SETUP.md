# Admin Panel - Oppsettguide

Denne guiden viser deg hvordan du får tilgang til admin-panelet og hva du kan gjøre der.

## Steg 1: Opprett en brukerkonto

1. Gå til hjemmesiden din
2. Klikk på "Logg inn" (hvis du har lagt til login-knapp) eller gå direkte til Supabase Dashboard
3. Alternativt: Opprett bruker via Supabase Dashboard:
   - Gå til https://supabase.com/dashboard
   - Velg ditt prosjekt
   - Gå til "Authentication" → "Users"
   - Klikk "Add user" → "Create new user"
   - Fyll inn e-post og passord
   - Klikk "Create user"

## Steg 2: Gi admin-tilgang

Etter at du har opprettet en bruker, må du gi den admin-rettigheter:

1. **Finn brukerens ID:**
   - I Supabase Dashboard, gå til "Authentication" → "Users"
   - Finn brukeren du vil gjøre til admin
   - Kopier "UID" (eksempel: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

2. **Legg til admin-rettigheter:**
   - Gå til "SQL Editor" i Supabase Dashboard
   - Kjør følgende SQL-kommando (erstatt `DIN-BRUKER-ID` med faktisk ID):

```sql
INSERT INTO system_admins (user_id)
VALUES ('DIN-BRUKER-ID');
```

3. **Verifiser:**
   - Kjør denne spørringen for å sjekke at det fungerte:

```sql
SELECT * FROM system_admins;
```

## Steg 3: Logg inn som admin

1. Gå til `/admin` på hjemmesiden din
2. Du blir redirectet til login hvis ikke innlogget
3. Logg inn med e-posten og passordet du opprettet
4. Du får nå tilgang til admin-panelet

## Admin-panel funksjoner

### Dashboard (`/admin`)
Oversikt over systemet med:
- Antall publiserte modeller
- Antall totale leads
- Antall aktive forhandlere
- Antall ventende jobber

### Biler (`/admin/models`)
**Oversikt:**
- Se alle bilmodeller i systemet
- Filtrer etter status (publisert/ikke publisert)
- Søk etter bilmerke og modell

**Redigering (`/admin/models/[id]`):**
- Endre bilens detaljer:
  - Navn og slug (URL)
  - Pris
  - Rekkevidde (WLTP km)
  - Ladehastighet
  - Hengervekt
  - Antall seter
  - Bagasjerom (liter)
  - Introtekst
  - Bildets URL
- Publiser/avpubliser bilen
- Knytte bilen til forhandlere
- Se lignende modeller

### Forhandlere (`/admin/dealers`)
**Oversikt:**
- Se alle registrerte forhandlere
- Aktiver/deaktiver forhandlere
- Se hvilke modeller hver forhandler selger

**Redigering (`/admin/dealers/[id]`):**
- Endre forhandlerens informasjon:
  - Navn
  - E-postadresse (hvor leads sendes)
  - Telefonnummer
  - Adresse og postnummer
  - Aktiv/inaktiv status
- Legge til modeller forhandleren skal motta leads for
- Fjerne modeller
- Endre prioritet (lavere nummer = høyere prioritet)

**Legge til ny forhandler:**
For å legge til en ny forhandler må du kjøre SQL i Supabase:

```sql
INSERT INTO dealers (name, email, phone, address, postcode, active)
VALUES (
  'Forhandlernavn',
  'epost@forhandler.no',
  '12345678',
  'Gateadresse 1',
  '0123',
  true
);
```

### Leads (`/admin/leads`)
**Oversikt:**
- Se alle kundeforespørsler
- Filtrer etter status og dato
- Se kundens kontaktinformasjon
- Se hvilken bil kunden er interessert i
- Se leveringsstatus til hver forhandler:
  - **pending**: Venter på å bli sendt
  - **sent**: E-post sendt til forhandler
  - **failed**: Feil ved sending

**Informasjon per lead:**
- Kundenavn, e-post, telefon
- Postnummer
- Kjøpstidspunkt
- Finansieringspreferanse
- Innbyttebil (hvis relevant)
- Melding fra kunde
- Hvilke forhandlere som har fått leadet
- Tidspunkt for opprettelse

### Jobber (`/admin/jobs`)
**Oversikt:**
- Se alle ingestion-jobber (automatisk henting av bildata)
- Filtrer etter status:
  - **pending**: Venter på å kjøres
  - **running**: Kjører nå
  - **completed**: Ferdig
  - **failed**: Feilet
- Se detaljer om hver jobb:
  - Hvilken kilde (API/scraper)
  - Når den startet/fullførte
  - Feilmeldinger (hvis noen)
  - Antall modeller behandlet

## Viktige notater

### Sikkerhet
- **ALDRI** del admin-brukeren din med andre
- Kun brukere i `system_admins` tabellen har tilgang
- Alle admin-sider er beskyttet med server-side auth
- Logg ut når du er ferdig

### E-post til forhandlere
Når en kunde sender en forespørsel:
1. Leadet lagres i databasen
2. Systemet finner aktive forhandlere for den aktuelle bilmodellen
3. E-post sendes automatisk til alle relevante forhandlere
4. Status oppdateres i `lead_deliveries` tabellen

### Tips
- Sørg for at forhandlere har riktig e-postadresse
- Aktiver kun forhandlere som faktisk skal motta leads
- Bruk prioritet-feltet for å styre hvilke forhandlere som skal prioriteres
- Sjekk leads-siden jevnlig for å se om e-poster sendes korrekt

## Feilsøking

### "Access Denied" når jeg går til /admin
- Sjekk at brukeren din er lagt til i `system_admins` tabellen
- Logg ut og inn igjen
- Sjekk at du bruker riktig e-post

### Kan ikke redigere forhandler
- Sjekk at du har admin-tilgang
- Verifiser at forhandleren eksisterer i databasen

### Leads blir ikke sendt til forhandlere
- Sjekk at forhandleren er aktiv (`active = true`)
- Sjekk at forhandleren er knyttet til modellen i `model_dealers`
- Verifiser at forhandlerens e-postadresse er korrekt
- Se i "Leads"-siden om det står "failed" status

## Miljøvariabler som kreves

Disse er allerede konfigurert automatisk:
- `VEGVESEN_API_KEY` - For skiltnummer-oppslag (må legges til manuelt hvis ikke konfigurert)

For å legge til Vegvesen API-nøkkel:
1. Gå til Supabase Dashboard
2. Gå til "Project Settings" → "Edge Functions" → "Secrets"
3. Legg til secret:
   - Name: `VEGVESEN_API_KEY`
   - Value: Din API-nøkkel fra Statens vegvesen

## Support

Hvis du trenger hjelp:
1. Sjekk Supabase Dashboard for feilmeldinger
2. Se i "SQL Editor" for å kjøre egne spørringer
3. Sjekk logs i Edge Functions hvis e-poster ikke sendes
