import { AtSign, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <AtSign className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="font-bold text-foreground">AliasLab</span> — أداة مفتوحة
            لتوليد ألقاب الجيميل
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>صُنع بـ</span>
          <Heart className="h-3.5 w-3.5 fill-foreground text-foreground" />
          <span>للمستخدم العربي</span>
          <span className="mx-1.5">•</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>
      <div className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-3 text-center text-[11px] leading-relaxed text-muted-foreground sm:px-6">
          تنبيه: هذه الأداة تستفيد من ميزة تجاهل Gmail للنقاط وعلامة +. جميع الألقاب
          تصلك إلى نفس صندوق الوارد. لا نخزّن أي بريد تدخله — كل العمليات تجري في
          متصفحك.
        </div>
      </div>
    </footer>
  );
}
