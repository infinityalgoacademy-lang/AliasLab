"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  generatePassword,
  passwordStrength,
  type PasswordOptions,
} from "@/lib/tools";

const DEFAULTS: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

export function PasswordGenerator() {
  const [opts, setOpts] = useState<PasswordOptions>(DEFAULTS);
  const [password, setPassword] = useState(() => generatePassword(DEFAULTS));
  const [copied, setCopied] = useState(false);

  const generate = () => {
    setPassword(generatePassword(opts));
  };

  const strength = passwordStrength(password);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const toggle = (key: keyof PasswordOptions) => (v: boolean | number) =>
    setOpts((p) => ({ ...p, [key]: v }));

  const strengthBars = [0, 1, 2, 3, 4];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-600",
    "bg-emerald-600",
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="border-border/80">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3">
            <Label className="text-sm font-bold">كلمة المرور المولّدة</Label>
            <div className="relative">
              <Input
                dir="ltr"
                readOnly
                value={password}
                className="h-14 bg-muted/40 pr-12 font-mono text-lg tracking-wide"
              />
              <button
                onClick={handleCopy}
                className="absolute end-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label="نسخ"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Strength */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold">قوة كلمة المرور</span>
              <span className="font-medium">{strength.label}</span>
            </div>
            <div className="flex gap-1">
              {strengthBars.map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i <= strength.score
                      ? strengthColors[strength.score]
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              الإنتروبيا:{" "}
              <span className="font-tabular font-bold">{strength.entropy}</span> بت
              {strength.entropy >= 70
                ? " — يقاوم هجمات القوة الغاشمة"
                : " — يُفضّل رفع الطول"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={generate} className="gap-2 font-bold" size="lg">
              <RefreshCw className="h-4 w-4" />
              توليد جديد
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
              size="lg"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "تم النسخ" : "نسخ"}
            </Button>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">
              قوالب سريعة
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "PIN رقمي", o: { ...DEFAULTS, length: 6, lowercase: false, uppercase: false, symbols: false } },
                { label: "بسيطة 8", o: { ...DEFAULTS, length: 8, symbols: false } },
                { label: "قوية 16", o: { ...DEFAULTS, length: 16 } },
                { label: "معقّدة 24", o: { ...DEFAULTS, length: 24, excludeAmbiguous: true } },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setOpts(p.o);
                    setTimeout(() => setPassword(generatePassword(p.o)), 0);
                  }}
                  className="rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card className="h-fit border-border/80">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-bold">إعدادات التوليد</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold">الطول</Label>
              <Badge variant="outline" className="font-tabular">
                {opts.length}
              </Badge>
            </div>
            <Slider
              value={[opts.length]}
              onValueChange={(v) => {
                toggle("length")(v[0]);
              }}
              min={4}
              max={64}
              step={1}
            />
          </div>

          <div className="space-y-2.5">
            <ToggleRow
              label="أحرف صغيرة (a-z)"
              checked={opts.lowercase}
              onChange={(v) => toggle("lowercase")(v)}
            />
            <ToggleRow
              label="أحرف كبيرة (A-Z)"
              checked={opts.uppercase}
              onChange={(v) => toggle("uppercase")(v)}
            />
            <ToggleRow
              label="أرقام (0-9)"
              checked={opts.digits}
              onChange={(v) => toggle("digits")(v)}
            />
            <ToggleRow
              label="رموز (!@#$%)"
              checked={opts.symbols}
              onChange={(v) => toggle("symbols")(v)}
            />
            <ToggleRow
              label="استبعاد الملتبسة (0,O,l,1)"
              checked={opts.excludeAmbiguous}
              onChange={(v) => toggle("excludeAmbiguous")(v)}
            />
          </div>

          <div className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mb-1 h-3.5 w-3.5" />
            جميع كلمات المرور تُولّد محلياً باستخدام واجهة Web Crypto الآمنة ولا
            تُرسل إلى أي خادم.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
