import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const verifyActivationCode = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ code: z.string().min(4).max(40) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.code.trim().toUpperCase();

    const { data: row } = await supabaseAdmin
      .from("activation_codes")
      .select("code,user_id,expires_at")
      .eq("code", code)
      .maybeSingle();

    if (!row) return { status: "invalid" as const };
    if (new Date(row.expires_at).getTime() <= Date.now()) return { status: "expired" as const };

    return {
      status: "ok" as const,
      userId: row.user_id ?? "",
      expiresAt: row.expires_at,
    };
  });
