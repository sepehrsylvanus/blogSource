import type { PostDoc } from "@/lib/types";
import { readingTimeFa } from "@/lib/markdown";
import { ADMIN_ID, ADMIN_AUTHOR } from "./admin";

const day = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * day);

type RawPost = Omit<PostDoc, "_id" | "readingTime" | "publishedAt" | "authorId" | "author"> & {
  daysAgo: number;
};

const rawPosts: RawPost[] = [
  {
    slug: "next-16-whats-new",
    title: "Next.js 16؛ چه چیزهایی واقعاً عوض شده؟",
    excerpt:
      "Turbopack پیش‌فرض شد، Cache Components آمد و middleware به proxy تبدیل شد. این‌بار تغییرات فقط کامپایلر نیست؛ مدل ذهنی کش کردن عوض شده.",
    tags: ["nextjs", "react", "performance"],
    series: { title: "نکست مدرن", order: 1 },
    status: "published",
    featured: true,
    views: 4312,
    claps: 864,
    daysAgo: 3,
    content: `
وقتی نسخه‌ی ۱۶ نکست رسید، اولین فکرم این بود: «باز فقط چند تا فیچر تبلیغاتی؟» اما بعد از دو هفته مهاجرت دادن پروژه‌های کانال، می‌گویم این‌بار فرق می‌کند. بزرگ‌ترین تغییر، رفتار پیش‌فرض فریم‌ورک است نه یک API جدید.

## Turbopack حالا پیش‌فرض است

Webpack رسماً کنار رفته و Turbopack حالا هم برای dev و هم برای build پیش‌فرض است. عددها روی مک بوک من برای یک پروژه‌ی متوسط:

| مرحله | Next 15 (webpack) | Next 16 (Turbopack) |
|------|------------------|---------------------|
| استارت dev | ۱۱ ثانیه | ۲.۳ ثانیه |
| Fast Refresh | ۴۰۰ میلی‌ثانیه | ۳۰ میلی‌ثانیه |
| بیلد پروداکشن | ۹۲ ثانیه | ۴۱ ثانیه |

اگر پلاگین webpack خاصی داری، هنوز می‌توانی با فلگ مخصوص برگردی، ولی من پیشنهاد می‌کنم همین حالا مهاجرت کنی.

## Cache Components و نقطه‌ی چرخش مدل ذهنی

تغییر دوم مهم‌تر است: دایرکتیو **use cache**. تا قبل از این، کش کردن در نکست یک سری API پراکنده بود — fetch cache، revalidate، unstable_cache. حالا یک مدل واحد داریم:

~~~tsx
import { cacheLife } from "next/cache";

export async function PopularPosts() {
  "use cache";
  cacheLife("hours");
  return <PostsList data={await db.posts.findPopular()} />;
}
~~~

نکته‌ی ظریفش این است که کش در سطح **کامپوننت** تعریف می‌شود، نه route. یعنی می‌توانی صفحه‌ای داشته باشی که بخش‌هایش عمر کش متفاوتی دارند — دقیقاً همان چیزی که در [نوشته‌ی Server Components](/posts/server-components-mental-model) از مدل ذهنی‌اش حرف زدم.

## خداحافظ middleware، سلام proxy

فایل middleware.ts حالا proxy.ts نام دارد و منطقش هم شفاف‌تر شده. اسمش تصادفی نیست: دقیقاً همان کاری را می‌کند که یک proxy لبه‌ای باید بکند — نه درخواست را بازنویسی عمیق.

## چیزهای کوچک ولی خوش‌ایند

- **params و searchParams** حالا کاملاً Promise هستند؛ یادت باشد awaitشان کنی.
- بهبود dev tooling: لاگ‌های خواناتر و overlay خطای جدید.
- **React 19.2** با Activity component همراه است که برای uiهای «پنهان ولی زنده» عالی است.

## جمع‌بندی

اگر روی نسخه‌ی ۱۴ یا ۱۵ هستی، مهاجرت به ۱۶ یکی از آن ارتقاهایی است که واقعاً در تجربه‌ی روزانه‌ات حس می‌شود. من تمام ویدیوهای بعدی کانال را با همین نسخه ضبط می‌کنم. اگر دنبال پروژه‌ی تمرینی هستی، [چرا CRUD کافی نیست](/posts/beyond-crud) را بخوان — همین بلاگ یک نمونه‌ی عملی‌اش است.
`,
  },
  {
    slug: "search-without-elasticsearch",
    title: "جستجوی فارسی بدون الاستیک‌سرچ؛ ترکیب MongoDB و چند ترفند",
    excerpt:
      "برای ۹۰٪ پروژه‌ها الاستیک‌سرچ توپخانه برای کشتن پشه است. با ایندکس text، regex هوشمند و aggregation می‌شود جستجوی فارسی ردیف ساخت.",
    tags: ["mongodb", "search", "database"],
    series: null,
    status: "published",
    featured: true,
    views: 2987,
    claps: 512,
    daysAgo: 12,
    content: `
هر وقت کلمه‌ی «جستجو» وسط می‌آید، آدم‌ها یا می‌روند سراغ الاستیک‌سرچ یا تسلیم می‌شوند. اما واقعیت این است که برای یک بلاگ، داشبورد یا فروشگاه کوچک، همان MongoDB با چند ترفند از پسش برمی‌آید. همین بلاگ همین‌طور کار می‌کند — منوی ⌘K را باز کن و امتحانش کن.

## ایندکس متنی؛ نقطه‌ی شروع

MongoDB از نسخه‌های قدیم text index دارد. برای فارسی stemming ندارد، ولی چون کلمات فارسی با فاصله جدا می‌شوند، توکنایز کردن درست کار می‌کند:

~~~js
db.posts.createIndex(
  { title: "text", excerpt: "text", content: "text" },
  { weights: { title: 10, excerpt: 5, content: 1 } }
);
~~~

وزن‌ها مهم‌اند: کلمه‌ای که در عنوان باشد ده برابر ارزشمندتر از کلمه‌ای است که تهِ متن آمده.

## مشکل فارسی کجاست؟

دو مشکل اصلی داریم: **ی و ک عربی/فارسی** و **نیم‌فاصله**. کاربر «می‌خواهم» را با نیم‌فاصله می‌نویسد و متن تو با فاصله ذخیره شده. راه‌حل ارزان: قبل از هر کوئری، متن را نرمالایز کن:

~~~ts
function normalize(input: string): string {
  return input
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
~~~

## موتور چندمرحله‌ای

ترکیب مورد علاقه‌ام یک موتور سه‌مرحله‌ای است — دقیقاً همان چیزی که در ساخت [MongoDB برای فرانت‌اندی‌ها](/posts/mongodb-for-frontend) هم ازش حرف زدم:

1. اول $text با اسکور؛ اگر نتیجه داد، تمام.
2. اگر نه، regex روی عنوان و تگ‌ها (برای نوشتار ناقص و تایپو).
3. در نهایت fuzzy ساده با حذف حروف صدادار فارسی برای تایپوهای رایج.

~~~ts
const results = await db.collection("posts").aggregate([
  { $match: { $text: { $search: query } } },
  { $addFields: { score: { $meta: "textScore" } } },
  { $sort: { score: -1 } },
  { $project: { title: 1, slug: 1, score: 1 } },
  { $limit: 8 },
]).toArray();
~~~

## Auto-suggest ارزان

برای پیشنهاد زنده، اصلاً کوئری نزن؛ یک کشه‌ی حافظه‌ای از عنوان‌ها بساز و با همان normalize کار کن. استارت‌آپ‌ها برای چنین چیزی سرویس جدا می‌خرند!

## چه زمانی واقعاً الاستیک‌سرچ لازم است؟

وقتی حجم داده از میلیون‌ها سند گذشت، به faceting سنگین نیاز داری یا می‌خواهی typo tolerance در سطح Lucene داشته باشی. تا آن روز، [CRUD کلیشه‌ای](/posts/beyond-crud) نساز ولی توپخانه هم نیاور.
`,
  },
  {
    slug: "beyond-crud",
    title: "چرا پروژه‌های CRUD دیگر کافی نیستند؟",
    excerpt:
      "Create، Read، Update، Delete — بعد از پنجمین فروشگاه تمرینی، دیگر هیچ‌کس ذوق نمی‌کند. چطور پروژه‌ای بسازیم که هم خودمان رشد کنیم هم رزومه‌مان نفس بکشد.",
    tags: ["career", "architecture", "learning"],
    series: null,
    status: "published",
    featured: true,
    views: 5210,
    claps: 1204,
    daysAgo: 21,
    content: `
سؤال پرتکرار کامنت‌های کانال این است: «چند تا پروژه بزنم تا استخدام شوم؟» سؤال اشتباهی است. سؤال درست این است: «این پروژه چه چیزی را در من ثابت می‌کند؟» و پاسخ اکثر پروژه‌های تمرینی، متأسفانه، هیچ.

## بیماری Todo-App

همه‌ی ما شبیه‌ساز این چرخه بوده‌ایم: فروشگاه، تودولیست، بلاگ با ادمین‌پنل. مشکل این است که این پروژه‌ها تصمیم‌های جذاب نمی‌خواهند. هیچ‌وقت مجبور نمی‌شوی فکر کنی:

- اگر هزار نفر همزمان این دکمه را بزنند چه؟
- این داده چطور به داده‌ی دیگر وصل می‌شود و **گراف** روابطش چه شکلی است؟
- کاربری که اینترنتش کند است، چه می‌بیند؟
- چطور بفهمم کجای سیستم کند است؟

## چهار بُعد یک پروژه‌ی «زنده»

به جای CRUD بعدی، پروژه‌ای بساز که لااقل یکی از این چهار بُعد را داشته باشد:

### ۱. بعد زمانی
داده در پروژه‌ی واقعی پیر می‌شود. آرشیو، چینش زمانی، هیت‌مپ فعالیت — مثل همان بخش «ریتم نوشتن» در صفحه‌ی اول همین بلاگ.

### ۲. بعد شبکه‌ای
موجودیت‌ها به هم لینک می‌شوند. [گراف دانش](/graph) این بلاگ دقیقاً برای همین ساخته شده: نوشته‌ها و تگ‌ها رئوسی از یک گراف‌اند و می‌توانی ببینی کدام موضوع‌ها به هم گره خورده‌اند.

### ۳. بعد لحظه‌ای
ریل‌تایم بودن: بازدید زنده، رأی، حضور کاربران. حتی یک شمارنده‌ی بازدید ساده، مدل همزمانی را به مغزت تزریق می‌کند.

### ۴. بعد تصمیم مهندسی
جایی که باید بین دو راه‌حل خوب انتخاب کنی و انتخابت را مستند کنی. مثل تصمیم [جستجو بدون الاستیک‌سرچ](/posts/search-without-elasticsearch) — یک trade-off واقعی با دلیل.

## این بلاگ چطور ساخته شد؟

همین وبلاگی که می‌خوانی عمداً «ضد CRUD» طراحی شد: پنل ادمین ندارد، ولی گراف دانش دارد. فرم ویرایش ندارد، ولی [رادار تکنولوژی](/stack) دارد که از روی همه‌ی پروژه‌هایم تجمیع می‌شود. صفحه‌بندی کلاسیک ندارد، ولی جستجوی ⌘K دارد.

## تمرین این‌هفته‌ی تو

یکی از پروژه‌هایت را انتخاب کن و یکی از چهار بُعد را بهش اضافه کن. لازم نیست بازنویسی‌اش کنی؛ یک هیت‌مپ فعالیت، یک صفحه‌ی گراف یا حتی یک فید RSS. بعد بیا کامنت بگذار که چه چیزی یادت داد.
`,
  },
  {
    slug: "motion-design-react",
    title: "موشن‌دیزاین در ری‌اکت؛ از transition تا فیزیک",
    excerpt:
      "انیمیشن خوب نمک رابط کاربری است: نه آن‌قدر زیاد که حواس‌پرت کند، نه آن‌قدر کم که مُرده به نظر برسد. راهنمای عملی با Motion برای ری‌اکت.",
    tags: ["react", "motion", "design"],
    series: null,
    status: "published",
    featured: false,
    views: 1876,
    claps: 342,
    daysAgo: 35,
    content: `
فرق یک رابط «درست» با یک رابط «لذت‌بخش» اغلب در چیزی نیست که می‌بینی — در چیزی است که **حس** می‌کنی. حرکت، وزن آبجکت‌ها به رابط می‌دهد. این نوشته خلاصه‌ی تجربه‌ی من از دو سال ویدیو ساختن درباره‌ی انیمیشن است.

## قانون اول: انیمیشن باید معنا داشته باشد

هر حرکت باید یکی از این کارها را بکند: رابطه‌ی مکانی را توضیح دهد (این کارت از کجا آمد؟)، توجه را هدایت کند، یا حسابیت بدهد. اگر هیچ‌کدام را نمی‌کند، حذفش کن.

## سه سطح پیاده‌سازی

### سطح ۱: CSS transitions
برای hover و تغییر وضعیت‌های ساده. ارزان و قابل پیش‌بینی. نکته: فقط transform و opacity را انیمیت کن — بقیه layout را درگیر می‌کند.

### سطح ۲: Motion برای state پیچیده
وقتی انیمیشن به lifecycle کامپوننت گره می‌خورد (ورود/خروج از DOM)، CSS دیگر کم می‌آورد:

~~~tsx
import { motion, AnimatePresence } from "motion/react";

<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      محتوا
    </motion.div>
  )}
</AnimatePresence>
~~~

### سطح ۳: فیزیک و ژست
draggable، scroll-linked و حرکت با فنر. همین دکمه‌ی «تشویق» پایین این صفحه یک مثال کوچک است — هر کلیک یک انفجار ذره‌ای با spring جداگانه.

## تله‌های رایج

- **Duration بالای ۳۰۰ میلی‌ثانیه** برای میکروتعامل‌ها؛ کاربر حس می‌کند سایت «تنبل» است.
- انیمیت کردن height با مقدار auto — به جایش از grid-template-rows یا transform استفاده کن.
- فراموش کردن prefers-reduced-motion. همیشه:

~~~css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
~~~

## انیمیشن == عملکرد

اگر فریم می‌افتد، انیمیشت «بد» است هرچقدر هم قشنگ. DevTools را باز کن، Rendering را بزن و paint flashing را نگاه کن. این حرف را در ویدیوی [تیلویند ۴](/posts/tailwind-v4-deep-dive) هم زدم: سریع‌ترین استایل، استایلی است که اعمال نشود.
`,
  },
  {
    slug: "mongodb-for-frontend",
    title: "MongoDB برای آدم‌هایی که از SQL می‌ترسند",
    excerpt:
      "Document، Aggregation Pipeline و Index؛ فقط همین سه تا. اگر JSON بلد باشی — که بلدی — نصف راه را رفته‌ای. نقشه‌ی یادگیری بدون حاشیه.",
    tags: ["mongodb", "database", "nodejs"],
    series: null,
    status: "published",
    featured: false,
    views: 3422,
    claps: 601,
    daysAgo: 55,
    content: `
خیلی از فرانت‌اندی‌هایی که می‌شناسم با دیتابیس رابطه احساسی‌اند: همان‌طور که بعضی‌ها از ارتفاع می‌ترسند، آن‌ها از JOIN می‌ترسند. MongoDB برای این آدم‌ها از JSON شروع می‌شود — و JSON زبان مادری ماست.

## سند به جای جدول

به جای ردیف و ستون، سند داری — همان آبجکتی که از سرورت پس می‌گیری:

~~~js
{
  slug: "mongodb-for-frontend",
  title: "MongoDB برای ...",
  tags: ["mongodb", "database"],
  stats: { views: 3422, claps: 601 }
}
~~~

تصمیم اول مهندسی این است: چه چیزی **embed** شود و چه چیزی **reference**؟ قانون سرانگشتی: چیزی را embed کن که تقریباً همیشه همراه صاحبش خوانده و نوشته می‌شود. آمار پست؟ embed. خود پست‌ها در کالکشن تگ‌ها؟ هرگز — reference.

## Aggregation Pipeline؛ قلب تپنده‌ی مونگو

به جای ده کوئری و جوین کردن‌های دستی در جاوااسکریپت، یک خط لوله بنویس. مثال واقعی از همین بلاگ — محاسبه‌ی تعداد نوشته برای هر تگ:

~~~js
db.posts.aggregate([
  { $match: { status: "published" } },
  { $unwind: "$tags" },
  { $group: { _id: "$tags", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
~~~

خروجی‌اش مستقیم به کامپوننت ری‌اکت می‌رود. اگر عمیق‌تر شوی، [جستجوی فارسی](/posts/search-without-elasticsearch) را ببین که یک pipeline چندمرحله‌ای واقعی است.

## ایندکس؛ جایی که بلاگ‌ها می‌میرند

بیشترین استعاره‌ی درست درباره‌ی ایندکس: شماره‌ی صفحه در کتاب. بدون ایندکس، مونگو برای پیدا کردن یک سند، همه‌ی کالکشن را ورق می‌زند:

~~~js
db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ status: 1, publishedAt: -1 });
~~~

قانون ESR را یادت باشد: **Equality، بعد Sort، بعد Range** — ترتیب فیلدها در ایندکس ترکیبی به همین ترتیب باشد.

## تراکنش‌ها

از نسخه‌ی ۴ به بعد تراکنش چندسندی داریم، ولی در ۹۵٪ مدل‌سازی درست به آن نیازی نداری. اگر هر هفته به تراکنش نیاز پیدا می‌کنی، معمولاً یعنی مدل‌سازی‌ات رابطه‌ای است — شاید باید PostgreSQL بگیری. این نوع صداقت مهندسی را در [چرا CRUD کافی نیست](/posts/beyond-crud) بیشتر باز کرده‌ام.

## مسیر تمرین

یک کالکشن posts بساز، داده‌ی فیک بریز، و یک صفحه‌ی «آرشیو بر اساس ماه» فقط با aggregation بساز. همین یک تمرین، بیشتر از سه تودولیست بهت یاد می‌دهد.
`,
  },
  {
    slug: "typescript-advanced-patterns",
    title: "تایپ‌اسکریپت پیشرفته؛ الگوهایی که کمتر درباره‌شان حرف می‌زنند",
    excerpt:
      "Discriminated unions، Template literal types و satisfies؛ سه الگویی که وقتی بلدشان شوی، دیگر نمی‌توانی ندیده‌شان بگیری.",
    tags: ["typescript", "javascript"],
    series: null,
    status: "published",
    featured: false,
    views: 2144,
    claps: 389,
    daysAgo: 83,
    content: `
مرزی بین «تایپ‌اسکریپت کار می‌کند» و «تایپ‌اسکریپت برایم کار می‌کند» در چند الگوی مشخص می‌گذرد. این‌ها همان الگوهایی هستند که وقتی در کد ریویو می‌بینم‌شان، می‌فهمم طرف حرفه‌ای است.

## ۱. Discriminated Union به جای boolean

وضعیت درخواست را با دو بولین isLoading و hasError مدل نکن — چون حالت غیرممکن هم تولید می‌کند (هم لودینگ هم ارور؟). به جایش:

~~~ts
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

function render(state: RequestState<Post[]>) {
  switch (state.status) {
    case "ok":
      return <List posts={state.data} />; // تایپ دقیق
    case "error":
      return <ErrorBox message={state.message} />;
    // ...
  }
}
~~~

کامپایلر چک می‌کند هیچ حالتی جا نمانده باشد — به این می‌گویند exhaustiveness checking.

## ۲. satisfies؛ بهترین هر دو جهان

~~~ts
const routes = {
  home: "/",
  posts: "/posts",
  graph: "/graph",
} satisfies Record<string, Route>;
~~~

با satisfies هم اعتبارِ آبجکت چک می‌شود، هم تایپ literal اش preserved می‌ماند. وقتی بعداً href{routes.graph} را می‌نویسی، autocomplete دقیق می‌شود.

## ۳. Template Literal Types

برای چیزهایی که «الگوی رشته‌ای» دارند:

~~~ts
type HexColor = \`#\${string}\`; // رشته‌هایی که با # شروع می‌شوند
type EventName = \`on\${Capitalize<string>}\`;
type Route = "/" | \`/posts/\${string}\`;
~~~

دقت کن در نسخه‌ی واقعی باید بک‌تیک معمولی بنویسی. کاربرد عملی: تایپ کردن کلیدهای ترجمه، روت‌ها و ایونت‌ها.

## ۴. Brand Types؛ وقتی string کافی نیست

همه‌ی رشته‌ها یکی نیستند: UserId با PostId فرق دارد:

~~~ts
declare const brand: unique symbol;
type UserId = string & { readonly [brand]: "UserId" };
type PostId = string & { readonly [brand]: "PostId" };
~~~

حالا دیگر نمی‌توانی اشتباهی آی‌دی پست را به جای آی‌دی کاربر پاس بدهی. صفر هزینه‌ی ران‌تایم، صد درصد خیال راحت.

## جمع‌بندی

این الگوها قرار نیست کد را پیچیده کنند؛ قرار است **باگ‌ها را از ران‌تایم به کامپایل‌تایم کوچ بدهند**. اگر ری‌اکت می‌زنی، ترکیب این الگوها با [Server Components](/posts/server-components-mental-model) تجربه‌ی توسعه را کلاً عوض می‌کند.
`,
  },
  {
    slug: "server-components-mental-model",
    title: "مدل ذهنی درست از Server Components",
    excerpt:
      "RSC یک فیچر نیست، یک مرز است. وقتی بفهمی مرز سرور و کلاینت کجاست، نیمی از باگ‌های عجیب نکست‌جی‌اس خودسرانه از بین می‌روند.",
    tags: ["react", "nextjs", "architecture"],
    series: { title: "نکست مدرن", order: 2 },
    status: "published",
    featured: false,
    views: 3855,
    claps: 702,
    daysAgo: 120,
    content: `
بیشتر بلاگ‌ها Server Components را با «چطور استفاده‌اش کنیم» شروع می‌کنند. من با «چرا اصلاً وجود دارد» شروع می‌کنم — چون مدل ذهنی را که بسازی، API را خودت حدس می‌زنی.

## مشکل قدیمی

ری‌اکت کلاسیک: همه‌ی کامپوننت‌ها به مرورگر می‌روند. نتیجه: باندل‌ سنگین، واترفال fetch و state مدیریتی برای داده‌ای که اساساً فقط می‌خواستی **نمایشش** بدهی.

## مرز جدید: Server / Client

دو نوع کامپوننت داریم و یک مرز سریالایزشده بینشان:

- **Server**: به دیتابیس، فایل و secret دسترسی دارد. خروجی‌اش HTML پلاس payload سریال شده است. هیچ state و eventای ندارد.
- **Client**: تعامل، useState، useEffect، مرورگر API. باید با "use client" علامت بخورد.

قانون طلایی: هر چه **use client پایین‌تر** در درخت، باندل کوچک‌تر. نگذار این دایرکتیو به بالای درخت نشت کند.

~~~tsx
// app/posts/[slug]/page.tsx — server by default
export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug); // مستقیم به MongoDB
  return (
    <article>
      <Markdown content={post.content} />
      <ClapButton slug={slug} initial={post.claps} /> {/* جزیره‌ی تعاملی */}
    </article>
  );
}
~~~

به چیز قشنگش نگاه کن: Markdown سنگین (پارسر + هایلایتر) **اصلاً به مرورگر نمی‌رود**. فقط دکمه‌ی کوچک تشویق، جاوااسکریپت کلاینت دارد. به این می‌گویند جزایر تعاملی یا islands.

## چه چیزی از مرز عبور می‌کند؟

فقط داده‌ی سریالایزشدنی: string، number، آبجکت ساده، Date. کلاس، تابع و Map نه. اگر خطای عجیب «could not be serialized» گرفتی، یعنی چیزی را از مرز رد می‌کنی که نباید.

## الگوهایی که توصیه می‌کنم

1. **Data down, events up**: داده از سرور پایین می‌آید، رویداد از کلاینت بالا می‌رود (Server Action).
2. جزیره‌های کوچک: به جای کل صفحه‌ی کلاینتی، فقط بخش‌های تعاملی را client کن.
3. کش را در لایه‌ی سرور نگه دار — مدل جدیدش را در [Next.js 16](/posts/next-16-whats-new) توضیح دادم.

## تمرین

یک صفحه از پروژه‌ات را انتخاب و برایش درخت Server/Client بکش. روی کاغذ. بعد ببین چندتا از use clientهایش واقعاً لازم‌اند. معمولاً نیمی‌شان اضافی‌اند.
`,
  },
  {
    slug: "tailwind-v4-deep-dive",
    title: "Tailwind CSS 4؛ وقتی کانفیگ می‌شود CSS",
    excerpt:
      "خداحافظ tailwind.config.js؛ حالا همه‌چیز با @theme داخل CSS تعریف می‌شود. سریع‌تر، ساده‌تر و عمیق‌تر یکپارچه با پلتفرم وب.",
    tags: ["css", "tailwind", "design"],
    series: null,
    status: "published",
    featured: false,
    views: 2566,
    claps: 431,
    daysAgo: 170,
    content: `
تیلویند ۴ فقط یک آپدیت نسخه نیست؛ بازطراحی موتور است. موتور جدید (Oxide) با Rust نوشته شده و فلسفه‌اش برگشته به جایی که همیشه باید می‌بود: **خود CSS**.

## CSS-first Configuration

فایل tailwind.config.js دیگر اجباری نیست. توکن‌های دیزاین‌ حالا مستقیم در CSS زندگی می‌کنند:

~~~css
@import "tailwindcss";

@theme {
  --color-ink: #0a0a0d;
  --color-paper: #ededf0;
  --color-ember: #ff5a36;
  --font-sans: "Vazirmatn", sans-serif;
}
~~~

همین چهار خط، کلاس‌های bg-ink و text-ember و font-sans را می‌سازد. نکته‌ی زیبایش: این متغیرها در ران‌تایم هم در مرورگر وجود دارند، پس می‌توانی در Canvas یا WebGL هم از همان پالت استفاده کنی.

## سرعت؛ عددها حرف می‌زنند

| عملیات | v3 | v4 |
|--------|-----|-----|
| بیلد کامل | ۵۰۰ms | ۱۰۰ms |
| بیلد افزایشی | ۳۰۰ms | <۱۰ms |

## چیزهای کوچک، لذت‌های بزرگ

- **@source** برای اسکن دقیق فایل‌ها بدون content array.
- ساپورت نیتیو container queries و starting-style.
- dynamic spacing scale: هر عددی با هر واحدی کار می‌کند، چون از یک متغیر پایه ضرب می‌شود.
- **Variants ترکیبی** حالا منطقی‌تر زنجیره می‌شوند: group-has-data-[state=open]:block

## تله‌هایی که نباید بخوری

1. اگر در @theme توکنی تعریف می‌کنی، نام‌گذاری‌اش باید دقیقاً از الگوی --color-* یا --font-* پیروی کند تا کلاس ساخته شود.
2. dark mode دیگر کلاس‌محور نیست مگر اینکه variant سفارشی بنویسی؛ به‌صورت پیش‌فرض از prefers-color-scheme استفاده کن.
3. میکس کردن config قدیمی و جدید ممکن است ولی بهتر است یک‌راست مهاجرت کنی.

## RTL بدون دردسر

به جای ml-4 و mr-4 از **ms-4 / me-4** (logical properties) استفاده کن — همین بلاگ تماماً با logical properties نوشته شده و به همین خاطر چیدمانش به‌صورت خودکار فارسی می‌شود. برای انیمیت کردن هم حتماً [موشن‌دیزاین در ری‌اکت](/posts/motion-design-react) را بخوان.
`,
  },
];

export const seedPosts: Omit<PostDoc, "_id">[] = rawPosts.map(({ daysAgo, ...post }) => ({
  ...post,
  publishedAt: ago(daysAgo),
  readingTime: readingTimeFa(post.content),
  authorId: ADMIN_ID,
  author: { ...ADMIN_AUTHOR },
}));
