import { DownloadButton } from "./DownloadButton";
import { usePrimaryDownload } from "../hooks/usePrimaryDownload";
import { formatBytes, matchAsset, PLATFORMS, SITE } from "../lib/site";

export function DownloadSection() {
  const {
    loading,
    release,
    platform,
    platformMeta,
    isDirectDownload,
    downloadUrl,
    releasesUrl,
  } = usePrimaryDownload();

  return (
    <section id="download" className="border-t border-white/5 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Get KathGPT on your desktop
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            One click below — macOS, Windows, or Linux. Free and open source.
          </p>
        </div>

        <div className="mx-auto mt-10 flex flex-col items-center">
          <DownloadButton size="lg" showMeta className="w-full max-w-md" />
          {!loading && !isDirectDownload && (
            <p className="mt-4 max-w-md text-center text-sm text-slate-400">
              Opens GitHub Releases for <strong className="text-slate-300">{platformMeta.shortLabel}</strong>.
              {release ? " Pick your installer file there." : " v0.1.0 installers publish here after CI completes."}
            </p>
          )}
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {PLATFORMS.map((p) => {
            const asset = release ? matchAsset(release.assets, p.id) : null;
            const href = asset?.browser_download_url ?? releasesUrl;
            const isCurrent = p.id === platform;

            return (
              <a
                key={p.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between rounded-xl border px-5 py-4 text-sm transition ${
                  isCurrent
                    ? "border-indigo-500/50 bg-indigo-500/15 text-white ring-1 ring-indigo-500/30"
                    : "border-white/10 bg-slate-900/40 text-slate-200 hover:border-indigo-500/30 hover:bg-slate-900/60"
                }`}
              >
                <span className="font-semibold">{p.label}</span>
                {asset ? (
                  <span className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                    Download · {formatBytes(asset.size)}
                  </span>
                ) : (
                  <span className="rounded-lg border border-white/10 px-3 py-1 text-xs font-medium text-indigo-300">
                    Get on GitHub →
                  </span>
                )}
              </a>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-xl text-center">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-400 underline-offset-2 hover:underline"
          >
            View all releases on GitHub →
          </a>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-white/5 bg-slate-900/30 p-6">
          <h3 className="font-semibold text-white">System requirements</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <strong className="text-slate-300">macOS:</strong> 11+ (Apple Silicon or Intel)
            </li>
            <li>
              <strong className="text-slate-300">Windows:</strong> 10+ (64-bit)
            </li>
            <li>
              <strong className="text-slate-300">Linux:</strong> Ubuntu 20.04+ with WebKitGTK
            </li>
            <li>
              <strong className="text-slate-300">API key:</strong> OpenRouter recommended
            </li>
          </ul>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Open source · {SITE.license}.{" "}
          <a
            href={`https://github.com/${SITE.githubRepo}/blob/main/README.md`}
            className="text-indigo-400 hover:underline"
          >
            Build from source
          </a>
        </p>
      </div>
    </section>
  );
}
