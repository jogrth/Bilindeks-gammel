import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);

    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header", isAdmin: false }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    console.log("Creating Supabase client with service role");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const jwt = authHeader.replace("Bearer ", "");
    console.log("Getting user from JWT");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError) {
      console.error("User error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid token", isAdmin: false, details: userError.message }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!user) {
      console.error("No user found");
      return new Response(
        JSON.stringify({ error: "Invalid token", isAdmin: false }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User found:", user.id);

    // Check if user is admin using service role (bypasses RLS)
    console.log("Checking admin status for user:", user.id);
    const { data: adminCheck, error: adminError } = await supabase
      .from("system_admins")
      .select("is_active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error("Admin check error:", adminError);
      return new Response(
        JSON.stringify({ error: "Database error", isAdmin: false, details: adminError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Admin check result:", adminCheck);
    const isAdmin = adminCheck !== null && adminCheck.is_active === true;
    console.log("Is admin:", isAdmin);

    return new Response(
      JSON.stringify({ isAdmin, userId: user.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        isAdmin: false,
        details: err instanceof Error ? err.message : String(err)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
