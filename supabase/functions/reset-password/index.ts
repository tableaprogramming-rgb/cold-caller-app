import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Extract Bearer token
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create admin client (uses service role key) to verify token and get user
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Use the token to get the current user (this verifies the token is valid)
    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const caller = userData.user;

    // Check that the caller is an admin
    const { data: callerProfile, error: profileError } = await adminClient
      .from("user_profiles")
      .select("role, organization_id")
      .eq("id", caller.id)
      .single();

    if (profileError || !callerProfile || callerProfile.role !== "admin") {
      return new Response(
        JSON.stringify({
          error: "Only admins can reset passwords",
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "Missing targetUserId in request body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify target user is in the same org
    const { data: targetProfile, error: targetProfileError } = await adminClient
      .from("user_profiles")
      .select("organization_id")
      .eq("id", targetUserId)
      .single();

    if (
      targetProfileError ||
      !targetProfile ||
      targetProfile.organization_id !== callerProfile.organization_id
    ) {
      return new Response(
        JSON.stringify({
          error: "Target user is not in your organization",
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Generate a random 12-char temp password
    const tempPassword = generateTempPassword();

    // Update the user's password using admin API
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUserId,
      { password: tempPassword }
    );

    if (updateError) {
      console.error("Password update error:", updateError);
      return new Response(
        JSON.stringify({
          error: `Failed to reset password: ${updateError.message}`,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Mark that password change is required on next login
    const { error: flagError } = await adminClient
      .from("user_profiles")
      .update({
        password_change_required: true,
        password_changed_at: null,
      })
      .eq("id", targetUserId);

    if (flagError) {
      console.error("Flag update error:", flagError);
      return new Response(
        JSON.stringify({
          error: `Failed to set password change flag: ${flagError.message}`,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ tempPassword }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

function generateTempPassword(): string {
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "!@#$%&*?";
  const all = lower + upper + digits + symbols;

  const rand = (set: string) =>
    set[Math.floor(Math.random() * set.length)];

  const required = [rand(lower), rand(upper), rand(digits), rand(symbols)];
  const remaining = Array.from({ length: 8 }, () => rand(all));
  const chars = [...required, ...remaining];

  // Fisher–Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
