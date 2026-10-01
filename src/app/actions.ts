"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addClap,
  addSubscriber,
  createPostForUser,
  createUser,
  deletePostForUser,
  getUserByEmail,
  getUserByUsername,
  updatePostForUser,
} from "@/lib/data";
import { createSession, destroySession, getCurrentUser, requireUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/passwords";

/* --------------------------------- claps ---------------------------------- */

export async function clapAction(slug: string): Promise<{ claps: number }> {
  const claps = await addClap(slug);
  return { claps };
}

/* ------------------------------- newsletter -------------------------------- */

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "ایمیل معتبر نیست" }));

export type SubscribeState = { status: "idle" | "ok" | "duplicate" | "error"; message: string };

export async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { status: "error", message: "ایمیل معتبر نیست — یک نگاه دوباره بینداز" };
  }
  try {
    const result = await addSubscriber(parsed.data);
    if (result === "duplicate") {
      return { status: "duplicate", message: "این ایمیل قبلاً عضو شده — قول می‌دم اسپم نکنم" };
    }
    revalidatePath("/");
    return { status: "ok", message: "عضویتت ثبت شد؛ به خبرنامه‌ی سانی خوش آمدی" };
  } catch {
    return { status: "error", message: "یک خطای غیرمنتظره رخ داد؛ دوباره امتحان کن" };
  }
}

/* ---------------------------------- auth ----------------------------------- */

export type AuthState = { status: "idle" | "error"; message: string };

const registerSchema = z.object({
  name: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد").max(40),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z][a-z0-9_-]{2,19}$/, "نام کاربری: لاتین، ۳ تا ۲۰ کاراکتر، شروع با حرف"),
  email: z.string().trim().toLowerCase().pipe(z.email("ایمیل معتبر نیست")),
  password: z.string().min(8, "رمز باید حداقل ۸ کاراکتر باشد").max(72),
});

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است" };
  }

  const data = parsed.data;
  if (await getUserByEmail(data.email)) {
    return { status: "error", message: "این ایمیل قبلاً ثبت شده — وارد شو" };
  }
  if (await getUserByUsername(data.username)) {
    return { status: "error", message: "این نام کاربری گرفته شده — یکی دیگه انتخاب کن" };
  }

  const user = await createUser({
    name: data.name,
    username: data.username,
    email: data.email,
    passwordHash: hashPassword(data.password),
  });
  await createSession(user.id);
  redirect("/studio?welcome=1");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("ایمیل معتبر نیست")),
  password: z.string().min(1, "رمز را وارد کن"),
});

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است" };
  }

  const user = await getUserByEmail(parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    // پیام عمداً کلی است — نمی‌خواهیم بگوییم کدام‌یک غلط بود.
    return { status: "error", message: "ایمیل یا رمز اشتباه است" };
  }

  await createSession(user.id);
  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/studio");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

/* ------------------------------- write posts ------------------------------- */

export type SavePostState = { status: "idle" | "error"; message: string };

const tagsSchema = z
  .string()
  .trim()
  .max(160)
  .transform((raw) =>
    [...new Set(raw.split(",").map((t) => t.trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean))].slice(0, 5),
  );

const savePostSchema = z.object({
  title: z.string().trim().min(4, "عنوان حداقل ۴ حرف").max(140, "عنوان خیلی بلند است"),
  excerpt: z.string().trim().min(10, "چکیده حداقل ۱۰ حرف").max(280, "چکیده حداکثر ۲۸۰ حرف"),
  content: z.string().trim().min(50, "متن باید حداقل ۵۰ کاراکتر باشد"),
  tags: tagsSchema,
  slug: z.string().trim().toLowerCase().max(80),
  intent: z.enum(["draft", "publish"]),
});

type PostFormData = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  slug: string;
  status: "draft" | "published";
};
type PostFormResult = { ok: true; data: PostFormData } | { ok: false; error: string };

function parsePostForm(formData: FormData): PostFormResult {
  const parsed = savePostSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    tags: formData.get("tags") ?? "",
    slug: formData.get("slug") ?? "",
    intent: formData.get("intent") === "publish" ? "publish" : "draft",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است" };
  }
  const { intent, slug, ...rest } = parsed.data;
  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, error: "اسلاگ فقط حروف لاتین، عدد و خط تیره" };
  }
  return {
    ok: true,
    data: { ...rest, slug, status: intent === "publish" ? "published" : "draft" },
  };
}

export async function savePostAction(_prev: SavePostState, formData: FormData): Promise<SavePostState> {
  const user = await requireUser("/write");
  const parsed = parsePostForm(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const editing = formData.get("editing");
  if (typeof editing === "string" && editing.length > 0) {
    const result = await updatePostForUser(editing, user, parsed.data);
    if (result === "forbidden") return { status: "error", message: "این نوشته مال تو نیست" };
    if (result === "missing") return { status: "error", message: "نوشته پیدا نشد" };
    revalidatePath("/studio");
    revalidatePath(`/posts/${editing}`);
    redirect(parsed.data.status === "published" ? `/posts/${editing}` : "/studio?saved=1");
  }

  const slug = await createPostForUser(user, parsed.data);
  revalidatePath("/studio");
  redirect(parsed.data.status === "published" ? `/posts/${slug}` : "/studio?saved=1");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const slug = formData.get("slug");
  if (!user || typeof slug !== "string") redirect("/login");
  await deletePostForUser(slug, user);
  revalidatePath("/studio");
  redirect("/studio?deleted=1");
}
