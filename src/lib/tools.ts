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

function randomInt(maxExclusive: number): number {
  const range = 0x1_0000_0000;
  const limit = Math.floor(range / maxExclusive) * maxExclusive;
  const values = new Uint32Array(1);
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return values[0] % maxExclusive;
}

function pickFrom(set: string, excludeAmbiguous: boolean): string {
  let pool = set;
  if (excludeAmbiguous) {
    pool = [...set].filter((character) => !AMBIGUOUS.has(character)).join("");
  }
  if (pool.length === 0) return "";
  return pool[randomInt(pool.length)];
}

function shuffleString(value: string): string {
  const characters = [...value];
  for (let i = characters.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }
  return characters.join("");
}

export function generatePassword(opts: PasswordOptions): string {
  let pools: string[] = [];
  if (opts.lowercase) pools.push(opts.excludeAmbiguous ? filterAmbiguous(LOWER) : LOWER);
  if (opts.uppercase) pools.push(opts.excludeAmbiguous ? filterAmbiguous(UPPER) : UPPER);
  if (opts.digits) pools.push(opts.excludeAmbiguous ? filterAmbiguous(DIGITS) : DIGITS);
  if (opts.symbols) pools.push(SYMBOLS);

  pools = pools.filter((p) => p.length > 0);
  if (pools.length === 0) return "";

  const requestedLength = Number.isFinite(opts.length) ? Math.floor(opts.length) : 16;
  const length = Math.max(4, Math.min(requestedLength, 128));
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
  if (/[^a-zA-Z0-9]/.test(pw)) poolSize += SYMBOLS.length;
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
  let name = "";

  switch (opts.pattern) {
    case "adjective-noun": {
      const adjective = ADJECTIVES[randomInt(ADJECTIVES.length)];
      const noun = NOUNS[randomInt(NOUNS.length)];
      name = `${adjective}${opts.separator}${noun}`;
      break;
    }
    case "noun-number": {
      const noun = NOUNS[randomInt(NOUNS.length)];
      name = `${noun}${opts.separator}${randomInt(10000)}`;
      break;
    }
    case "word-word": {
      const firstWord = NOUNS[randomInt(NOUNS.length)];
      const secondWord = ADJECTIVES[randomInt(ADJECTIVES.length)];
      name = `${firstWord}${opts.separator}${secondWord}`;
      break;
    }
    case "random":
    default: {
      name = randomLetters(6 + randomInt(4));
      break;
    }
  }

  if (opts.capitalize) {
    name = name
      .split(opts.separator)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(opts.separator);
  }

  if (opts.numbers && opts.pattern !== "noun-number") {
    name += `${opts.separator}${randomInt(1000)}`;
  }

  if (opts.maxLength && name.length > opts.maxLength) {
    name = name.slice(0, opts.maxLength);
  }

  return name;
}

function randomLetters(length: number): string {
  let output = "";
  for (let i = 0; i < length; i++) output += LOWER[randomInt(LOWER.length)];
  return output;
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

  const atCount = (trimmed.match(/@/g) || []).length;
  const atIndex = trimmed.indexOf("@");
  if (atCount !== 1) {
    issues.push("يجب أن يحتوي البريد على علامة @ واحدة بالضبط.");
  }
  if (trimmed.length > 254) {
    issues.push("البريد أطول من الحد المسموح به (254 حرفاً).");
  }

  const localPart = atIndex > 0 ? trimmed.slice(0, atIndex) : "";
  const domain = atIndex >= 0 ? trimmed.slice(atIndex + 1) : "";
  if (!localPart || localPart.length > 64) {
    issues.push("الجزء المحلي (قبل @) فارغ أو أطول من 64 حرفاً.");
  }
  if (localPart) {
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
      issues.push("الجزء المحلي يحتوي على أحرف غير مسموح بها.");
    }
    if (
      localPart.startsWith(".") ||
      localPart.endsWith(".") ||
      localPart.includes("..")
    ) {
      issues.push("الجزء المحلي لا يمكن أن يبدأ أو ينتهي بنقطة أو يحتوي نقطتين متتاليتين.");
    }
  }

  const labels = domain.toLowerCase().split(".");
  const domainValid =
    domain.length <= 253 &&
    labels.length >= 2 &&
    labels.every(
      (label) =>
        label.length <= 63 &&
        /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label),
    ) &&
    (labels.at(-1)?.length ?? 0) >= 2;
  if (!domain || !domainValid) {
    issues.push("صيغة النطاق غير صحيحة.");
  }

  const valid = issues.length === 0 && !!localPart && !!domainValid;
  const normalizedDomain = domain.toLowerCase();
  const isGmail =
    normalizedDomain === "gmail.com" || normalizedDomain === "googlemail.com";
  const isAlias =
    valid && isGmail && (localPart.includes(".") || localPart.includes("+"));
  let baseEmail: string | null = null;
  if (isGmail) {
    let base = localPart.toLowerCase();
    const plusIndex = base.indexOf("+");
    if (plusIndex >= 0) base = base.slice(0, plusIndex);
    base = base.replace(/\./g, "");
    baseEmail = `${base}@${normalizedDomain}`;
  }

  if (isAlias) {
    suggestions.push(`هذا البريد هو في الحقيقة نفس: ${baseEmail}`);
  }
  if (["gnail.com", "gmal.com", "gmai.com"].includes(normalizedDomain)) {
    suggestions.push("هل تقصد gmail.com؟");
  }

  return {
    valid,
    email: trimmed,
    localPart,
    domain,
    isGmail,
    isAlias,
    baseEmail,
    issues,
    suggestions,
  };
}
