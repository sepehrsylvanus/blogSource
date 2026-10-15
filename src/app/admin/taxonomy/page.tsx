import { connection } from "next/server";
import { FolderOpen, Hash, Plus, Tags } from "lucide-react";
import { createTaxonomy } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

export default async function Taxonomy() {
  await connection();
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { posts: true } },
      },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { postTags: true } },
      },
    }),
  ]);
  const collections = [
    {
      kind: "category",
      label: "دسته‌بندی‌ها",
      description: "ستون‌های اصلی مجله را تعریف کن.",
      icon: FolderOpen,
      count: categories.length,
      items: categories.map(({ id, name, slug, _count }) => ({
        id,
        name,
        slug,
        posts: _count.posts,
      })),
    },
    {
      kind: "tag",
      label: "برچسب‌ها",
      description: "ارتباط‌های ظریف میان موضوع‌ها را بساز.",
      icon: Hash,
      count: tags.length,
      items: tags.map(({ id, name, slug, _count }) => ({
        id,
        name,
        slug,
        posts: _count.postTags,
      })),
    },
  ];
  return (
    <div>
      <span className="eyebrow">ORGANIZE / نظم در ایده‌ها</span>
      <h1 className="mt-3 text-[clamp(2rem,3.7vw,3.6rem)] font-black text-ink">
        دسته‌ها و <span className="gradient-type">برچسب‌ها.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-8 text-muted">
        با چند موضوع روشن، پیدا کردن هر یادداشت را برای خواننده ساده‌تر کن.
      </p>
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-2">
        {collections.map(
          ({ kind, label, description, icon: Icon, count, items }) => (
            <section key={kind} className="panel overflow-hidden">
              <div className="flex items-center gap-4 border-b border-line bg-[#16283a] px-6 py-6 sm:px-8">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#244159] text-forest">
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-forest">{label}</h2>
                  <p className="mt-1 text-xs text-muted">{description}</p>
                </div>
                <span className="mr-auto rounded-full bg-[#244159] px-3 py-1 text-xs font-extrabold text-forest">
                  {count.toLocaleString("fa-IR")}
                </span>
              </div>
              <div className="p-6 sm:p-8">
                <form action={createTaxonomy} className="grid gap-4">
                  <input type="hidden" name="kind" value={kind} />
                  <div>
                    <label htmlFor={`${kind}-name`} className="label">
                      نام فارسی
                    </label>
                    <input
                      id={`${kind}-name`}
                      name="name"
                      minLength={2}
                      maxLength={100}
                      required
                      placeholder={
                        kind === "tag"
                          ? "مثلاً تجربهٔ کاربری"
                          : "مثلاً طراحی محصول"
                      }
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${kind}-slug`} className="label">
                      نشانی انگلیسی
                    </label>
                    <input
                      id={`${kind}-slug`}
                      name="slug"
                      required
                      maxLength={80}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      dir="ltr"
                      placeholder={
                        kind === "tag" ? "user-experience" : "product-design"
                      }
                      className="field text-left"
                    />
                  </div>
                  <button type="submit" className="button-dark mt-1 w-full">
                    <Plus size={17} /> افزودن{" "}
                    {kind === "tag" ? "برچسب" : "دسته"}
                  </button>
                </form>
                <div className="mt-9 border-t border-line pt-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Tags size={16} className="text-rust" />
                    <h3 className="text-sm font-black text-ink">
                      {label} موجود
                    </h3>
                  </div>
                  {items.length ? (
                    <ul className="divide-y divide-line/60">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-forest">
                              {item.name}
                            </p>
                            <p
                              dir="ltr"
                              className="mt-1 truncate text-left text-[11px] text-muted"
                            >
                              /{item.slug}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-[#23354a] px-3 py-1 text-[11px] font-bold text-forest">
                            {item.posts.toLocaleString("fa-IR")} نوشته
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-xl border border-dashed border-line p-6 text-center text-xs leading-7 text-muted">
                      هنوز چیزی در این بخش نیست؛ اولین مورد را بساز.
                    </p>
                  )}
                </div>
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  );
}
