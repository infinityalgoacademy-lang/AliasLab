import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AliasLab — مولّد ألقاب الجيميل وأدوات البريد",
  description:
    "منصة متكاملة لتوليد ألقاب (Aliases) لبريد Gmail بكميات كبيرة باستخدام خدعة النقطة وعلامة +، بالإضافة إلى أدوات لتوليد كلمات المرور وأسماء المستخدمين والتحقق من البريد وإنشاء رموز QR.",
  keywords: [
    "Gmail alias",
    "مولد ألقاب الجيميل",
    "Gmail dot trick",
    "مولد كلمات المرور",
    "أدوات البريد",
  ],
  authors: [{ name: "AliasLab" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AliasLab — مولّد ألقاب الجيميل",
    description: "ولّد ألقاب Gmail بكميات كبيرة مع أدوات بريدية متكاملة",
    siteName: "AliasLab",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} font-cairo antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
