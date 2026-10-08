"use client";

import { AtSign, Github, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  activeTool: string;
  onToolChange: (id: string) => void;
  tools: { id: string; label: string; icon: React.ReactNode }[];
}

export function SiteHeader({ activeTool, onToolChange, tools }: SiteHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <button
          onClick={() => onToolChange("alias")}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="AliasLab الرئيسية"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <AtSign className="h-5 w-5" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-base font-extrabold tracking-tight">AliasLab</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              أدوات بريد الجيميل
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="الأدوات">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTool === tool.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="تبديل الوضع"
            className="h-9 w-9"
          >
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="block h-4 w-4 dark:hidden" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden h-9 w-9 sm:inline-flex"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="المصدر"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Mobile tool nav */}
      <div className="border-t border-border/60 md:hidden">
        <div className="custom-scroll flex gap-1 overflow-x-auto px-3 py-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTool === tool.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
