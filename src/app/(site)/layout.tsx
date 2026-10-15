import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div id="content">{children}</div>
      <SiteFooter />
    </>
  );
}
