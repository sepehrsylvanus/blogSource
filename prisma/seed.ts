import { config } from "dotenv";
config({ path: ".env", quiet: true });

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  try {
    for (const category of [
      { name: "عمومی", slug: "general" },
      { name: "توسعهٔ وب", slug: "web-development" },
      { name: "طراحی", slug: "design" },
      { name: "محصول", slug: "product" },
    ]) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        create: category,
        update: {},
      });
    }

    for (const tag of [
      { name: "Next.js", slug: "nextjs" },
      { name: "آموزش", slug: "tutorial" },
      { name: "Prisma", slug: "prisma" },
      { name: "رابط کاربری", slug: "ui" },
      { name: "نوشتن", slug: "writing" },
    ]) {
      await prisma.tag.upsert({
        where: { slug: tag.slug },
        create: tag,
        update: {},
      });
    }

    console.log("Sample categories and tags ready");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
