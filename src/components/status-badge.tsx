export function StatusBadge({
  status,
}: {
  status: "draft" | "published" | "archived";
}) {
  const styles = {
    published: "border-[#477b79] bg-[#173b40] text-[#a9f9e9]",
    draft: "border-[#775d9a] bg-[#322746] text-[#ddc6ff]",
    archived: "border-[#50627c] bg-[#253247] text-[#cfdeef]",
  };
  const labels = {
    published: "منتشرشده",
    draft: "پیش‌نویس",
    archived: "بایگانی",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold ${styles[status]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {labels[status]}
    </span>
  );
}
