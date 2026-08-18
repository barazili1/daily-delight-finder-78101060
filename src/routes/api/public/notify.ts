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
          telegramId?: string | null;
          activationCode?: string | null;
          durationMinutes?: number | null;
          status?: string;
        };

        if ((body.pass ?? "").toUpperCase() !== ADMIN_PASS) {
          return new Response("forbidden", { status: 401 });
        }
        if (!body.submissionId || (body.status !== "approved" && body.status !== "rejected")) {
          return new Response("bad request", { status: 400 });
        }

        const chatId = body.telegramId?.trim() || null;
        if (!chatId) {
          console.error(`No Telegram chat is linked to submission ${body.submissionId}`);
          return new Response("telegram chat not linked", { status: 409 });
        }

        const code = body.activationCode?.trim() || null;
        const minutes = Math.max(1, Math.min(body.durationMinutes ?? 30, 1440));
        if (body.status === "approved" && !code) {
          return new Response("activation code not found", { status: 409 });
        }

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
          const blocked = telegramResponse.status === 403 || telegramBody.includes("chat not found");
          return new Response(blocked ? "telegram blocked" : "telegram delivery failed", { status: 502 });
        }

        return new Response("ok");
      },
    },
  },
});
