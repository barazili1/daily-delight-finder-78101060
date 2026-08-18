import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/games" });
  },
  head: () => ({
    meta: [
      { title: "CRAZY VIP — تطبيق الألعاب والتفعيل" },
      {
        name: "description",
        content: "CRAZY VIP: ألعاب مميزة وكود تفعيل خاص لمنصات 1xBet وLineBet وWinWin وGreenBet.",
      },
      { property: "og:title", content: "CRAZY VIP — تطبيق الألعاب والتفعيل" },
      { property: "og:description", content: "ابدأ الآن مع CRAZY VIP واحصل على كود التفعيل الخاص بك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
