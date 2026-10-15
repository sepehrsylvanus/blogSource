# حاشیه — وبلاگ فارسی Next.js 16، Prisma و طراحی نئونی

این پروژه با راهنمای مستقل **`next16-blog-prisma-vscode-wsl-fa.html`** همراه است. راهنما ساخت را از یک پوشهٔ خالی و با `create-next-app` آغاز می‌کند و **متن کامل تمام فایل‌های لازم** و لینک ذخیرهٔ دو تصویر JPEG را در خود دارد. ساخت یا اجرای هیچ مرحله‌ای به داشتن سورس از پیش آماده وابسته نیست. این پوشه نسخهٔ اجراشوندهٔ همان پروژه و مرجع بازبینی کد است.

## مرز محیط‌ها و ترتیب واقعی

| فصل راهنما | محیط                                                            | نتیجه                                                                                                     |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ۳–۴        | VS Code → ترمینال داخلی **Git Bash ویندوز**                     | `create-next-app@16.4.0`، حذف صفحهٔ نمونهٔ اسکلت، نوشتن `package.json` و تولید `package-lock.json` با npm |
| ۵–۸        | همان Git Bash + PostgreSQL در **Docker Desktop**                | `.env.local`، migration اول با Prisma 7، seed و ساخت تعاملی یک کاربر مدیر در DB توسعه                     |
| ۹–۱۳       | همان محیط توسعه                                                 | منطق سرور، API، فونت و اجزای رابط؛ هنوز برای `/login` یا `/admin` صفحه‌ای وجود ندارد                      |
| ۱۴–۱۶      | همان محیط توسعه                                                 | نخستین اجرای `npm run dev` **پس از** ساخت صفحهٔ خانه؛ مطلب، آرشیو و درباره                                |
| ۱۷–۲۱      | همان محیط توسعه                                                 | صفحهٔ ورود، تمام صفحات مدیر، ویرایشگر، آپلود و پیش‌نمایش خصوصی؛ ورود موفق **بعد از فصل ۱۹**               |
| ۲۲–۲۴      | همان محیط توسعه                                                 | SEO/RSS، lint، typecheck، چهار تست، build و بازبینی امنیت                                                 |
| ۲۵–۳۳      | **Ubuntu WSL روی همان رایانهٔ Windows**، متصل به Docker Desktop | استقرار جداگانه، آزمون دستی، SSH/Tailscale، سپس GitHub Actions و نگهداری                                  |

**توسعه را در WSL انجام نده.** در ترمینال توسعه `node -p "process.platform"` باید `win32` برگرداند. Docker Desktop برای DB توسعه پورت `127.0.0.1:5433` را به Windows می‌دهد؛ DB تولید volume جدا دارد و پورت host ندارد. برنامهٔ مستقرشده روی Windows از `http://localhost:3100` دیده می‌شود، نه پورت توسعهٔ `:3000`.

> ساخت مدیر در فصل ۸ فقط رکورد PostgreSQL را ایجاد می‌کند. تا فصل ۱۷، `/login` هنوز فایل ندارد و 404 طبیعی است؛ تا پایان فصل ۱۹، ورود به داشبورد را آزمون نکن. برای رفع 404 نه مدیر را دوباره بساز، نه صفحهٔ موقت اضافه کن.

## صفحه‌ها و قابلیت‌ها

طراحی تیره/فیروزه‌ای/بنفش راست‌به‌چپ با فونت Vazirmatn خودمیزبان، دو تصویر محلی `public/neon-hero.jpg` و `public/neon-studio.jpg`، کاور تولیدی بدون درخواست شبکه، نمایش واکنش‌گرای موبایل و دسکتاپ، حالت خالی/خطا، فوکوس کیبورد و `prefers-reduced-motion` پیاده شده است. Tailwind CSS 4 و توکن‌های طراحی در `src/app/globals.css` هستند.

| صفحه                       | مسیر                                         | فایل                                                                               |
| -------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| خانه، جست‌وجو و مطالب شاخص | `/`، `/?q=...`                               | `src/app/(site)/page.tsx`                                                          |
| مطلب و نوار پیشرفت خواندن  | `/posts/[slug]`                              | `src/app/(site)/posts/[slug]/page.tsx`                                             |
| آرشیو دسته و برچسب         | `/categories/[slug]`، `/tags/[slug]`         | `src/app/(site)/categories/[slug]/page.tsx`، `src/app/(site)/tags/[slug]/page.tsx` |
| درباره                     | `/about`                                     | `src/app/(site)/about/page.tsx`                                                    |
| ورود نویسنده               | `/login`                                     | `src/app/(auth)/login/page.tsx`                                                    |
| داشبورد و فهرست مطالب      | `/admin`، `/admin/posts`                     | `src/app/admin/page.tsx`، `src/app/admin/posts/page.tsx`                           |
| نوشتن و ویرایش             | `/admin/posts/new`، `/admin/posts/[id]/edit` | `src/components/post-editor.tsx` و صفحه‌های متناظر                                 |
| پیش‌نمایش خصوصی            | `/admin/posts/[id]/preview`                  | `src/app/admin/posts/[id]/preview/page.tsx`                                        |
| دسته‌ها و برچسب‌های پنل    | `/admin/taxonomy`                            | `src/app/admin/taxonomy/page.tsx`                                                  |
| موتور جست‌وجو و خوراک      | `/robots.txt`، `/sitemap.xml`، `/rss.xml`    | فایل‌های `src/app/robots.ts`، `sitemap.ts` و `rss.xml/route.ts`                    |

