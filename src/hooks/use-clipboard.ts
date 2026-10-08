"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string, message?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(message ?? "تم النسخ إلى الحافظة");
      setTimeout(() => setCopied(false), 1500);
      return true;
    } catch {
      // Fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        toast.success(message ?? "تم النسخ إلى الحافظة");
        setTimeout(() => setCopied(false), 1500);
        return true;
      } catch {
        toast.error("تعذّر النسخ");
        return false;
      }
    }
  }, []);

  return { copied, copy };
}
