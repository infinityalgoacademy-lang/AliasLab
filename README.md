# AliasLab

Free, privacy-first email tools that run **entirely in your browser**. No sign-up, no server, no tracking — everything is generated locally with the Web Crypto API.

> Take advantage of how Gmail ignores dots and supports `+` tags to generate thousands of aliases that all land in one inbox.

## Tools

| Tool | Description |
| --- | --- |
| **Gmail Alias Generator** | Generate up to **5,000** Gmail aliases at once using dots and `+` tags. Export as TXT/CSV, copy all, and toggle dot-noise per alias. |
| **Password Generator** | Strong random passwords with length, character-set and ambiguous-character controls, plus live strength & entropy meter. |
| **Username Generator** | Unique, memorable usernames — adjective+noun, noun+number, word+word, or random patterns with custom separators. |
| **Email Validator** | Validate any address and detect hidden Gmail aliases, recovering the real base inbox (`.`-stripping and `+` tag removal). |
| **QR Code Generator** | Turn any alias, address, text or link into a scannable, downloadable QR code. |

## Features

- **100% client-side** — nothing ever leaves your device
- **Up to 5,000 aliases** per batch
- **Dot & plus-tag strategies** — words, numbered, or random
- **Batch export** to TXT / CSV, one-click copy-all
- **RTL Arabic UI** (Cairo font) with light/dark mode
- **Web Crypto–backed** randomness (`crypto.getRandomValues`)
- Instant generation, no rate limits

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix primitives
- `qrcode` for QR rendering

## Getting Started

```bash
# 1. Install dependencies
npm install
# or
bun install

# 2. Start the dev server
npm run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout (fonts, theme)
│   ├── page.tsx          # Single-page app shell & tool switcher
│   └── globals.css       # Design tokens & global styles
├── components/
│   ├── site-header.tsx   # Sticky nav with tool tabs
│   ├── site-footer.tsx
│   ├── tools/            # One component per tool
│   │   ├── alias-generator.tsx
│   │   ├── password-generator.tsx
│   │   ├── username-generator.tsx
│   │   ├── email-validator.tsx
│   │   └── qr-generator.tsx
│   └── ui/               # shadcn/ui primitives
└── lib/
    └── tools.ts          # Core generation & validation logic
```

## How Gmail Aliases Work

Given `yourname@gmail.com`:

| Trick | Example | Result |
| --- | --- | --- |
| **Dots are ignored** | `y.our.name@gmail.com` | Delivers to `yourname@gmail.com` |
| **Plus tags** | `yourname+netflix@gmail.com` | Delivers to `yourname@gmail.com` |

Use a unique alias per service to **track who spams you** and to **kill a leak** by blocking one alias without touching your real inbox.

## Privacy

AliasLab has zero backend calls for generation. Passwords, usernames and aliases are produced locally using `crypto.getRandomValues()`, which is cryptographically secure. Your data stays on your device.

## License

MIT
