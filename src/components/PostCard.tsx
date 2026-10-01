import Link from "next/link";
import { Eye, Clock3, Heart } from "lucide-react";
import type { Post } from "@/lib/types";
import { formatDateFa, num } from "@/lib/markdown";
import { GenerativeCover } from "@/components/GenerativeCover";

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_24px_60px_-30px_rgba(255,90,54,0.35)]"
    >
      <div className="relative aspect-[2/1] overflow-hidden">
        <GenerativeCover
          seed={post.slug}
          glyph={post.tags[0]?.slice(0, 2).toUpperCase() ?? "SD"}
          className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        {post.featured && (
          <span className="absolute start-3 top-3 rounded-full border border-ember/50 bg-ink/80 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-ember backdrop-blur">
            ویژه
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {post.author && (
            <span className="me-1 flex items-center gap-1.5 text-[10px] text-faint">
              <span className="grid size-4.5 place-items-center rounded-md bg-ember/15 text-[9px] font-black text-ember">
                {post.author.name.trim().charAt(0)}
              </span>
              {post.author.name}
            </span>
          )}
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-ink-3 px-2 py-0.5 font-mono text-[10px] text-mute"
              dir="ltr"
            >
              #{tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-bold leading-8 text-paper transition-colors group-hover:text-ember-2">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-7 text-mute">{post.excerpt}</p>
        <div className="mt-auto flex items-center gap-4 pt-3 font-mono text-[11px] text-faint">
          <span className="flex items-center gap-1">
            <Clock3 className="size-3" />
            {post.readingTime} دقیقه
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            <span dir="ltr">{num(post.views)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Heart className="size-3" />
            <span dir="ltr">{num(post.claps)}</span>
          </span>
          <span className="ms-auto">{priority ? "" : formatDateFa(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
