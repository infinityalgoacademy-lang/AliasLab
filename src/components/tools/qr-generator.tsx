"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateQrDataUrl, generateQrSvg } from "@/lib/qr";

const PRESETS = [
  { label: "mailto", value: "mailto:ahmed@gmail.com" },
  { label: "اسم واي فاي", value: "WIFI:T:WPA;S:MyNetwork;P:password;;" },
  { label: "رابط", value: "https://aliaslab.dev" },
  { label: "هاتف", value: "tel:+1234567890" },
];

export function QrGenerator() {
  const [text, setText] = useState("mailto:ahmed@gmail.com");
  const [size, setSize] = useState(320);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [svgStr, setSvgStr] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const trimmed = text.trim();
      try {
        const [url, svg] = trimmed
          ? await Promise.all([
              generateQrDataUrl(trimmed, { width: size }),
              generateQrSvg(trimmed, {}),
            ])
          : ["", ""];
        if (cancelled) return;
        setDataUrl(url);
        setSvgStr(svg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text, size]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qr-code.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSvg = () => {
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyDataUrl = async () => {
    if (!dataUrl) return;
    try {
      await navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Preview */}
      <Card className="border-border/80">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
          <div className="relative flex aspect-square w-full max-w-[360px] items-center justify-center rounded-xl border-2 border-border bg-white p-4">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="QR Code"
                className="h-full w-full object-contain"
              />
            ) : (
              !loading && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <QrCode className="h-10 w-10" />
                  <span className="text-xs">أدخل نصاً لتوليد رمز QR</span>
                </div>
              )
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              onClick={downloadPng}
              disabled={!dataUrl}
              className="gap-2 font-bold"
              size="sm"
            >
              <Download className="h-4 w-4" />
              تحميل PNG
            </Button>
            <Button
              variant="outline"
              onClick={downloadSvg}
              disabled={!svgStr}
              className="gap-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              تحميل SVG
            </Button>
            <Button
              variant="outline"
              onClick={copyDataUrl}
              disabled={!dataUrl}
              className="gap-2"
              size="sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              نسخ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="h-fit border-border/80">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="text-sm font-bold">المحتوى</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-text" className="text-xs font-bold">
              النص أو الرابط
            </Label>
            <Textarea
              id="qr-text"
              dir="ltr"
              placeholder="mailto:you@gmail.com"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[88px] bg-muted/30 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold">قوالب سريعة</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setText(p.value)}
                  className="rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold">حجم الصورة</Label>
            <RadioGroup
              value={String(size)}
              onValueChange={(v) => setSize(parseInt(v, 10))}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { v: "220", label: "صغير 220" },
                { v: "320", label: "متوسط 320" },
                { v: "480", label: "كبير 480" },
              ].map((s) => (
                <label
                  key={s.v}
                  htmlFor={`qrsize-${s.v}`}
                  className={`flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                    String(size) === s.v
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value={s.v} id={`qrsize-${s.v}`} className="sr-only" />
                  {s.label}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
            💡 نصيحة: استخدم القالب <code dir="ltr" className="font-mono">mailto:</code>{" "}
            مع أحد ألقاب Gmail لتوليد QR قابل للمسح يفتح تطبيق البريد مباشرة.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
