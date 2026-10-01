import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Crown, Eye, FileText, Heart } from "lucide-react";
import { getAuthorPublic, getPostsByAuthor } from "@/lib/data";
import { formatDateFa, num } from "@/lib/markdown";
import { PostCard } from "@/components/PostCard";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const author = await getAuthorPublic(username);
  if (!author) return { title: "نویسنده یافت نشد" };
  return { title: `${author.user.name} — نویسنده` };
}

export default async function AuthorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const author = await getAuthorPublic(username);
  if (!author) notFound();

  const posts = await getPostsByAuthor(author.user.id, false);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-line bg-ink-2 p-7 sm:p-9">
          <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-ember to-ember-2 text-3xl font-black text-ink sm:size-24">
            {author.user.name.trim().charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-black">{author.user.name}</h1>
              {author.user.role === "admin" && (
                <span className="flex items-center gap-1 rounded-full border border-ember-2/40 bg-ember-2/10 px-2.5 py-1 text-[10px] font-bold text-ember-2">
                  <Crown className="size-3" />
                  مدیر بلاگ
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-sm text-faint" dir="ltr">@{author.user.username}</p>
            {author.user.bio && (
              <p className="mt-3 max-w-lg text-sm leading-7 text-mute">{author.user.bio}</p>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-faint">
              <CalendarDays className="size-3.5" />
              عضو از {formatDateFa(author.user.createdAt)}
            </p>
          </div>
          <dl className="flex gap-6 border-s border-line ps-6">
            {[
              { label: "نوشته", value: author.stats.posts, icon: FileText },
              { label: "بازدید", value: author.stats.views, icon: Eye },
              { label: "تشویق", value: author.stats.claps, icon: Heart },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <dd className="flex items-center justify-center gap-1.5 font-mono text-2xl font-bold text-paper" dir="ltr">
                  {num(s.value)}
                </dd>
                <dt className="mt-1 text-[11px] text-faint">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      <h2 className="mt-14 mb-8 text-2xl font-black">نوشته‌های {author.user.name}</h2>
      {posts.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line py-16 text-center text-sm text-mute">
          هنوز نوشته‌ای منتشر نکرده — ولی حتماً در راه است.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={(i % 3) * 0.08}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
