import type { Metadata, Viewport } from "next";
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
  title: "AliasLab — ألقاب Gmail وأدوات البريد",
  description:
    "أدوات بريدية لإنشاء ألقاب Gmail لتنظيم الرسائل وحماية الخصوصية، مع أدوات للتحقق من البريد وكلمات المرور وأسماء المستخدمين وإنشاء رموز QR.",
  keywords: [
    "Gmail alias",
    "Gmail plus alias",
    "ألقاب Gmail للخصوصية",
    "مولد ألقاب الجيميل",
    "مولد كلمات المرور",
    "أدوات البريد",
  ],
  authors: [{ name: "AliasLab" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AliasLab — ألقاب Gmail وأدوات البريد",
    description: "أدوات Gmail لتنظيم الرسائل وحماية خصوصية بريدك الأساسي.",
    siteName: "AliasLab",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
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
