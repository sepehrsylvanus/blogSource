import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  BookOpenText,
  Feather,
  Layers3,
  Lightbulb,
  Quote,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "دربارهٔ حاشیه",
  description: "چرا حاشیه را برای ایده‌ها، ساختن و یادگرفتن ساخته‌ایم؟",
};

const values = [
  {
    icon: Feather,
    number: "01",
    title: "نوشتن با حوصله",
    text: "برای سؤال‌های مهم عجله نمی‌کنیم. ایده‌ها را روشن، دقیق و به زبان آدم‌ها می‌نویسیم.",
    glow: "#68e5de",
  },
  {
    icon: Layers3,
    number: "02",
    title: "ساختن در عمل",
    text: "از پشتِ صحنهٔ ساخت محصول، طراحی و توسعه می‌گوییم؛ نه فقط از نتیجهٔ نهایی.",
    glow: "#b495ff",
  },
  {
    icon: Lightbulb,
    number: "03",
    title: "کنجکاوی همیشگی",
    text: "هر تجربه فرصت یادگرفتن است. موضوع‌های تازه را با چشم باز دنبال می‌کنیم.",
    glow: "#74c6ff",
  },
];

export default function About() {
  return (
    <main className="mx-auto max-w-7xl px-5 pb-8 pt-9 sm:px-8 lg:px-10">
      <nav
        aria-label="مسیر صفحه"
        className="mb-8 flex items-center gap-2 text-xs font-semibold text-muted"
      >
        <Link href="/" className="hover:text-forest">
          خانه
        </Link>
        <span>/</span>
        <span className="text-forest">دربارهٔ ما</span>
      </nav>
      <section className="grid-field relative grid items-center gap-10 overflow-hidden rounded-[2.2rem] border border-[#425777] bg-[#121c30] p-7 sm:p-10 lg:grid-cols-[1fr_.9fr] lg:gap-12 lg:p-14">
        <div
          aria-hidden
          className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#6950c0]/25 blur-[95px]"
        />
        <div className="relative z-10 py-5">
          <span className="eyebrow">BEHIND THE SIGNAL / داستان ما</span>
          <h1 className="mt-7 max-w-[700px] text-[clamp(2.9rem,5.2vw,5.6rem)] font-black leading-[1.48] tracking-[-.06em] text-ink">
            هر آینده‌ای از <span className="gradient-type">یک پرسش</span> شروع
            می‌شود<span className="text-forest">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[2.15] text-muted">
            حاشیه یک مجلهٔ مستقل برای ثبت ایده‌ها و تجربه‌هایی‌ست که از دلِ
            ساختن می‌آیند؛ جایی برای دیدنِ دنیا از زاویه‌ای کمی متفاوت.
          </p>
          <Link href="/#latest" className="button-dark mt-9">
            کشف یادداشت‌ها <ArrowLeft size={17} />
          </Link>
          <div
            className="mt-11 flex items-center gap-2 border-t border-line pt-6 text-[11px] font-bold tracking-[.16em] text-rust"
            dir="ltr"
          >
            <Sparkles size={15} /> THINK. BUILD. WRITE.
          </div>
        </div>
        <div className="relative min-h-[350px] lg:h-[560px]">
          <div className="absolute inset-0 overflow-hidden rounded-[1.6rem] border border-[#7085a5]/50 bg-[#171f32]">
            <Image
              src="/neon-studio.jpg"
              alt="منشور شیشه‌ای آبی در استودیوی تاریک با نورهای بنفش و آبی"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-[42%_55%]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#09101f]/80 via-transparent to-transparent"
            />
          </div>
          <div className="glass-panel absolute -bottom-5 right-5 max-w-[245px] rounded-2xl px-6 py-5 text-ink shadow-xl sm:-right-5">
            <Quote size={20} className="text-forest" />
            <p className="mt-2 text-sm font-bold leading-7">
              از کنارِ یک ایدهٔ خوب بی‌تفاوت رد نشو.
            </p>
          </div>
        </div>
      </section>
      <section className="mt-28 grid gap-10 border-y border-line py-17 lg:grid-cols-[.75fr_1fr] lg:gap-28">
        <div>
          <span className="eyebrow">OUR STORY / روایت ما</span>
          <h2 className="mt-5 text-[clamp(2rem,3.5vw,3.2rem)] font-black leading-[1.6] text-ink">
            فضایی برای فکرهایی که قرار نیست{" "}
            <span className="text-forest">گم شوند.</span>
          </h2>
        </div>
        <div className="space-y-5 text-[15px] leading-[2.35] text-muted">
          <p>
            بعضی وقت‌ها بهترین جمله درست وقتی به ذهن می‌رسد که دنبال آن نیستیم.
            حاشیه برای نگه داشتن همین لحظه‌ها ساخته شده: یادداشت‌های فنی،
            نگاه‌های تازه به طراحی و تجربه‌هایی که ارزش بازگفتن دارند.
          </p>
          <p>
            اینجا قرار نیست پاسخ همه‌چیز را بدانیم. بیشتر دوست داریم پرسش‌های
            بهتری بپرسیم، چیزهایی را که یاد گرفته‌ایم مستند کنیم و مسیر ساختن را
            شفاف‌تر نشان بدهیم.
          </p>
          <p>
            این سایت یک نمونهٔ واقعی از ترکیب Next.js، Tailwind، Prisma و
            PostgreSQL هم هست؛ می‌توانی آن را نقطهٔ شروع مجلهٔ خودت بدانی.
          </p>
        </div>
      </section>
      <section className="py-20">
        <div className="mb-9 flex items-center gap-4">
          <span className="eyebrow">آنچه به آن باور داریم</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, number, title, text, glow }) => (
            <article
              key={number}
              className="panel card-lift relative overflow-hidden p-7 sm:p-8"
            >
              <span
                aria-hidden
                className="absolute -left-12 -top-16 h-44 w-44 rounded-full opacity-20 blur-[50px]"
                style={{ background: glow }}
              />
              <div className="relative flex items-start justify-between">
                <span className="grid h-13 w-13 place-items-center rounded-2xl border border-forest/30 bg-forest/10 text-forest">
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <span
                  className="text-xs font-bold tracking-widest text-rust"
                  dir="ltr"
                >
                  /{number}
                </span>
              </div>
              <h3 className="relative mt-11 text-xl font-black text-ink">
                {title}
              </h3>
              <p className="relative mt-3 text-sm leading-8 text-muted">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="aurora grid-field relative overflow-hidden rounded-[2rem] border border-[#57698b] p-9 sm:p-14">
        <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black text-forest">
              <BookOpenText size={18} /> قدم بعدی
            </div>
            <h2 className="mt-4 text-[clamp(1.7rem,3vw,2.7rem)] font-black text-ink">
              برای خواندن، <span className="gradient-type">از هر جا</span> شروع
              کن.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              یک موضوع انتخاب کن؛ شاید یادداشتی منتظر تو باشد.
            </p>
          </div>
          <Link href="/#explore" className="button-dark shrink-0">
            مرور موضوع‌ها <ArrowUpLeft size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