مدل‌های Better Auth و محتوای وبلاگ در `prisma/schema.prisma` هستند؛ مسیرهای عمومی فقط مطالب منتشرشده و غیرآینده را برمی‌گردانند. نشست/نقش مدیر در layout و **داخل Server Actionها** بررسی می‌شود. فایل آپلودی فقط برای مدیر، با کنترل origin، محدودیت اندازه و بازکدگذاری WebP پذیرفته می‌شود؛ uploadها در Git نیستند.

## آزمون API با Postman

راهنمای HTML **درست زیر کد هر فایل API**، Method، URL، زمان اجرای درست، Header/Cookie، پاسخ مورد انتظار و JSON ساختگیِ قابل‌کپی را دارد: Auth در فصل ۷، آپلود/دریافت رسانه و health در فصل ۱۱، و RSS/Sitemap/Robots در فصل ۲۲. فایل‌های JSON آمادهٔ Import برای Postman Collection و Environment نیز داخل خود HTML قابل‌دریافت‌اند؛ رمز واقعی ادمین در آن‌ها نیست. آزمون‌های ناشناس را بعد از اولین `npm run dev` فصل ۱۴، و آزمون‌های دارای نشست را بعد از فصل ۱۹ اجرا کن. `base_url` برای توسعه باید دقیقاً `http://localhost:3000` باشد.

**سروراکشن‌ها APIِ JSON نیستند.** برای `savePost`، `archivePost` و `createTaxonomy` بدنهٔ ساختگی به Postman نفرست؛ آنها را از فرم‌های پنل آزمایش کن. `POST /api/media/upload` هم JSON نمی‌پذیرد: Body باید `form-data` با کلید `file` از نوع File باشد، `Origin` مطابق URL محلی باشد، و نشست مدیر در Cookie jar موجود باشد. GET فایل باینری WebP برمی‌گرداند؛ RSS و Sitemap خروجی XML و Robots متن دارند.

## دستورها؛ فقط در مرحلهٔ مناسب

بعد از نوشتن فایل‌های فصل‌های ۳ تا ۵ در **Git Bash ویندوز**، PostgreSQL توسعه را با `docker compose -f compose.dev.yml up -d --wait db` بالا بیاور. فصل ۶، `npm run db:migrate -- --name init` migration اول را **تولید و اجرا می‌کند** و `npm run db:generate` Prisma Client را می‌سازد. فصل ۸، `npm run db:seed` دسته/برچسب‌ها را اضافه می‌کند؛ ساخت مدیر با `npm run db:admin -- --email you@example.com --name Admin` انجام می‌شود و رمز را فقط در prompt تعاملی وارد می‌کنی. پیش از اجرای CLI ادمین، متغیرهای `.env.local` را طبق راهنما در همان shell بارگذاری کن.

بعد از ساخت `src/app/(site)/page.tsx` در فصل ۱۴، برای **اولین بار** `npm run dev` را اجرا کن. `prisma/demo.ts` و دستور `npm run db:demo -- you@example.com` اختیاری و فقط برای دادهٔ نمونهٔ توسعه هستند. بعد از تکمیل همهٔ صفحه‌ها و فایل‌ها در فصل ۲۳:

```bash
npm run db:generate
npx prisma validate
npm run lint
npm run typecheck
npm test
npm run build
```

تغییرهای schema را در محیط توسعه با migration جدید و بازتولید Client ثبت کن؛ SQL و lockfile را commit کن، `src/generated/prisma` را نه. در production فقط `prisma migrate deploy` اجرا می‌شود؛ نه `migrate dev` و نه reset. `.env.local`، `/srv/blog/secrets/prod.env`، کلیدهای خصوصی و آپلودها هرگز داخل Git نمی‌روند.

## استقرار و محدودیت آزمون

بعد از کیفیت‌سنجی محلی، فصل‌های ۲۵ تا ۳۰ فایل‌های Docker/Compose، Ubuntu WSL روی **همان Windows PC**، secrets، استقرار دستی، SSH و Tailscale را به همین ترتیب توضیح می‌دهند. دسترسی runner با grant محدود `tag:ci` → `tag:blog-wsl` روی TCP/22 و OAuth client دارای `auth_keys` تنظیم می‌شود. `scripts/deploy.sh` از DB نسخهٔ پشتیبان می‌گیرد، migration ثبت‌شده را اجرا می‌کند و سلامت برنامه را از داخل کانتینر می‌سنجد. **فایل GitHub Actions در فصل ۳۱ و پس از موفقیت استقرار دستی نوشته و commit می‌شود**: PR فقط CI دارد و push به `main` بعد از CI به WSL deploy می‌شود.

نمونهٔ کد و رابط با PostgreSQL 17 بومی در محیط آزمون، lint/typecheck، چهار تست، build و بازبینی مرورگر آزموده شده است. اتصال واقعی Docker Desktop ↔ Ubuntu WSL و GitHub Actions/SSH در این محیط قابل آزمایش نبود؛ مراحل آن را روی رایانهٔ خودت اجرا و تأیید کن. WSL/Windows شخصی اگر خاموش یا در حالت sleep باشد سرویس هم از دسترس خارج می‌شود؛ برای دسترس‌پذیری دائمی میزبان Linux همیشه‌روشن مناسب‌تر است.
