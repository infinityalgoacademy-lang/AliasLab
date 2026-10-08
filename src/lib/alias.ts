/**
 * Gmail Alias Generation utilities.
 *
 * Gmail ignores dots in the local part of the address and ignores
 * everything after a "+" sign. This means:
 *   user@gmail.com  ==  u.s.e.r@gmail.com  ==  user+anything@gmail.com
 *
 * We use these two rules to generate many aliases that all deliver
 * to the same inbox.
 */

export type AliasMode = "dots" | "plus" | "both";
export type PlusTagStyle = "numbered" | "random" | "word";

const TAG_WORDS = [
  "shop", "news", "work", "spam", "social", "promo", "test", "dev",
  "admin", "mail", "inbox", "temp", "alias", "private", "public",
  "forum", "game", "blog", "store", "app", "web", "info", "help",
  "team", "jobs", "billing", "support", "notify", "alert", "updates",
];

const RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomString(length: number): string {
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    out += RANDOM_CHARS[arr[i] % RANDOM_CHARS.length];
  }
  return out;
}

function randomWord(): string {
  const arr = new Uint32Array(2);
  crypto.getRandomValues(arr);
  const w1 = TAG_WORDS[arr[0] % TAG_WORDS.length];
  const w2 = TAG_WORDS[arr[1] % TAG_WORDS.length];
  // Sometimes combine two words with a dot or number suffix
  const style = arr[0] % 3;
  if (style === 0) return `${w1}.${w2}`;
  if (style === 1) return `${w1}${arr[1] % 100}`;
  return w1;
}

/**
 * Generate every dot-variation of a local part.
 * For a local part of length N there are 2^(N-1) combinations.
 */
export function generateDotVariations(localPart: string): string[] {
  const n = localPart.length;
  if (n <= 1) return [localPart];
  // Cap to avoid runaway memory: 2^(n-1) grows fast.
  const maxCombos = 1 << Math.min(n - 1, 24);
  const results: string[] = [];
  for (let mask = 0; mask < maxCombos; mask++) {
    let built = localPart[0];
    for (let j = 0; j < n - 1; j++) {
      if ((mask >> j) & 1) {
        built += ".";
      }
      built += localPart[j + 1];
    }
    results.push(built);
  }
  return results;
}

/**
 * Generate plus-tag aliases.
 */
export function generatePlusAliases(
  localPart: string,
  domain: string,
  count: number,
  style: PlusTagStyle,
  startIndex = 1,
): string[] {
  const results: string[] = [];
  const seen = new Set<string>();
  let i = 0;
  let safety = 0;
  while (results.length < count && safety < count * 20) {
    let tag: string;
    if (style === "numbered") {
      tag = String(startIndex + i);
      i++;
    } else if (style === "random") {
      tag = randomString(6);
    } else {
      tag = randomWord();
    }
    const alias = `${localPart}+${tag}@${domain}`;
    if (!seen.has(alias)) {
      seen.add(alias);
      results.push(alias);
    }
    safety++;
  }
  return results;
}

export interface GenerateOptions {
  email: string;
  mode: AliasMode;
  count: number;
  plusStyle: PlusTagStyle;
  /** When mode is "both", how many of the count should use plus tags. 0..1 */
  plusRatio?: number;
  /** Whether to also apply dot variations when using plus tags (mode "both"). */
  applyDotsToPlus?: boolean;
}

export interface GenerateResult {
  aliases: string[];
  localPart: string;
  domain: string;
  baseEmail: string;
  warnings: string[];
}

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

export function parseEmail(email: string): { localPart: string; domain: string } | null {
  const trimmed = email.trim().toLowerCase();
  const match = trimmed.match(EMAIL_RE);
  if (!match) return null;
  // Gmail also accepts googlemail.com
  return { localPart: match[0].split("@")[0], domain: match[1] };
}

export function isGmailDomain(domain: string): boolean {
  return domain === "gmail.com" || domain === "googlemail.com";
}

