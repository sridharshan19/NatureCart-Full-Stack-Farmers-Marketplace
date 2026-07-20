const CATEGORIES = [
  "All",
  "Vegetables",
  "Fruits",
  "Organic Dairy",
  "Grains",
  "Honey & Preserves",
  "Spices & Herbs",
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
];

export default function ProductFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  inStockOnly,
  onInStockChange,
  onReset,
}) {
  return (
    <div className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-xl">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search produce, categories, or local farms..."
            className="w-full rounded-full border border-slate-200 bg-slate-50/70 pl-10 pr-10 py-2.5 text-sm text-slate-800 shadow-inner outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-bold transition flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Controls: Sort & Stock Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-teal-600 focus:bg-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onInStockChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>In Stock Only</span>
          </label>

          {(search || category !== "All" || sort !== "newest" || inStockOnly) && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full bg-rose-50 border border-rose-100 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Category:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-[linear-gradient(135deg,#1f7a5c_0%,#bf6c2f_100%)] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

