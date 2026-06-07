import { SITE } from "../lib/site";

const badges = [
  { label: "Open source", value: `${SITE.license} License` },
  { label: "Backend", value: "Rust · Axum" },
  { label: "Desktop", value: "Tauri v2" },
  { label: "Storage", value: "Local SQLite" },
];

export function TrustBar() {
  return (
    <section className="border-b border-stone-200 bg-stone-50 py-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-6">
        {badges.map((badge) => (
          <span
            key={badge.label}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs text-stone-600 shadow-soft"
          >
            <span className="font-medium text-stone-800">{badge.label}</span>
            <span className="text-stone-300">·</span>
            <span>{badge.value}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
