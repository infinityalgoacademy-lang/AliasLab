"use client";

import { useMemo, useState } from "react";
import {
  AtSign,
  Check,
  Copy,
  Download,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClipboard } from "@/hooks/use-clipboard";
import {
  generateAliases,
  isGmailDomain,
  type AliasMode,
  type PlusTagStyle,
} from "@/lib/alias";

const PRESETS: { email: string; label: string }[] = [
  { email: "ahmed@gmail.com", label: "ahmed" },
  { email: "mohammed@gmail.com", label: "mohammed" },
  { email: "sara@gmail.com", label: "sara" },
];

export function AliasGenerator() {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<AliasMode>("both");
  const [count, setCount] = useState(20);
  const [plusStyle, setPlusStyle] = useState<PlusTagStyle>("word");
  const [applyDotsToPlus, setApplyDotsToPlus] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [baseEmail, setBaseEmail] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { copy } = useClipboard();

  const handleGenerate = async () => {
    if (!email.trim()) {
      setResults([]);
      setWarnings(["الرجاء إدخال بريد Gmail أولاً."]);
      return;
    }
    setGenerating(true);
    setWarnings([]);
    await new Promise((r) => setTimeout(r, 120));
    const res = generateAliases({
      email,
      mode,
      count,
      plusStyle,
      applyDotsToPlus,
    });
    setResults(res.aliases);
    setWarnings(res.warnings);
    setBaseEmail(res.baseEmail);
    setSelected(new Set());
    setGenerating(false);
  };

  const toggleSelect = (alias: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(alias)) next.delete(alias);
      else next.add(alias);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results));
  };

  const copyAll = () => {
    if (results.length === 0) return;
    copy(results.join("\n"), `تم نسخ ${results.length} لقب`);
  };

  const copySelected = () => {
    if (selected.size === 0) {
      copy(results.join("\n"), `تم نسخ ${results.length} لقب`);
      return;
    }
    copy([...selected].join("\n"), `تم نسخ ${selected.size} لقب`);
  };

  const exportTxt = () => {
    const text = results.join("\n");
    downloadFile(text, "gmail-aliases.txt", "text/plain");
  };

  const exportCsv = () => {
    const header = "index,alias,base_email\n";
    const rows = results
      .map((a, i) => `${i + 1},${a},${baseEmail}`)
      .join("\n");
    downloadFile(header + rows, "gmail-aliases.csv", "text/csv");
  };

  const clearAll = () => {
    setResults([]);
    setWarnings([]);
    setSelected(new Set());
    setBaseEmail("");
  };

  const maxDotVariations = useMemo(() => {
    const at = email.indexOf("@");
    if (at < 0) return 0;
    const local = email.slice(0, at).replace(/\./g, "");
    if (local.length <= 1) return local.length;
    const n = local.length;
    const exp = Math.min(n - 1, 24);
    return 1 << exp;
  }, [email]);

  const isGmail = useMemo(() => {
    const at = email.indexOf("@");
    if (at < 0) return false;
    return isGmailDomain(email.slice(at + 1).toLowerCase());
  }, [email]);

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      {/* Controls */}
      <Card className="h-fit border-border/80 lg:sticky lg:top-24">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="gmail" className="flex items-center gap-2 text-sm font-bold">
              <Mail className="h-4 w-4" />
              بريد Gmail الأساسي
            </Label>
            <Input
              id="gmail"
              dir="ltr"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-left font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate();
              }}
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground">أمثلة:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.email}
                  onClick={() => setEmail(p.email)}
                  className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-accent"
                  dir="ltr"
                >
                  {p.label}
                </button>
              ))}
            </div>
            {email && (
              <div className="flex items-center gap-1.5 pt-1">
                {isGmail ? (
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Check className="h-3 w-3" /> Gmail متوافق
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
                    ليس Gmail — قد لا تعمل خدعة النقطة
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">نوع التوليد</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as AliasMode)}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { id: "dots", label: "النقاط", hint: "u.s.e.r" },
                { id: "plus", label: "علامة +", hint: "user+shop" },
                { id: "both", label: "الكل", hint: "u.s.er+shop" },
              ].map((m) => (
                <label
                  key={m.id}
                  htmlFor={`mode-${m.id}`}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors ${
                    mode === m.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value={m.id} id={`mode-${m.id}`} className="sr-only" />
                  <span className="text-sm font-bold">{m.label}</span>
                  <span
                    dir="ltr"
                    className={`font-mono text-[10px] ${
                      mode === m.id ? "text-background/80" : "text-muted-foreground"
                    }`}
                  >
                    {m.hint}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Plus style */}
          {(mode === "plus" || mode === "both") && (
            <div className="space-y-2">
              <Label className="text-sm font-bold">أسلوب اللاحقة بعد +</Label>
              <RadioGroup
                value={plusStyle}
                onValueChange={(v) => setPlusStyle(v as PlusTagStyle)}
                className="grid grid-cols-3 gap-2"
              >
                {[
                  { id: "word", label: "كلمات" },
                  { id: "numbered", label: "أرقام" },
                  { id: "random", label: "عشوائي" },
                ].map((s) => (
                  <label
                    key={s.id}
                    htmlFor={`style-${s.id}`}
                    className={`flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                      plusStyle === s.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <RadioGroupItem value={s.id} id={`style-${s.id}`} className="sr-only" />
                    {s.label}
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {mode === "both" && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="dots-plus" className="text-xs font-bold">
                  إضافة نقاط للألقاب ذات +
                </Label>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  يزيد من التشويش ويصعّب التتبّع
                </p>
              </div>
              <Checkbox
                id="dots-plus"
                checked={applyDotsToPlus}
                onCheckedChange={(v) => setApplyDotsToPlus(v === true)}
              />
            </div>
          )}

          {/* Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold">عدد الألقاب</Label>
              <Badge variant="outline" className="font-tabular tabular-nums">
                {count}
              </Badge>
            </div>
            <Slider
              value={[count]}
              onValueChange={(v) => setCount(v[0])}
              min={1}
              max={5000}
              step={1}
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={5000}
                value={count}
                onChange={(e) => {
                  const n = parseInt(e.target.value || "0", 10);
                  setCount(Math.max(1, Math.min(5000, n || 1)));
                }}
                className="font-tabular"
              />
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                حد أقصى 5000
              </span>
            </div>
            {mode === "dots" && maxDotVariations > 0 && (
              <p className="text-[11px] text-muted-foreground">
                تنويعات النقاط المتاحة لهذا العنوان:{" "}
                <span className="font-tabular font-bold text-foreground">
                  {maxDotVariations.toLocaleString("en")}
                </span>
              </p>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full gap-2 text-sm font-bold"
            size="lg"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "جارٍ التوليد..." : "توليد الألقاب"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {warnings.length > 0 && (
          <Alert variant="default" className="border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20">
            <AlertTitle className="text-sm font-bold">تنبيهات</AlertTitle>
            <AlertDescription>
              <ul className="list-disc space-y-1 pr-4 text-xs">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">النتائج</span>
              <Badge variant="secondary" className="font-tabular">
                {results.length.toLocaleString("en")}
              </Badge>
              {baseEmail && (
                <span className="text-[11px] text-muted-foreground" dir="ltr">
                  ← {baseEmail}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={results.length === 0}
                className="gap-1.5 text-xs"
              >
                <Check className="h-3.5 w-3.5" />
                {selected.size === results.length && results.length > 0
                  ? "إلغاء التحديد"
                  : "تحديد الكل"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copySelected}
                disabled={results.length === 0}
                className="gap-1.5 text-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                نسخ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportTxt}
                disabled={results.length === 0}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                disabled={results.length === 0}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={results.length === 0 || generating}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                إعادة
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={results.length === 0}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
                مسح
              </Button>
            </div>
          </div>

          {results.length === 0 ? (
            <EmptyState />
          ) : (
            <ScrollArea className="h-[560px]">
              <div className="divide-y divide-border/60">
                {results.map((alias, idx) => (
                  <AliasRow
                    key={`${alias}-${idx}`}
                    alias={alias}
                    index={idx}
                    selected={selected.has(alias)}
                    onToggle={() => toggleSelect(alias)}
                    onCopy={() => copy(alias)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>
    </div>
  );
}

function AliasRow({
  alias,
  index,
  selected,
  onToggle,
  onCopy,
}: {
  alias: string;
  index: number;
  selected: boolean;
  onToggle: () => void;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
        selected ? "bg-accent/60" : "hover:bg-accent/40"
      }`}
    >
      <span className="w-10 shrink-0 text-end font-tabular text-[11px] text-muted-foreground">
        {(index + 1).toLocaleString("en")}
      </span>
      <span
        dir="ltr"
        className="flex-1 truncate font-mono text-sm"
        title={alias}
      >
        {alias}
      </span>
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          selected
            ? "border-foreground bg-foreground text-background"
            : "border-border hover:border-foreground"
        }`}
        aria-label="تحديد"
      >
        {selected && <Check className="h-3 w-3" />}
      </button>
      <button
        onClick={handleCopy}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        aria-label="نسخ"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-foreground" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[560px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-border">
        <AtSign className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold">لا توجد ألقاب بعد</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          أدخل بريد Gmail، اختر نوع التوليد والعدد، ثم اضغط على زر التوليد لإنشاء
          ألقاب لا حصر لها تصل إلى نفس صندوقك.
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Plus className="h-3 w-3" />
        <span>كافة العمليات تجري محلياً في متصفحك</span>
      </div>
    </div>
  );
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
