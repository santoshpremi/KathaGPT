import { MODEL_PROVIDERS } from "../lib/providers";

interface ProviderStripProps {
  variant?: "hero" | "section";
}

export function ProviderStrip({ variant = "section" }: ProviderStripProps) {
  const isHero = variant === "hero";

  if (isHero) {
    return (
      <p
        className="mt-10 text-base text-stone-600 md:text-lg"
        aria-label="Supported model providers"
      >
        {MODEL_PROVIDERS.map((provider, index) => (
          <span key={provider.id}>
            <span
              className={
                provider.id === "others"
                  ? "text-stone-400"
                  : "font-medium text-stone-800"
              }
            >
              {provider.label}
            </span>
            {index < MODEL_PROVIDERS.length - 1 && (
              <span className="mx-2 text-stone-300" aria-hidden>
                /
              </span>
            )}
          </span>
        ))}
      </p>
    );
  }

  return (
    <div>
      <p className="mb-6 text-center text-sm text-stone-500">
        Bring your own API key — connect any provider you already use
      </p>

      <div
        className="flex flex-wrap items-center justify-center gap-2"
        aria-label="Supported model providers"
      >
        {MODEL_PROVIDERS.map((provider) => (
          <span
            key={provider.id}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              provider.id === "others"
                ? "border-stone-200 bg-stone-50 text-stone-500"
                : "border-stone-200 bg-white text-stone-800 shadow-soft"
            }`}
          >
            {provider.label}
          </span>
        ))}
      </div>
    </div>
  );
}
