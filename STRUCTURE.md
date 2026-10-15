# ساختار پروژه — Editorial Blog

## تکنولوژی‌ها

| لایه | انتخاب |
|------|--------|
| فریم‌ورک | Next.js ۱۶ (App Router, Turbopack, `output: standalone`) |
| زبان | TypeScript (ESM — `"type": "module"`) |
| دیتابیس | PostgreSQL ۱۷ (Docker در dev) |
| ORM | Prisma ۷ (با driver adapter `@prisma/adapter-pg`) |
| Auth | Better Auth (plugin `admin`) |
| استایل | Tailwind CSS ۴ |
| اعتبارسنجی | Zod ۴ |
| تست | Vitest |

## درخت فایل‌ها

```
blog/
├── compose.dev.yml          # Postgres برای dev (پورت 5433)
├── next.config.ts           # standalone + Tailwind Turbopack loader
├── package.json             # اسکریپت‌ها (بخش Scripts در پایین)
├── prisma.config.ts         # کانفیگ CLI پرما: مسیر schema، seed، datasource
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma        # مدل‌ها: User, Session, Account, Verification,
│   │                        #   Category, Tag, Post, PostTag + enum PostStatus
│   ├── migrations/          # migration ها (Prisma Migrate)
│   └── seed.ts              # upsert دسته‌های نمونه و برچسب‌ها
│
├── src/
│   ├── app/                 # App Router
│   │   ├── layout.tsx       # روت‌لیاوت
│   │   ├── page.tsx         # صفحهٔ اصلی
│   │   ├── globals.css      # استایل پایه (Tailwind)
│   │   └── api/
│   │       └── [...all]/route.ts   # هندلرهای Better Auth (GET/POST)
│   │
│   ├── lib/
│   │   ├── prisma.ts        # singleton PrismaClient + PrismaPg adapter
│   │   ├── auth.ts          # کانفیگ betterAuth (emailAndPassword + admin)
│   │   ├── queries.ts       # کوئری‌های فقط-خواندنیِ محتوا (server-only)
│   │   ├── security.ts      # requireAdmin() برای محافظت مسیرها
│   │   └── validation.ts    # اسکیمای Zod + safePage + escapeXml
│   │
│   └── generated/
│       └── prisma/          # خروجی `prisma generate` — دست نزن (gitignored)
│
├── tests/
│   └── validation.ts        # تست‌های Vitest
│
├── .env                     # DATABASE_URL, BETTER_AUTH_SECRET, ...
└── AGENTS.md                # راهنمای خودکار برای ابزارهای AI
```

## توضیح فایل‌های کلیدی

- **`src/lib/prisma.ts`** — کلاینت Prisma رو یکتا نگه می‌دارد (برای جلوگیری از اتصال‌های اضافه در dev) و در صورت نبودِ `DATABASE_URL` خطا می‌دهد.
- **`src/lib/queries.ts`** — فقط برای read. فیلتر `visiblePost()` را همه‌جا استفاده کن تا پیش‌نویس/بایگانی/آینده عمومی نشوند.
- **`src/lib/security.ts`** — `requireAdmin()` برای layout (تجربهٔ کاربری)؛ برای mutation حتماً دوباره صدا بزن.
- **`prisma/schema.prisma`** — خروجی `db:auth-gen` را اینجا ادغام کن؛ فایل `.prisma` کنارش نگذار (تداخل افزونه).
- **`prisma/seed.ts`** — dotenv را از `.env` لود می‌کند؛ بعد از migrate اجرا شود.

## اسکریپت‌ها (package.json)

| دستور | کار |
|-------|-----|
| `npm run dev` | سرور توسعه |
| `npm run build` | `prisma generate` سپس `next build` |
| `npm run start` | اجرای production |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run db:generate` | تولید کلاینت Prisma |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:auth-gen` | تولید مدل‌های auth از Better Auth |
| `npm run db:admin` | ساخت ادمین |
| `npm run db:seed` | اجرای `prisma/seed.ts` |
| `npm run db:deploy` | `prisma migrate deploy` |

## مدل‌های دیتابیس

- **User / Session / Account / Verification** — جدول‌های Better Auth (`@@map` با نام‌های کوچک: `user`, `session`, ...)
- **Category** — `categories`
- **Tag** — `tags`
- **Post** — `posts` (وضعیت: `draft` | `published` | `archived`)
- **PostTag** — `post_tags` (ارتباط M2M بین Post و Tag)

## متغیرهای محیطی (.env)

| کلید | توضیح |
|------|-------|
| `DATABASE_URL` | رشتهٔ اتصال Postgres (dev روی پورت `5433`) |
| `BETTER_AUTH_SECRET` | راز امضای Better Auth |
| `BETTER_AUTH_URL` | آدرس پایهٔ auth |
| `SITE_URL` | آدرس سایت |
| `UPLOAD_DIR` | پوشهٔ آپلود فایل |
