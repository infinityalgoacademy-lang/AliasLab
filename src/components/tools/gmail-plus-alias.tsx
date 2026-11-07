"use client";

import { useState } from "react";
import { Check, Copy, Mail, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { createGmailPlusAlias } from "@/lib/alias";

const TAG_SUGGESTIONS = ["shop", "newsletter", "work", "community"];

export function GmailPlusAlias() {
  const [email, setEmail] = useState("");
  const [tag, setTag] = useState("");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const { copy } = useClipboard();

  const createAlias = () => {
    const result = createGmailPlusAlias(email, tag);
    if ("error" in result) {
      setAlias("");
      setError(result.error);
      return;
    }

    setError("");
    setAlias(result.alias);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    createAlias();
  };

  const updateEmail = (value: string) => {
    setEmail(value);
    setAlias("");
    setError("");
  };

  const updateTag = (value: string) => {
    setTag(value);
    setAlias("");
    setError("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="h-fit border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">إنشاء لقب Gmail للخصوصية</CardTitle>
          <CardDescription>
            أنشئ عنوانًا واحدًا بعلامة + لتعرف أي مصدر أرسل الرسالة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-5">
            <Field>
              <Label htmlFor="privacy-gmail" className="text-sm font-bold">
                بريد Gmail الأساسي
              </Label>
              <Input
                id="privacy-gmail"
                type="email"
                dir="ltr"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(event) => updateEmail(event.target.value)}
                onKeyDown={handleInputKeyDown}
                autoComplete="email"
                spellCheck={false}
                aria-describedby="privacy-gmail-help"
                className="text-left font-mono"
              />
              <p id="privacy-gmail-help" className="text-xs text-muted-foreground">
                يُستخدم العنوان داخل متصفحك لإنشاء اللقب فقط.
              </p>
            </Field>

            <Field>
              <Label htmlFor="privacy-tag" className="text-sm font-bold">
                تصنيف مختصر
              </Label>
              <Input
                id="privacy-tag"
                dir="ltr"
                placeholder="shop"
                value={tag}
                onChange={(event) => updateTag(event.target.value)}
                onKeyDown={handleInputKeyDown}
                autoComplete="off"
                maxLength={30}
                spellCheck={false}
                aria-describedby="privacy-tag-help"
                className="text-left font-mono"
              />
              <p id="privacy-tag-help" className="text-xs text-muted-foreground">
                استخدم أحرفًا إنجليزية أو أرقامًا، مثل shop أو newsletter.
              </p>
              <div role="group" aria-label="تصنيفات مقترحة" className="flex flex-wrap gap-2">
                {TAG_SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateTag(suggestion)}
                    aria-pressed={tag === suggestion}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </Field>

            <Button type="button" onClick={createAlias} className="w-full">
              <Mail data-icon="inline-start" />
              إنشاء لقب واحد
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Alert>
          <ShieldCheck />
          <AlertTitle>رسائل تصل إلى بريدك الحالي</AlertTitle>
          <AlertDescription>
            هذا ليس صندوقًا منفصلًا ولا بريدًا مؤقتًا؛ إنه عنوان Gmail بعلامة +
            وتصل رسائله إلى صندوقك الأصلي. لا يمكن تعطيله من AliasLab، وقد ترفض
            بعض المواقع علامة + أو تتعامل معها كالعنوان الأساسي.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" role="alert">
            <AlertTitle>تعذّر إنشاء اللقب</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="min-h-52 border-border/80" aria-live="polite">
          {alias ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Check className="size-4" aria-hidden="true" />
                  لقبك جاهز
                </CardTitle>
                <CardDescription>
                  استخدمه عندما تريد ربط الرسائل بهذا التصنيف.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <code
                  dir="ltr"
                  className="block break-all rounded-lg border border-border bg-muted/40 p-4 text-left font-mono text-sm"
                >
                  {alias}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copy(alias, "تم نسخ لقب Gmail")}
                  className="self-start"
                >
                  <Copy data-icon="inline-start" />
                  نسخ العنوان
                </Button>
              </CardContent>
            </>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Mail className="size-5 text-muted-foreground" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold">سيظهر اللقب هنا</p>
                <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                  أدخل بريد Gmail وتصنيفًا قصيرًا، ثم أنشئ العنوان وانسخه.
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base">إدارة الرسائل في Gmail</CardTitle>
            <CardDescription>
              إذا أردت تنظيم الرسائل حسب اللقب، أنشئ فلترًا في إعدادات Gmail
              باستخدام العنوان الكامل.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="https://mail.google.com/mail/u/0/#settings/filters"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold underline underline-offset-4"
            >
              فتح فلاتر Gmail
              <span className="sr-only"> في علامة تبويب جديدة</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
