import { createFileRoute } from "@tanstack/react-router";
import { getBotToken } from "@/lib/bot-token.server";

const ADMIN_PASS = "HACKSD";

export const Route = createFileRoute("/api/public/notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          pass?: string;
          submissionId?: string;
          userId?: string;
          status?: string;
        };

        if ((body.pass ?? "").toUpperCase() !== ADMIN_PASS) {
          return new Response("forbidden", { status: 401 });
        }
        if (!body.submissionId || !body.userId || (body.status !== "approved" && body.status !== "rejected")) {
          return new Response("bad request", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: submission, error: submissionError } = await supabaseAdmin
          .from("submissions")
          .select("telegram_id")
          .eq("id", body.submissionId)
          .eq("user_id", body.userId)
          .maybeSingle();

        if (submissionError) {
          console.error("Could not load the approved submission:", submissionError.message);
          return new Response("submission lookup failed", { status: 500 });
        }

        const { data: codes, error: codeError } = await supabaseAdmin
          .from("activation_codes")
          .select("telegram_id, code, duration_minutes")
          .eq("user_id", body.userId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (codeError) {
          console.error("Could not load the activation code:", codeError.message);
          return new Response("activation code lookup failed", { status: 500 });
        }

        const chatId = submission?.telegram_id ?? codes?.[0]?.telegram_id ?? null;
        if (!chatId) {
          console.error(`No Telegram chat is linked to submission ${body.submissionId}`);
          return new Response("telegram chat not linked", { status: 409 });
        }

        const code = codes?.[0]?.code ?? null;
        const minutes = codes?.[0]?.duration_minutes ?? 30;

        // The code is revealed to the user only now, after the admin approved.
        const text =
          body.status === "approved"
            ? code
              ? `✅ <b>تم قبول طلبك</b>\n\n🔑 <b>كود التفعيل الخاص بك</b>\n\n<code>${code}</code>\n\n` +
                `⏳ مدة الكود: <b>${minutes} دقيقة</b> تبدأ من أول مرة تستخدمه فيها داخل التطبيق.\n\n` +
                `انسخ الكود وارجع للموقع ثم اضغط «استخدام كود تفعيل».`
              : "✅ <b>تم قبول طلبك</b>\n\nابدأ محادثة البوت من الموقع للحصول على كود التفعيل."
            : "❌ <b>تم رفض الطلب</b>\n\nلم يتم قبول بياناتك، برجاء إعادة تنفيذ الشروط والمحاولة مجددًا.";

        const telegramResponse = await fetch(`https://api.telegram.org/bot${getBotToken()}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, parse_mode: "HTML", text }),
        });

        const telegramBody = await telegramResponse.text();
        if (!telegramResponse.ok) {
          console.error(`Telegram sendMessage failed [${telegramResponse.status}]: ${telegramBody}`);
          return new Response("telegram delivery failed", { status: 502 });
        }

        return new Response("ok");
      },
    },
  },
});
