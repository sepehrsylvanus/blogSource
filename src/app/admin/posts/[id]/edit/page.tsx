import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowRight, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/post-editor";
import { StatusBadge } from "@/components/status-badge";
import { getCategories, getTags } from "@/lib/queries";

export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [post, categories, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { postTags: { select: { tagId: true } } },
    }),
    getCategories(),
    getTags(),
  ]);
  if (!post) notFound();
  return (
    <div>
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-forest"
      >
        <ArrowRight size={16} /> همهٔ نوشته‌ها
      </Link>
      <div className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">EDITORIAL WORKSPACE / ویرایش</span>
          <h1 className="mt-3 text-[clamp(2rem,3.7vw,3.6rem)] font-black text-ink">
            ویرایش <span className="gradient-type">یادداشت.</span>
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge status={post.status} />
            <span className="text-xs text-muted">
              آخرین ویرایش {post.updatedAt.toLocaleDateString("fa-IR")}
            </span>
          </div>
        </div>
        <Link
          href={`/admin/posts/${post.id}/preview`}
          className="button-outline"
        >
          <Eye size={17} /> پیش‌نمایش
        </Link>
      </div>
      <PostEditor
        post={post}
        categories={categories}
        tags={tags}
        selectedTagIds={post.postTags.map((tag) => tag.tagId)}
      />
    </div>
  );
}
