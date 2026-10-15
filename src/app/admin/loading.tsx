export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-label="در حال بارگذاری پنل"
      className="animate-pulse space-y-7"
    >
      <div className="h-36 rounded-[1.6rem] border border-line bg-[#172b40]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-36 rounded-[1.3rem] border border-line bg-[#162338]"
          />
        ))}
      </div>
      <div className="h-72 rounded-[1.3rem] border border-line bg-[#142135]" />
      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  );
}
