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

function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > 0x1_0000_0000) {
    throw new RangeError("maxExclusive must be an integer between 1 and 2^32");
  }
  const range = 0x1_0000_0000;
  const limit = Math.floor(range / maxExclusive) * maxExclusive;
  const values = new Uint32Array(1);
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return values[0] % maxExclusive;
}

function randomMask(bitCount: number): string {
  const bytes = new Uint8Array(Math.ceil(bitCount / 8));
  crypto.getRandomValues(bytes);
  let mask = "";
  for (let bit = 0; bit < bitCount; bit++) {
    mask += bytes[Math.floor(bit / 8)] & (1 << (bit % 8)) ? "1" : "0";
  }
  return mask;
}

function randomString(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += RANDOM_CHARS[randomInt(RANDOM_CHARS.length)];
  }
  return out;
}

function randomWord(): string {
  const firstIndex = randomInt(TAG_WORDS.length);
  const firstWord = TAG_WORDS[firstIndex];
  const secondWord = TAG_WORDS[randomInt(TAG_WORDS.length)];
  const style = firstIndex % 3;
  if (style === 0) return `${firstWord}.${secondWord}`;
  if (style === 1) return `${firstWord}${randomInt(100)}`;
  return firstWord;
}

function dotVariationCount(localPart: string): number {
  const bitCount = Math.max(0, localPart.length - 1);
  return bitCount >= 13 ? 5001 : 2 ** bitCount;
}

/**
 * Generate a bounded random sample of dot variations so long addresses never
 * require materializing an exponential number of results.
 */
export function generateDotVariations(localPart: string, limit = 5000): string[] {
  const n = localPart.length;
  const boundedLimit = Math.max(0, Math.min(Math.floor(limit), 5000));
  if (boundedLimit === 0 || n === 0 || n > 64) return [];
  if (n === 1) return [localPart];

  const bitCount = n - 1;
  const total = dotVariationCount(localPart);
  const masks = new Set<string>();
  if (total <= boundedLimit) {
    for (let mask = 0; mask < total; mask++) {
      masks.add(mask.toString(2).padStart(bitCount, "0"));
    }
  } else {
    while (masks.size < boundedLimit) masks.add(randomMask(bitCount));
  }

  const results: string[] = [];
  for (const mask of masks) {
    let built = localPart[0];
    for (let j = 0; j < bitCount; j++) {
      if (mask[j] === "1") built += ".";
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
  const targetCount = Number.isFinite(count)
    ? Math.max(0, Math.min(Math.floor(count), 5000))
    : 0;
  const results: string[] = [];
  const seen = new Set<string>();
  let index = 0;
  let safety = 0;
  while (results.length < targetCount && safety < targetCount * 20) {
    let tag: string;
    if (style === "numbered") {
      tag = String(startIndex + index++);
    } else if (style === "random") {
      tag = randomString(6);
    } else {
      tag = randomWord();
    }
    let alias = `${localPart}+${tag}@${domain}`;
    if (seen.has(alias) && style === "word") {
      tag = `${tag}-${index++}`;
      alias = `${localPart}+${tag}@${domain}`;
    }
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

const LOCAL_PART_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const DOMAIN_LABEL_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

export function parseEmail(email: string): { localPart: string; domain: string } | null {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.indexOf("@");
  if (
    atIndex <= 0 ||
    atIndex !== trimmed.lastIndexOf("@") ||
    trimmed.length > 254
  ) {
    return null;
  }

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const labels = domain.split(".");
  if (
    localPart.length > 64 ||
    !LOCAL_PART_RE.test(localPart) ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    domain.length > 253 ||
    labels.length < 2 ||
    labels.some((label) => label.length > 63 || !DOMAIN_LABEL_RE.test(label)) ||
    (labels[labels.length - 1]?.length ?? 0) < 2
  ) {
    return null;
  }

  return { localPart, domain };
}

export function isGmailDomain(domain: string): boolean {
  const normalizedDomain = domain.toLowerCase();
  return normalizedDomain === "gmail.com" || normalizedDomain === "googlemail.com";
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
  const plusIndex = localPart.indexOf("+");
  const inputBaseLocal = plusIndex < 0 ? localPart : localPart.slice(0, plusIndex);
  if (!inputBaseLocal) {
    return {
      aliases: [],
      localPart,
      domain,
      baseEmail: `${localPart}@${domain}`,
      warnings: ["أدخل الجزء الأساسي من عنوان البريد قبل علامة +."],
    };
  }
  const isGmail = isGmailDomain(domain);
  const cleanLocal = isGmail ? inputBaseLocal.replace(/\./g, "") : inputBaseLocal;
  const dotLocal = isGmail ? cleanLocal : inputBaseLocal;
  const baseEmail = `${cleanLocal}@${domain}`;

  if (!isGmail) {
    warnings.push(
      "تنبيه: خدعة النقطة وعلامة + تعمل فقط مع بريد Gmail و Googlemail. باقي مزوّدي البريد قد لا يتجاهلونها.",
    );
  }

  if (cleanLocal.length < 2) {
    warnings.push("الجزء المحلي قصير جداً لتوليد تنويعات بالنقاط.");
  }

  const requestedCount = Number.isFinite(opts.count) ? Math.floor(opts.count) : 1;
  const count = Math.max(1, Math.min(requestedCount, 5000));
  let aliases: string[] = [];

  if (opts.mode === "dots") {
    const totalDots = dotVariationCount(dotLocal);
    const dots = generateDotVariations(dotLocal, count);
    aliases = shuffle(dots).map((lp) => `${lp}@${domain}`);
    if (count > totalDots) {
      warnings.push(
        `الحد الأقصى لتنويعات النقاط لهذا العنوان هو ${totalDots.toString()} فقط. تم توليد ${dots.length}. استخدم وضع + لتوليد المزيد.`,
      );
    }
  } else if (opts.mode === "plus") {
    aliases = generatePlusAliases(cleanLocal, domain, count, opts.plusStyle);
  } else {
    const requestedRatio = opts.plusRatio ?? 0.6;
    const plusRatio = Number.isFinite(requestedRatio)
      ? Math.max(0, Math.min(requestedRatio, 1))
      : 0.6;
    const plusCount = Math.round(count * plusRatio);
    const dotCount = count - plusCount;
    const totalDots = dotVariationCount(dotLocal);
    const dots = generateDotVariations(dotLocal, dotCount);
    const dotAliases = shuffle(dots).map((lp) => `${lp}@${domain}`);

    let plusAliases = generatePlusAliases(cleanLocal, domain, plusCount, opts.plusStyle);
    if (opts.applyDotsToPlus && isGmail && plusCount > 0) {
      const dottedLocals = generateDotVariations(
        cleanLocal,
        Math.min(8, totalDots),
      );
      if (dottedLocals.length > 1) {
        plusAliases = plusAliases.map((alias) => {
          const plusIndex = alias.indexOf("+");
          const domainIndex = alias.lastIndexOf("@");
          const tag = alias.slice(plusIndex, domainIndex);
          const dotted = dottedLocals[randomInt(dottedLocals.length)];
          return `${dotted}${tag}@${domain}`;
        });
      }
    }

    aliases = shuffle([...dotAliases, ...plusAliases]).slice(0, count);
    if (dotCount > totalDots) {
      warnings.push(
        `تنويعات النقاط محدودة بـ ${totalDots.toString()}، وتم تعويض الباقي بألقاب +.`,
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
    const j = randomInt(i + 1);
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
