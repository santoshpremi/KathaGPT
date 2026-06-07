import { DownloadButton } from "./DownloadButton";
import { ProviderStrip } from "./ProviderStrip";
import { SITE } from "../lib/site";

export function Hero() {
  return (
    <section className="border-b border-stone-200 bg-white pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">Open source desktop app</p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-stone-900 sm:text-5xl md:text-6xl lg:text-[4.5rem] lg:leading-[1.04]">
            Private AI workspace,
            <br />
            built for your desktop
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl md:leading-8">
            {SITE.description}
          </p>

          <ProviderStrip variant="hero" />

          <div className="mt-10 flex justify-center">
            <DownloadButton size="lg" showMeta className="min-w-[260px]" />
          </div>

          <p className="mt-6 text-sm text-stone-500">
            macOS · Windows · Linux · {SITE.license} License
          </p>
        </div>
      </div>
    </section>
  );
}
