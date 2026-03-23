import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VehicleData {
  registreringsnummer: string;
  merke?: string;
  modell?: string;
  arsmodell?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { registreringsnummer } = await req.json();

    if (!registreringsnummer) {
      return new Response(
        JSON.stringify({ error: "Registreringsnummer er påkrevd" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const vegvesenApiKey = Deno.env.get("VEGVESEN_API_KEY");

    if (!vegvesenApiKey) {
      console.error("[lookup-vehicle] Missing VEGVESEN_API_KEY");
      return new Response(
        JSON.stringify({ error: "API-nøkkel ikke konfigurert" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const cleanedPlate = registreringsnummer.toUpperCase().replace(/\s/g, "");

    console.log(`[lookup-vehicle] Looking up: ${cleanedPlate}`);

    const apiUrl = `https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata?kjennemerke=${encodeURIComponent(cleanedPlate)}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "SVV-Authorization": `Apikey ${vegvesenApiKey}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[lookup-vehicle] Vegvesen API error: ${response.status}`);

      if (response.status === 404) {
        return new Response(
          JSON.stringify({
            error: "Fant ikke kjøretøy med dette registreringsnummeret"
          }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Kunne ikke hente kjøretøydata fra Statens vegvesen"
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();

    console.log("[lookup-vehicle] Raw API response:", JSON.stringify(data));

    const kjoretoydataListe = data.kjoretoydataListe?.[0];
    const godkjenning = kjoretoydataListe?.godkjenning;
    const tekniskeData = godkjenning?.tekniskGodkjenning?.tekniskeData;

    const merke = tekniskeData?.generelt?.merke?.[0]?.merke || "";
    const modell = tekniskeData?.generelt?.handelsbetegnelse?.[0] || "";
    const arsmodell = godkjenning?.forstegangsGodkjenning?.forstegangRegistrertDato
      ? new Date(godkjenning.forstegangsGodkjenning.forstegangRegistrertDato).getFullYear().toString()
      : "";

    const vehicleData: VehicleData = {
      registreringsnummer: cleanedPlate,
      merke,
      modell,
      arsmodell,
    };

    console.log("[lookup-vehicle] Parsed vehicle data:", vehicleData);

    return new Response(
      JSON.stringify(vehicleData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[lookup-vehicle] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Intern serverfeil",
        details: error instanceof Error ? error.message : "Ukjent feil",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
