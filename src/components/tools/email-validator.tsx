"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Mail,
  MailCheck,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateEmail } from "@/lib/tools";

export function EmailValidator() {
  const [email, setEmail] = useState("");

  const result = useMemo(() => validateEmail(email), [email]);

  const examples = [
    "ahmed@gmail.com",
    "a.h.m.e.d@gmail.com",
    "ahmed+shop@gmail.com",
    "ahmed@gnail.com",
    "invalid-email",
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="border-border/80">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="val-email" className="flex items-center gap-2 text-sm font-bold">
              <Mail className="h-4 w-4" />
              البريد للتحقق منه
            </Label>
            <Input
              id="val-email"
              dir="ltr"
              placeholder="اكتب أو الصق بريداً إلكترونياً..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-left font-mono"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground">جرّب:</span>
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setEmail(ex)}
                  className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-accent"
                  dir="ltr"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {email.trim() === "" ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border text-center">
              <MailCheck className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                أدخل بريداً للتحقق من صحة صيغته واكتشاف ما إذا كان لقباً معاد
                توجيهه من Gmail.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Verdict */}
              <div
                className={`flex items-center gap-3 rounded-lg border p-4 ${
                  result.valid
                    ? "border-foreground/30 bg-foreground/5"
                    : "border-red-500/40 bg-red-50/60 dark:bg-red-950/20"
                }`}
              >
                {result.valid ? (
                  <CheckCircle2 className="h-6 w-6 shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 shrink-0 text-red-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {result.valid ? "بريد صالح" : "بريد غير صالح"}
                  </p>
                  <p dir="ltr" className="truncate text-xs text-muted-foreground">
                    {result.email}
                  </p>
                </div>
                {result.isGmail && (
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Sparkles className="h-3 w-3" /> Gmail
                  </Badge>
                )}
                {result.isAlias && (
                  <Badge variant="outline" className="text-[10px]">
                    لقب
                  </Badge>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailCell label="الجزء المحلي" value={result.localPart || "—"} mono />
                <DetailCell label="النطاق" value={result.domain || "—"} mono />
                <DetailCell
                  label="النوع"
                  value={result.isGmail ? "Gmail" : "عام"}
                />
                <DetailCell
                  label="لقب؟"
                  value={result.isAlias ? "نعم" : "لا"}
                />
              </div>

              {/* Base email reveal */}
              {result.isAlias && result.baseEmail && (
                <Alert className="border-foreground/30 bg-foreground/5">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-sm font-bold">
                    هذا اللقب يصل إلى نفس صندوق:
                  </AlertTitle>
                  <AlertDescription>
                    <code
                      dir="ltr"
                      className="font-mono text-sm font-bold"
                    >
                      {result.baseEmail}
                    </code>
                  </AlertDescription>
                </Alert>
              )}

              {/* Issues */}
              {result.issues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-red-500">مشاكل مكتشفة:</p>
                  <ul className="space-y-1.5">
                    {result.issues.map((iss, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-50/40 p-2 text-xs dark:bg-red-950/10"
                      >
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                        <span>{iss}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold">اقتراحات:</p>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-2 text-xs"
                      >
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info side */}
      <Card className="h-fit border-border/80 bg-muted/30">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="text-sm font-bold">كيف يعمل كاشف الألقاب؟</span>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
            <p>
              يفحص هذا التحليل صيغة البريد ويتحقق من القواعد المعروفة لـ Gmail
              التي تتيح لك إنشاء ألقاب لا حصر لها:
            </p>
            <div className="space-y-2.5">
              <div className="rounded-md border border-border bg-background p-2.5">
                <p className="font-bold text-foreground">1. تجاهل النقاط</p>
                <p dir="ltr" className="font-mono text-[11px]">
                  u.s.e.r@gmail.com = user@gmail.com
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-2.5">
                <p className="font-bold text-foreground">2. علامة الزائد +</p>
                <p dir="ltr" className="font-mono text-[11px]">
                  user+shop@gmail.com = user@gmail.com
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-2.5">
                <p className="font-bold text-foreground">3. googlemail.com</p>
                <p dir="ltr" className="font-mono text-[11px]">
                  user@googlemail.com = user@gmail.com
                </p>
              </div>
            </div>
            <p>
              استخدم هذه الميزة لتتبّع مصدر الرسائل: أعطِ كل خدمة لقباً مختلفاً
              (مثل <code dir="ltr" className="font-mono">+netflix</code>) لتعرف
              من يسرب بريدك.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailCell({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p
        dir="ltr"
        className={`mt-1 truncate text-xs font-bold ${
          mono ? "font-mono" : ""
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
