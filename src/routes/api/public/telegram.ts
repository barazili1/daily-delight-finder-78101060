import { createFileRoute } from "@tanstack/react-router";
import { WELCOME_JPEG_B64 } from "@/lib/telegram-assets.server";
import { getBotToken, TELEGRAM_CHANNEL, TELEGRAM_CHANNEL_LINK } from "@/lib/bot-token.server";

const API = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sendWelcome(token: string, chatId: number, name: string) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append(
    "caption",
    `🎰 <b>أهلاً ${name} في CRAZY VIP</b>\n\nمنصة الإشارات والأكواد الأولى.\nجارٍ تسجيل طلبك ومراجعته...`,
  );
  form.append("parse_mode", "HTML");
  form.append("photo", new Blob([b64ToBytes(WELCOME_JPEG_B64)], { type: "image/jpeg" }), "welcome.jpg");
  await fetch(API(token, "sendPhoto"), { method: "POST", body: form });
}

/** The code itself stays hidden until an admin approves the request. */
async function sendPendingReview(token: string, chatId: number) {
  await fetch(API(token, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: "HTML",
      text:
        "⏳ <b>طلبك تحت المراجعة</b>\n\n" +
        "يتم التحقق من بياناتك الآن، وسيصلك <b>كود التفعيل</b> هنا فور موافقة الإدارة على طلبك.",
    }),
  });
}

/** Mandatory channel subscription check. */
async function isSubscribed(token: string, userId: number) {
  try {
    const res = await fetch(
      `${API(token, "getChatMember")}?chat_id=${encodeURIComponent(TELEGRAM_CHANNEL)}&user_id=${userId}`,
    );
    const json = (await res.json()) as { ok?: boolean; result?: { status?: string } };
    const status = json.result?.status ?? "";
    return json.ok === true && ["creator", "administrator", "member", "restricted"].includes(status);
  } catch {
    return false;
  }
}

async function askToSubscribe(token: string, chatId: number, name: string) {
  await fetch(API(token, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: "HTML",
      text:
        `👋 <b>أهلاً ${name}</b>\n\n` +
        "🔒 للاستفادة من البوت لازم تكون <b>مشترك في قناتنا</b> على تلجرام.\n\n" +
        "اشترك من الزر تحت، وأول ما تشترك هيوصلك كل حاجة هنا تلقائيًا ✅",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 اشترك في القناة", url: TELEGRAM_CHANNEL_LINK }],
        ],
      },
    }),
  });
}

/** Register the code request and tell the user it is under review. */
async function fulfill(token: string, chatId: number, name: string, arg: string) {
  await sendWelcome(token, chatId, name);

  const code = makeCode();
  const minutes = 30 + Math.floor(Math.random() * 31);
  // The countdown only starts when the user first enters the code in the app,
  // so store a far-future placeholder here.
  const placeholder = new Date(Date.now() + 365 * 24 * 60 * 60_000);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("activation_codes").insert({
    code,
    telegram_id: String(chatId),
    user_id: arg,
    duration_minutes: minutes,
    expires_at: placeholder.toISOString(),
  });

  // Link the telegram chat to the user's submission so review results can be delivered.
  await supabaseAdmin.from("submissions").update({ telegram_id: String(chatId) }).eq("user_id", arg);

  await sendPendingReview(token, chatId);
}

async function savePending(chatId: number, name: string, arg: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("pending_starts")
    .upsert({ telegram_id: String(chatId), user_id: arg, first_name: name }, { onConflict: "telegram_id" });
}

export const Route = createFileRoute("/api/public/telegram")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = getBotToken();

        const update = (await request.json()) as {
          message?: { chat: { id: number }; from?: { id?: number; first_name?: string }; text?: string };
          chat_member?: {
            chat: { id: number; username?: string };
            from?: { id?: number };
            new_chat_member?: { user?: { id?: number; first_name?: string }; status?: string };
          };
        };

        // ---- User just joined (or left) the required channel ----
        const cm = update.chat_member;
        if (cm) {
          const status = cm.new_chat_member?.status ?? "";
          const joinedUser = cm.new_chat_member?.user?.id;
          const isMember = ["creator", "administrator", "member", "restricted"].includes(status);
          if (!joinedUser || !isMember) return new Response("ok");

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: pending } = await supabaseAdmin
            .from("pending_starts")
            .select("telegram_id, user_id, first_name")
            .eq("telegram_id", String(joinedUser))
            .maybeSingle();
          if (!pending) return new Response("ok");

          await supabaseAdmin.from("pending_starts").delete().eq("telegram_id", String(joinedUser));

          const name = pending.first_name ?? cm.new_chat_member?.user?.first_name ?? "لاعب";
          if (pending.user_id) {
            await fulfill(token, joinedUser, name, pending.user_id);
          } else {
            await fetch(API(token, "sendMessage"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: joinedUser,
                parse_mode: "HTML",
                text:
                  `✅ <b>تم تأكيد اشتراكك ${name}</b>\n\n` +
                  `https://crazy-vip-one.vercel.app/\n\n` +
                  `للحصول على كود تفعيل توجّه إلى الموقع`,
              }),
            });
          }
          return new Response("ok");
        }

        const msg = update.message;
        if (!msg?.text) return new Response("ok");

        const chatId = msg.chat.id;
        const name = msg.from?.first_name ?? "لاعب";
        const [cmd, arg] = msg.text.trim().split(/\s+/);

        if (cmd !== "/start" && cmd !== "/code") return new Response("ok");

        // Mandatory channel subscription: not a member -> remember the request, ask, and stop.
        const fromId = msg.from?.id ?? chatId;
        if (!(await isSubscribed(token, fromId))) {
          await savePending(chatId, name, arg ?? null);
          await askToSubscribe(token, chatId, name);
          return new Response("ok");
        }

        // Only users who came from the website (deep link with their user id) get a code
        if (!arg) {
          await fetch(API(token, "sendMessage"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              parse_mode: "HTML",
              disable_web_page_preview: false,
              text:
                `👋 <b>أهلاً ${name}</b>\n\n` +
                `https://crazy-vip-one.vercel.app/\n\n` +
                `للحصول على كود تفعيل توجّه إلى الموقع`,
            }),
          });
          return new Response("ok");
        }

        await fulfill(token, chatId, name, arg);
        return new Response("ok");
      },
    },
  },
});

