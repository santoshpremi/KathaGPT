import { usePrimaryDownload } from "../hooks/usePrimaryDownload";
import { formatBytes } from "../lib/site";

interface DownloadButtonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showMeta?: boolean;
}

export function DownloadButton({
  size = "md",
  className = "",
  showMeta = false,
}: DownloadButtonProps) {
  const { loading, platformMeta, downloadUrl, isDirectDownload, fileName, fileSize } =
    usePrimaryDownload();

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg",
  }[size];

  const label = loading
    ? "Download"
    : isDirectDownload
      ? `Download for ${platformMeta.shortLabel}`
      : `Download for ${platformMeta.shortLabel}`;

  return (
    <div className={className}>
      <a
        href={loading ? undefined : downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 hover:shadow-indigo-500/40 ${sizeClasses} ${loading ? "pointer-events-none opacity-70" : ""}`}
      >
        <DownloadIcon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
        {label}
      </a>
      {showMeta && isDirectDownload && fileName && (
        <p className="mt-2 text-center text-xs text-slate-400">
          {fileName}
          {fileSize ? ` · ${formatBytes(fileSize)}` : ""}
        </p>
      )}
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
