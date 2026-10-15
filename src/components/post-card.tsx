import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, CalendarDays, MoveUpLeft } from "lucide-react";
import { CoverArt } from "@/components/cover-art";

export type PublicPostCard = {
  slug: string;
  title: string;
  excerpt: string;
  coverPath: string | null;
  publishedAt: Date | null;
  categoryName: string | null;
  categorySlug: string | null;
};

function Artwork({
  post,
  sizes,
  className,
}: {
  post: PublicPostCard;
  sizes: string;
  className: string;
}) {
  return post.coverPath ? (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={post.coverPath}
        alt=""
        fill
        sizes={sizes}
        className="object-cover transition duration-700 group-hover:scale-110"
      />
    </div>
  ) : (
    <CoverArt slug={post.slug} className={className} />
  );
}

export function PostCard({
  post,
  index = 0,
}: {
  post: PublicPostCard;
  index?: number;
}) {
  return (
    <article className="group card-lift flex h-full flex-col overflow-hidden rounded-[1.55rem] border border-line bg-[#111b2b]">
      <Link
        href={`/posts/${post.slug}`}
        className="relative block overflow-hidden"
        aria-label={`خواندن ${post.title}`}
      >
        <Artwork
          post={post}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[1.55] w-full"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111b2b] to-transparent"
        />
        <span className="absolute top-4 right-4 rounded-full border border-white/30 bg-[#0b1628]/65 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-xl">
          {post.categoryName ?? "یادداشت"}
        </span>
        <span className="absolute bottom-5 left-5 grid h-10 w-10 place-items-center rounded-full border border-[#a4faed]/40 bg-[#1c4252]/70 text-forest backdrop-blur-lg transition group-hover:rotate-45">
          <MoveUpLeft size={17} />
        </span>
      </Link>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-2 sm:px-7">
        <p
          className="mb-3 text-[10px] font-bold tracking-[.18em] text-rust"
          dir="ltr"
        >
          NO. {String(index + 1).padStart(2, "0")} / THE JOURNAL
        </p>
        <h3 className="text-[1.16rem] font-extrabold leading-[1.85] tracking-tight text-ink sm:text-[1.28rem]">
          <Link
            href={`/posts/${post.slug}`}
            className="transition group-hover:text-forest"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-[13px] leading-7 text-muted">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line/80 pt-5 text-[11px] text-muted [margin-top:1.7rem]">
          <time
            className="inline-flex items-center gap-1.5"
            dateTime={post.publishedAt?.toISOString()}
          >
            <CalendarDays size={14} />{" "}
            {post.publishedAt?.toLocaleDateString("fa-IR")}
          </time>
          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex items-center gap-1 font-bold text-forest hover:text-white"
          >
            ادامهٔ مطلب <ArrowUpLeft size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function LeadStory({ post }: { post: PublicPostCard }) {
  return (
    <article className="group card-lift grid overflow-hidden rounded-[2rem] border border-[#506784]/75 bg-[#122035] md:grid-cols-[1fr_1.02fr]">
      <Link
        href={`/posts/${post.slug}`}
        className="relative block min-h-72 overflow-hidden md:min-h-[390px]"
        aria-label={`خواندن ${post.title}`}
      >
        <Artwork
          post={post}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="h-full min-h-72 w-full md:min-h-[390px]"
        />
        <span
          className="absolute bottom-5 right-5 rounded-full border border-white/30 bg-[#0b1425]/65 px-4 py-2 text-[10px] font-bold tracking-widest text-white backdrop-blur-xl"
          dir="ltr"
        >
          FEATURED / 001
        </span>
      </Link>
      <div className="relative flex flex-col justify-center overflow-hidden p-8 sm:p-11 lg:p-14">
        <div
          aria-hidden
          className="absolute -left-28 -bottom-28 h-72 w-72 rounded-full bg-[#5d47bb]/25 blur-[75px]"
        />
        <div className="relative">
          <span className="eyebrow">انتخابِ امروز</span>
          <p className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-rust">
            {post.categoryName ?? "یادداشت"}
            <span className="h-1 w-1 rounded-full bg-rust" />
            {post.publishedAt?.toLocaleDateString("fa-IR")}
          </p>
          <h3 className="mt-4 max-w-xl text-[clamp(1.8rem,3vw,2.65rem)] font-black leading-[1.7] text-ink">
            <Link
              href={`/posts/${post.slug}`}
              className="transition hover:text-forest"
            >
              {post.title}
            </Link>
          </h3>
          <p className="mt-5 line-clamp-3 max-w-md text-sm leading-8 text-muted">
            {post.excerpt}
          </p>
          <Link
            href={`/posts/${post.slug}`}
            className="button-outline mt-9 !border-forest/50 !text-forest"
          >
            این یادداشت را بخوان <ArrowUpLeft size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
