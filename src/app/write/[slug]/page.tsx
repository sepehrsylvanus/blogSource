import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FilePenLine } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPostForEdit, getTags } from "@/lib/data";
import { PostEditor } from "@/components/editor/PostEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "ویرایش نوشته" };

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser(`/write/${slug}`);
  const [post, tags] = await Promise.all([getPostForEdit(slug), getTags()]);

  if (!post) notFound();
  if (user.role !== "admin" && post.authorId !== user.id) redirect("/studio");

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-faint" dir="ltr">
            <FilePenLine className="size-3.5 text-ember" />
            STUDIO ~ /edit/{slug}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">ویرایش نوشته</h1>
        </div>
        <p className="font-mono text-xs text-faint" dir="ltr">
          slug قفل است: {slug}
        </p>
      </div>

      <PostEditor post={post} tagSuggestions={tags.map((t) => t.name)} />
    </div>
  );
}
