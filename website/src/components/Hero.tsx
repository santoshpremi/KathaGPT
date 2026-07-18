import { DownloadButton } from "./DownloadButton";
import { SITE } from "../lib/site";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] border-b border-stone-900/40">
      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-6 py-28 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Open source desktop app
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] sm:text-5xl md:text-6xl lg:text-[4.25rem] lg:leading-[1.05]">
            Private AI workspace,
            <br />
            built for your desktop
          </h1>

          <div className="mt-10 flex justify-center">
            <DownloadButton size="lg" showMeta className="min-w-[260px]" />
          </div>

          <p className="mt-6 text-sm text-stone-400 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            macOS · Windows · Linux · {SITE.license} License · Local models need
            no API key
          </p>
        </div>
      </div>
    </section>
  );
}