/**
 * Main generation entry point.
 */
export function generateAliases(opts: GenerateOptions): GenerateResult {
  const warnings: string[] = [];
  const parsed = parseEmail(opts.email);
  if (!parsed) {
    return {
      aliases: [],
      localPart: "",
      domain: "",
      baseEmail: opts.email,
      warnings: ["صيغة البريد غير صحيحة. مثال: name@gmail.com"],
    };
  }

  const { localPart, domain } = parsed;
  const baseEmail = `${localPart}@${domain}`;

  if (!isGmailDomain(domain)) {
    warnings.push(
      "تنبيه: خدعة النقطة وعلامة + تعمل فقط مع بريد Gmail و Googlemail. باقي مزوّدي البريد قد لا يتجاهلونها.",
    );
  }

  // Sanitize the local part: Gmail ignores dots, so strip existing dots for the
  // dot-variation algorithm to avoid duplicates like u..ser.
  const cleanLocal = localPart.replace(/\./g, "");
  if (cleanLocal.length < 2) {
    warnings.push("الجزء المحلي قصير جداً لتوليد تنويعات بالنقاط.");
  }

  const count = Math.max(1, Math.min(opts.count, 5000));
  let aliases: string[] = [];

  if (opts.mode === "dots") {
    const dots = generateDotVariations(cleanLocal);
    // Shuffle and take count
    const shuffled = shuffle(dots);
    aliases = shuffled.slice(0, count).map((lp) => `${lp}@${domain}`);
    if (count > dots.length) {
      warnings.push(
        `الحد الأقصى لتنويعات النقاط لهذا العنوان هو ${dots.length} فقط. تم توليد ${dots.length}. استخدم وضع + لتوليد المزيد.`,
      );
    }
  } else if (opts.mode === "plus") {
    aliases = generatePlusAliases(localPart, domain, count, opts.plusStyle);
  } else {
    // both: mix dot variations and plus tags
    const plusRatio = opts.plusRatio ?? 0.6;
    const plusCount = Math.round(count * plusRatio);
    const dotCount = count - plusCount;

    const dots = generateDotVariations(cleanLocal);
    const shuffledDots = shuffle(dots);
    const dotAliases = shuffledDots.slice(0, dotCount).map((lp) => `${lp}@${domain}`);

    // For plus aliases, optionally also apply a random dot variation to the local part
    let plusAliases: string[] = [];
    if (opts.applyDotsToPlus && dots.length > 1) {
      plusAliases = generatePlusAliases(localPart, domain, plusCount, opts.plusStyle).map(
        (alias) => {
          const [lp, dom] = alias.split("@");
          const plusIdx = lp.indexOf("+");
          const base = lp.slice(0, plusIdx);
          const tag = lp.slice(plusIdx);
          const dotted = shuffledDots[Math.floor(Math.random() * Math.min(dots.length, 8))];
          return `${dotted}${tag}@${dom}`;
        },
      );
    } else {
      plusAliases = generatePlusAliases(localPart, domain, plusCount, opts.plusStyle);
    }

    aliases = [...dotAliases, ...plusAliases];
    aliases = shuffle(aliases).slice(0, count);

    if (dotCount > dots.length) {
      warnings.push(
        `تنويعات النقاط محدودة بـ ${dots.length}، وتم تعويض الباقي بألقاب +.`,
      );
    }
  }

  return {
    aliases,
    localPart,
    domain,
    baseEmail,
    warnings,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Given an alias email, decode it back to the base email (strip dots and +tag).
 */
export function decodeAlias(alias: string): string | null {
  const parsed = parseEmail(alias);
  if (!parsed) return null;
  const plusIdx = parsed.localPart.indexOf("+");
  let base = parsed.localPart;
  if (plusIdx >= 0) base = base.slice(0, plusIdx);
  base = base.replace(/\./g, "");
  return `${base}@${parsed.domain}`;
}
