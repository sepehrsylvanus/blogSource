import { describe, expect, it } from "vitest";
import {
  escapeXml,
  postSchema,
  safePage,
  slugSchema,
} from "../src/lib/validation";

describe("blog input", () => {
  it("accepts clean slugs and rejects unsafe ones", () => {
    expect(slugSchema.safeParse("my-first-post").success).toBe(true);
    expect(slugSchema.safeParse("../secret").success).toBe(false);
    expect(slugSchema.safeParse("White Space").success).toBe(false);
  });
  it("never accepts a public remote cover URL", () => {
    const post = {
      id: "",
      title: "عنوان مقاله",
      slug: "first-post",
      excerpt: "خلاصهٔ مناسب برای مقاله و صفحهٔ اصلی",
      body: "متن کافی برای آزمون اعتبارسنجی یک مقاله کامل.",
      status: "draft",
      categoryId: "",
      tagIds: [],
      coverPath: "https://evil.test/image.svg",
      seoTitle: "",
      seoDescription: "",
    };
    expect(postSchema.safeParse(post).success).toBe(false);
  });
  it("bounds page numbers", () => {
    expect(safePage("oops")).toBe(1);
    expect(safePage("-1")).toBe(1);
    expect(safePage("100000")).toBe(1000);
  });
  it("escapes RSS content", () => {
    expect(escapeXml(`<script>"&`)).toBe("&lt;script&gt;&quot;&amp;");
  });
});
