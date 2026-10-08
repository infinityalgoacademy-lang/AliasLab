"use client";

import { useState } from "react";
import {
  AtSign,
  KeyRound,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
  Github,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AliasGenerator } from "@/components/tools/alias-generator";
import { PasswordGenerator } from "@/components/tools/password-generator";
import { UsernameGenerator } from "@/components/tools/username-generator";
import { EmailValidator } from "@/components/tools/email-validator";
import { QrGenerator } from "@/components/tools/qr-generator";

const TOOLS = [
  { id: "alias", label: "ألقاب Gmail", icon: <AtSign className="h-4 w-4" /> },
  { id: "password", label: "كلمات المرور", icon: <KeyRound className="h-4 w-4" /> },
  { id: "username", label: "أسماء المستخدمين", icon: <User className="h-4 w-4" /> },
  { id: "validator", label: "فاحص البريد", icon: <Mail className="h-4 w-4" /> },
  { id: "qr", label: "رمز QR", icon: <QrCode className="h-4 w-4" /> },
];

export default function Home() {
  const [active, setActive] = useState("alias");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        activeTool={active}
        onToolChange={setActive}
        tools={TOOLS}
      />

      <main className="flex-1">
        {active === "alias" && <AliasHero />}
        {active !== "alias" && <ToolHeader tool={active} />}

        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6">
          {active === "alias" && <AliasGenerator />}
          {active === "password" && <PasswordGenerator />}
          {active === "username" && <UsernameGenerator />}
          {active === "validator" && <EmailValidator />}
          {active === "qr" && <QrGenerator />}
        </section>

        {active === "alias" && <FeatureStrip onToolChange={setActive} />}
      </main>

      <SiteFooter />
    </div>
  );
}

function AliasHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            <span>أداة مجانية — بدون تسجيل — تعمل في متصفحك</span>
          </div>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">
            ولّد ألقاب{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">Gmail</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-foreground/10" />
            </span>{" "}
            بكميات لا حصر لها
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
            استغل ميزة Gmail التي تتجاهل النقاط وعلامة + لتوليد آلاف الألقاب التي
            تصلك جميعاً في صندوق واحد. استخدمها لتسجيل حسابات متعددة، تتبّع مصادر
            الرسائل، وحماية بريدك الأساسي من السبام.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Stat icon={<Zap className="h-3.5 w-3.5" />} text="توليد فوري" />
            <Stat icon={<ShieldCheck className="h-3.5 w-3.5" />} text="خصوصية كاملة" />
            <Stat icon={<Star className="h-3.5 w-3.5" />} text="حتى 5000 لقب دفعة واحدة" />
            <Stat icon={<Github className="h-3.5 w-3.5" />} text="تصدير TXT/CSV" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {icon}
      <span>{text}</span>
    </span>
  );
}

function ToolHeader({ tool }: { tool: string }) {
  const info: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
    password: {
      title: "مولّد كلمات المرور",
      desc: "كلمات مرور قوية وعشوائية بمواصفاتك، تُولّد محلياً بأمان كامل.",
      icon: <KeyRound className="h-5 w-5" />,
    },
    username: {
      title: "مولّد أسماء المستخدمين",
      desc: "أنشئ أسماء مستخدمين فريدة وقابلة للتذكّر لأنشطتك المتعددة.",
      icon: <User className="h-5 w-5" />,
    },
    validator: {
      title: "فاحص البريد الإلكتروني",
      desc: "تحقق من صحة البريد واكتشف ألقاب Gmail المخفية بضغطة واحدة.",
      icon: <Mail className="h-5 w-5" />,
    },
    qr: {
      title: "مولّد رمز QR",
      desc: "حوّل أي بريد أو نص أو رابط إلى رمز QR قابل للمسح والتحميل.",
      icon: <QrCode className="h-5 w-5" />,
    },
  };
  const i = info[tool];
  if (!i) return null;
  return (
    <section className="border-b border-border/80 bg-muted/20">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-6 sm:px-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-foreground text-background">
          {i.icon}
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            {i.title}
          </h1>
          <p className="text-sm text-muted-foreground">{i.desc}</p>
        </div>
      </div>
    </section>
  );
}

function FeatureStrip({ onToolChange }: { onToolChange: (id: string) => void }) {
  const cards = [
    {
      id: "password",
      icon: <KeyRound className="h-5 w-5" />,
      title: "كلمات مرور قوية",
      desc: "ولّد كلمات مرور آمنة لكل حساب جديد تنشئه بلقب مختلف.",
    },
    {
      id: "username",
      icon: <User className="h-5 w-5" />,
      title: "أسماء مستخدمين",
      desc: "أسماء فريدة لإكمال ملفك عند التسجيل في المواقع والخدمات.",
    },
    {
      id: "validator",
      icon: <Mail className="h-5 w-5" />,
      title: "فاحص البريد",
      desc: "تأكد من صحة أي بريد واكتشف إن كان لقباً معاد توجيهه.",
    },
    {
      id: "qr",
      icon: <QrCode className="h-5 w-5" />,
      title: "رمز QR",
      desc: "حوّل ألقابك إلى رمز QR لمشاركتها أو طباعتها بسهولة.",
    },
  ];
  return (
    <section className="border-t border-border/80 bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
              أدوات بريدية متكاملة
            </h2>
            <p className="text-sm text-muted-foreground">
              كل ما تحتاجه لإدارة حساباتك المتعددة في مكان واحد.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => onToolChange(c.id)}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-background p-5 text-start transition-all hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background transition-transform group-hover:scale-110">
                {c.icon}
              </span>
              <div className="space-y-1">
                <p className="text-sm font-bold">{c.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {c.desc}
                </p>
              </div>
              <span className="mt-auto text-xs font-bold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                افتح الأداة ←
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
