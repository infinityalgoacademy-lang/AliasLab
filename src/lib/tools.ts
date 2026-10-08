/**
 * Additional tool utilities: password generation, username generation,
 * and email validation.
 */

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/";

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const AMBIGUOUS = new Set(["l", "I", "1", "O", "0", "o", "|", "`", "'"]);

function pickFrom(set: string, excludeAmbiguous: boolean): string {
  let pool = set;
  if (excludeAmbiguous) {
    pool = [...set].filter((c) => !AMBIGUOUS.has(c)).join("");
  }
  if (pool.length === 0) return "";
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return pool[arr[0] % pool.length];
}

function shuffleString(s: string): string {
  const a = [...s];
  for (let i = a.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = arr[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join("");
}

export function generatePassword(opts: PasswordOptions): string {
  let pools: string[] = [];
  if (opts.lowercase) pools.push(opts.excludeAmbiguous ? filterAmbiguous(LOWER) : LOWER);
  if (opts.uppercase) pools.push(opts.excludeAmbiguous ? filterAmbiguous(UPPER) : UPPER);
  if (opts.digits) pools.push(opts.excludeAmbiguous ? filterAmbiguous(DIGITS) : DIGITS);
  if (opts.symbols) pools.push(SYMBOLS);

  pools = pools.filter((p) => p.length > 0);
  if (pools.length === 0) return "";

  const length = Math.max(4, Math.min(opts.length, 128));
  let result = "";

  // Guarantee at least one from each selected pool
  for (const pool of pools) {
    result += pickFrom(pool, false);
  }

  const combined = pools.join("");
  while (result.length < length) {
    result += pickFrom(combined, false);
  }

  return shuffleString(result.slice(0, length));
}

function filterAmbiguous(s: string): string {
  return [...s].filter((c) => !AMBIGUOUS.has(c)).join("");
}

export function passwordStrength(pw: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  entropy: number;
} {
  if (!pw) return { score: 0, label: "فارغ", entropy: 0 };
  let poolSize = 0;
  if (/[a-z]/.test(pw)) poolSize += 26;
  if (/[A-Z]/.test(pw)) poolSize += 26;
  if (/[0-9]/.test(pw)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) poolSize += 24;
  const entropy = pw.length * Math.log2(poolSize || 1);
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (entropy >= 28) score = 1;
  if (entropy >= 50) score = 2;
  if (entropy >= 70) score = 3;
  if (entropy >= 100) score = 4;
  const labels = ["ضعيف جداً", "ضعيف", "متوسط", "قوي", "قوي جداً"];
  return { score, label: labels[score], entropy: Math.round(entropy) };
}

/* ---------------- Username generation ---------------- */

const ADJECTIVES = [
  "swift", "calm", "bright", "lucky", "noble", "wild", "cosmic", "silent",
  "golden", "crimson", "azure", "mystic", "brave", "clever", "rapid", "cosmic",
  "frozen", "lunar", "solar", "vivid", "amber", "onyx", "jade", "cobalt",
];

const NOUNS = [
  "falcon", "tiger", "raven", "wolf", "phoenix", "dragon", "panther", "hawk",
  "comet", "nebula", "vector", "cipher", "pixel", "quartz", "orbit", "prism",
  "ember", "storm", "frost", "blade", "echo", "nova", "spark", "vortex",
];

export interface UsernameOptions {
  pattern: "adjective-noun" | "noun-number" | "random" | "word-word";
  separator: string;
  capitalize: boolean;
  numbers: boolean;
  maxLength?: number;
}

export function generateUsername(opts: UsernameOptions): string {
  const rand = new Uint32Array(2);
  crypto.getRandomValues(rand);
  let name = "";

  switch (opts.pattern) {
    case "adjective-noun": {
      const adj = ADJECTIVES[rand[0] % ADJECTIVES.length];
      const noun = NOUNS[rand[1] % NOUNS.length];
      name = `${adj}${opts.separator}${noun}`;
      break;
    }
    case "noun-number": {
      const noun = NOUNS[rand[0] % NOUNS.length];
      name = `${noun}${opts.separator}${rand[1] % 10000}`;
      break;
    }
    case "word-word": {
      const w1 = NOUNS[rand[0] % NOUNS.length];
      const w2 = ADJECTIVES[rand[1] % ADJECTIVES.length];
      name = `${w1}${opts.separator}${w2}`;
      break;
    }
    case "random":
    default: {
      name = randomLetters(6 + (rand[0] % 4));
      break;
    }
  }

  if (opts.capitalize) {
    name = name
      .split(opts.separator)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(opts.separator);
  }

  if (opts.numbers && opts.pattern !== "noun-number") {
    name += `${opts.separator}${rand[1] % 1000}`;
  }

  if (opts.maxLength && name.length > opts.maxLength) {
    name = name.slice(0, opts.maxLength);
  }

  return name;
}

function randomLetters(n: number): string {
  const arr = new Uint32Array(n);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < n; i++) out += LOWER[arr[i] % 26];
  return out;
}

/* ---------------- Email validation ---------------- */

export interface EmailValidationResult {
  valid: boolean;
  email: string;
  localPart: string;
  domain: string;
  isGmail: boolean;
  isAlias: boolean;
  baseEmail: string | null;
  issues: string[];
  suggestions: string[];
}

export function validateEmail(email: string): EmailValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const trimmed = email.trim();

  if (!trimmed) {
    return {
      valid: false,
      email: "",
      localPart: "",
      domain: "",
      isGmail: false,
      isAlias: false,
      baseEmail: null,
      issues: ["البريد فارغ"],
      suggestions: [],
    };
  }

  // Basic structure
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) {
    issues.push("يجب أن يحتوي البريد على علامة @ واحدة بالضبط.");
  }

  const [localPart, domain] = trimmed.split("@");
  if (!localPart || localPart.length > 64) {
    issues.push("الجزء المحلي (قبل @) فارغ أو أطول من 64 حرفاً.");
  }
  if (!domain || domain.length > 255) {
    issues.push("نطاق البريد (بعد @) غير صالح.");
  }

  if (localPart && (localPart.startsWith(".") || localPart.endsWith("."))) {
    issues.push("الجزء المحلي لا يبدأ أو ينتهي بنقطة.");
  }
  if (localPart && localPart.includes("..")) {
    issues.push("الجزء المحلي يحتوي على نقطتين متتاليتين.");
  }

  const domainValid = domain && /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain);
  if (domain && !domainValid) {
    issues.push("صيغة النطاق غير صحيحة.");
  }

  const valid = issues.length === 0 && !!localPart && !!domainValid;
  const isGmail = domain === "gmail.com" || domain === "googlemail.com";
  const isAlias = isGmail && (localPart.includes(".") || localPart.includes("+"));
  let baseEmail: string | null = null;
  if (isGmail) {
    let base = localPart;
    const plusIdx = base.indexOf("+");
    if (plusIdx >= 0) base = base.slice(0, plusIdx);
    base = base.replace(/\./g, "");
    baseEmail = `${base}@${domain}`;
  }

  if (isAlias) {
    suggestions.push(`هذا البريد هو في الحقيقة نفس: ${baseEmail}`);
  }
  if (domain === "gnail.com" || domain === "gmal.com" || domain === "gmai.com") {
    suggestions.push("هل تقصد gmail.com؟");
  }

  return {
    valid,
    email: trimmed,
    localPart: localPart || "",
    domain: domain || "",
    isGmail,
    isAlias,
    baseEmail,
    issues,
    suggestions,
  };
}
