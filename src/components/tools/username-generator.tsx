"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { generateUsername, type UsernameOptions } from "@/lib/tools";

const DEFAULTS: UsernameOptions = {
  pattern: "adjective-noun",
  separator: "",
  capitalize: false,
  numbers: true,
};

export function UsernameGenerator() {
  const [opts, setOpts] = useState<UsernameOptions>(DEFAULTS);
  const [count, setCount] = useState(12);
  const [results, setResults] = useState<string[]>(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    while (list.length < 12) {
      const u = generateUsername(DEFAULTS);
      if (!seen.has(u)) {
        seen.add(u);
        list.push(u);
      }
    }
    return list;
  });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = () => {
    const list: string[] = [];
    const seen = new Set<string>();
    let safety = 0;
    while (list.length < count && safety < count * 30) {
      const u = generateUsername(opts);
      if (!seen.has(u)) {
        seen.add(u);
        list.push(u);
      }
      safety++;
    }
    setResults(list);
  };

  const toggle = (key: keyof UsernameOptions) => (v: boolean | string) =>
    setOpts((p) => ({ ...p, [key]: v }));

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(results.join("\n"));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit border-border/80">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-bold">إعدادات الاسم</span>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold">النمط</Label>
            <RadioGroup
              value={opts.pattern}
              onValueChange={(v) => toggle("pattern")(v)}
              className="grid grid-cols-2 gap-2"
            >
              {[
                { id: "adjective-noun", label: "صفة + اسم" },
                { id: "noun-number", label: "اسم + رقم" },
                { id: "word-word", label: "كلمة + كلمة" },
                { id: "random", label: "عشوائي" },
              ].map((p) => (
                <label
                  key={p.id}
                  htmlFor={`up-${p.id}`}
                  className={`flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                    opts.pattern === p.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value={p.id} id={`up-${p.id}`} className="sr-only" />
                  {p.label}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold">الفاصل</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: "", label: "بدون" },
                { v: ".", label: "نقطة" },
                { v: "_", label: "شرطة سفلية" },
                { v: "-", label: "شرطة" },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => toggle("separator")(s.v)}
                  className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                    opts.separator === s.v
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">أحرف كبيرة أولى</Label>
              <Checkbox
                checked={opts.capitalize}
                onCheckedChange={(v) => toggle("capitalize")(v === true)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">إضافة أرقام</Label>
              <Checkbox
                checked={opts.numbers}
                onCheckedChange={(v) => toggle("numbers")(v === true)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold">العدد</Label>
              <Badge variant="outline" className="font-tabular">
                {count}
              </Badge>
            </div>
            <Input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(200, parseInt(e.target.value || "1", 10))))
              }
              className="font-tabular"
            />
          </div>

          <Button onClick={generate} className="w-full gap-2 font-bold" size="lg">
            <RefreshCw className="h-4 w-4" />
            توليد الأسماء
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <div className="flex items-center justify-between gap-2 border-b border-border/80 p-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="text-sm font-bold">الأسماء المولّدة</span>
            <Badge variant="secondary" className="font-tabular">
              {results.length}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyAll}
            className="gap-1.5 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            نسخ الكل
          </Button>
        </div>
        <ScrollArea className="h-[560px]">
          <div className="divide-y divide-border/60">
            {results.map((u, i) => (
              <div
                key={`${u}-${i}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/40"
              >
                <span className="w-8 shrink-0 text-end font-tabular text-[11px] text-muted-foreground">
                  {i + 1}
                </span>
                <span dir="ltr" className="flex-1 font-mono text-sm">
                  {u}
                </span>
                <button
                  onClick={() => handleCopy(u, i)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
                  aria-label="نسخ"
                >
                  {copiedIdx === i ? (
                    <Check className="h-3.5 w-3.5 text-foreground" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
